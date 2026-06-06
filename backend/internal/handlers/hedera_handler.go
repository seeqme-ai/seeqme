package handlers

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"seeqmeai/backend/internal/database"
)

// ─── x402 types ──────────────────────────────────────────────────────────────

type x402PaymentRequirements struct {
	Scheme             string                 `json:"scheme"`
	Network            string                 `json:"network"`
	MaxAmountRequired  string                 `json:"maxAmountRequired"`
	Resource           string                 `json:"resource"`
	Description        string                 `json:"description"`
	MimeType           string                 `json:"mimeType"`
	PayTo              string                 `json:"payTo"`
	MaxTimeoutSeconds  int                    `json:"maxTimeoutSeconds"`
	Asset              string                 `json:"asset"`
	Extra              map[string]interface{} `json:"extra"`
}

type x402Response struct {
	X402Version int                       `json:"x402Version"`
	Accepts     []x402PaymentRequirements `json:"accepts"`
	Error       string                    `json:"error"`
}

type x402PaymentPayload struct {
	X402Version int    `json:"x402Version"`
	Scheme      string `json:"scheme"`
	Network     string `json:"network"`
	Payload     struct {
		TransactionID      string `json:"transactionId,omitempty"`     // native HBAR: "0.0.X@sec.nano"
		EvmTransactionHash string `json:"evmTransactionHash,omitempty"` // MetaMask: "0x..."
		Payer              string `json:"payer"`
	} `json:"payload"`
}

// ─── MongoDB record ───────────────────────────────────────────────────────────

type HederaPayment struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	EncodedPayment string             `bson:"encodedPayment"`
	TxRef          string             `bson:"txRef"` // transactionId or evmTransactionHash
	UserID         primitive.ObjectID `bson:"userId"`
	PlanID         string             `bson:"planId"`   // e.g. "pro", "premium"
	AmountHbar     float64            `bson:"amountHbar"` // HBAR paid (displayed amount)
	Used           bool               `bson:"used"`
	CreatedAt      time.Time          `bson:"createdAt"`
	ExpiresAt      time.Time          `bson:"expiresAt"`
}

// ─── Live HBAR/NGN exchange rate (CoinGecko, 5-min cache) ────────────────────

var hbarRateCache struct {
	sync.RWMutex
	rate      float64
	expiresAt time.Time
}

const (
	hbarRateCacheTTL   = 5 * time.Minute
	hbarRateFallbackNGN = 150.0 // conservative fallback: 1 HBAR ≈ ₦150
)

func fetchLiveHbarNgnRate() (float64, error) {
	hbarRateCache.RLock()
	if time.Now().Before(hbarRateCache.expiresAt) && hbarRateCache.rate > 0 {
		rate := hbarRateCache.rate
		hbarRateCache.RUnlock()
		return rate, nil
	}
	hbarRateCache.RUnlock()

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Get("https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=ngn")
	if err != nil {
		return 0, fmt.Errorf("CoinGecko unreachable: %w", err)
	}
	defer resp.Body.Close()

	var result map[string]map[string]float64
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, fmt.Errorf("rate parse error: %w", err)
	}
	rate := result["hedera-hashgraph"]["ngn"]
	if rate <= 0 {
		return 0, fmt.Errorf("invalid rate returned by CoinGecko")
	}

	hbarRateCache.Lock()
	hbarRateCache.rate = rate
	hbarRateCache.expiresAt = time.Now().Add(hbarRateCacheTTL)
	hbarRateCache.Unlock()

	log.Printf("[Hedera] HBAR/NGN rate refreshed: %.4f NGN/HBAR", rate)
	return rate, nil
}

// hbarNgnRate returns the live rate, falling back to the hardcoded constant on failure.
func hbarNgnRate() (float64, bool) {
	rate, err := fetchLiveHbarNgnRate()
	if err != nil {
		log.Printf("[Hedera] Rate fetch failed (%v) — using fallback %.2f NGN/HBAR", err, hbarRateFallbackNGN)
		return hbarRateFallbackNGN, false
	}
	return rate, true
}

// ─── Plan price lookup ────────────────────────────────────────────────────────

// planNgnPrice returns the NGN price for a plan from system_config (or hardcoded defaults).
func planNgnPrice(planID string) int {
	db := database.Client.Database(database.DBName)
	var cfg SystemConfig
	if err := db.Collection("system_config").FindOne(context.Background(), bson.M{}).Decode(&cfg); err == nil {
		for _, p := range cfg.PricingPlans {
			if strings.EqualFold(p.ID, planID) {
				return p.Price.NGN
			}
		}
	}
	// Hardcoded fallback matching defaultPricingPlans()
	switch strings.ToLower(planID) {
	case "premium":
		return 5000
	default:
		return 2000 // pro is the default pay-per-deploy tier
	}
}

// hbarForPlan computes how much HBAR equals the plan's NGN price at the live rate.
// Rounds UP to 2 decimal places so the user always covers the full NGN amount.
func hbarForPlan(planID string) (amountHbar float64, amountNgn int, rate float64, liveRate bool) {
	amountNgn = planNgnPrice(planID)
	rate, liveRate = hbarNgnRate()
	// Round up to nearest 0.01 HBAR to ensure full coverage
	raw := float64(amountNgn) / rate
	amountHbar = math.Ceil(raw*100) / 100
	return
}

// ─── Config endpoint ──────────────────────────────────────────────────────────

func (h *Handler) GetHederaConfig(c *gin.Context) {
	planID := c.Query("plan")
	if planID == "" {
		planID = "pro"
	}

	amountHbar, amountNgn, rate, liveRate := hbarForPlan(planID)

	resp := gin.H{
		"recipientAccountId":  h.Config.HederaPaymentAccountId,
		"recipientEvmAddress": h.Config.HederaPaymentEvmAddress,
		"amountHbar":          amountHbar,
		"amountNgn":           amountNgn,
		"hbarNgnRate":         rate,
		"network":             h.Config.HederaNetwork,
		"planId":              planID,
		"liveRate":            liveRate,
		"rateSource":          map[bool]string{true: "coingecko", false: "fallback"}[liveRate],
		"rateRefreshSeconds":  int(hbarRateCacheTTL.Seconds()),
	}
	c.JSON(http.StatusOK, resp)
}

// ─── Verify payment endpoint ──────────────────────────────────────────────────

type VerifyHederaPaymentRequest struct {
	EncodedPayment string `json:"encodedPayment" binding:"required"`
	PlanID         string `json:"planId"` // "pro" or "premium"
}

// VerifyHederaPayment validates a base64-encoded x402 payment receipt.
// The amount is verified against the live HBAR/NGN rate for the given plan, with 30% tolerance.
func (h *Handler) VerifyHederaPayment(c *gin.Context) {
	var req VerifyHederaPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "encodedPayment is required"})
		return
	}
	if req.PlanID == "" {
		req.PlanID = "pro"
	}

	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}
	userIDObj, err := primitive.ObjectIDFromHex(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Decode the x402 payment payload
	decoded, err := decodeX402Payment(req.EncodedPayment)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid payment payload: %v", err)})
		return
	}

	txRef := decoded.Payload.TransactionID
	if txRef == "" {
		txRef = decoded.Payload.EvmTransactionHash
	}

	// Prevent replay: check if this payment was already stored
	coll := database.Client.Database(database.DBName).Collection("hedera_payments")
	var existing HederaPayment
	if err := coll.FindOne(context.Background(), bson.M{"txRef": txRef}).Decode(&existing); err == nil {
		if existing.Used {
			c.JSON(http.StatusConflict, gin.H{"error": "This transaction has already been used for a deployment"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "amountHbar": existing.AmountHbar, "planId": existing.PlanID})
		return
	}

	// Compute the minimum acceptable HBAR for this plan at the live rate.
	// Apply 30% tolerance to handle rate drift between when the user saw the price and when they paid.
	displayHbar, ngnAmount, rate, _ := hbarForPlan(req.PlanID)
	minHbar := math.Floor((float64(ngnAmount)/rate)*0.70*1e8) / 1e8

	log.Printf("[Hedera] Verifying payment — plan=%s displayHbar=%.4f minHbar=%.4f rate=%.4f txRef=%s",
		req.PlanID, displayHbar, minHbar, rate, txRef)

	// Build payment requirements for blocky402 verification
	reqs := h.buildPaymentRequirements(c.Request.Host, displayHbar)

	// Verify via blocky402.com → Mirror Node fallback
	if err := h.verifyX402Payment(req.EncodedPayment, decoded, reqs, minHbar); err != nil {
		log.Printf("[Hedera] Payment verification failed for %s: %v", txRef, err)
		c.JSON(http.StatusPaymentRequired, gin.H{"error": err.Error()})
		return
	}

	// Store the verified payment record (expires in 30 minutes)
	payment := HederaPayment{
		ID:             primitive.NewObjectID(),
		EncodedPayment: req.EncodedPayment,
		TxRef:          txRef,
		UserID:         userIDObj,
		PlanID:         req.PlanID,
		AmountHbar:     displayHbar,
		Used:           false,
		CreatedAt:      time.Now(),
		ExpiresAt:      time.Now().Add(30 * time.Minute),
	}
	if _, err := coll.InsertOne(context.Background(), payment); err != nil {
		log.Printf("[Hedera] Failed to store payment record: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record payment"})
		return
	}

	log.Printf("[Hedera] Payment verified — user=%s plan=%s hbar=%.4f txRef=%s", userID, req.PlanID, displayHbar, txRef)
	c.JSON(http.StatusOK, gin.H{"success": true, "amountHbar": displayHbar, "planId": req.PlanID})
}

// ─── ConsumeHederaPayment — called by DeployPortfolio ────────────────────────

// ConsumeHederaPayment checks the X-Hedera-Payment header, validates the stored record,
// marks it consumed, and returns true if deployment should be allowed.
func ConsumeHederaPayment(c *gin.Context, userIDObj primitive.ObjectID) bool {
	encoded := strings.TrimSpace(c.GetHeader("X-Hedera-Payment"))
	if encoded == "" {
		return false
	}

	decoded, err := decodeX402Payment(encoded)
	if err != nil {
		log.Printf("[Hedera] Cannot decode payment header: %v", err)
		return false
	}
	txRef := decoded.Payload.TransactionID
	if txRef == "" {
		txRef = decoded.Payload.EvmTransactionHash
	}

	coll := database.Client.Database(database.DBName).Collection("hedera_payments")
	var payment HederaPayment
	if err := coll.FindOne(context.Background(), bson.M{
		"txRef":  txRef,
		"userId": userIDObj,
		"used":   false,
	}).Decode(&payment); err != nil {
		log.Printf("[Hedera] No valid payment record — txRef=%s userId=%s", txRef, userIDObj.Hex())
		return false
	}

	if time.Now().After(payment.ExpiresAt) {
		log.Printf("[Hedera] Payment record expired — txRef=%s", txRef)
		return false
	}

	// Atomically mark as consumed
	_, _ = coll.UpdateOne(context.Background(),
		bson.M{"_id": payment.ID},
		bson.M{"$set": bson.M{"used": true, "usedAt": time.Now()}},
	)
	log.Printf("[Hedera] Payment consumed — txRef=%s plan=%s hbar=%.4f", txRef, payment.PlanID, payment.AmountHbar)
	return true
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func (h *Handler) buildPaymentRequirements(host string, amountHbar float64) x402PaymentRequirements {
	tinybars := int64(amountHbar * 1e8)
	return x402PaymentRequirements{
		Scheme:            "exact",
		Network:           fmt.Sprintf("hedera-%s", h.Config.HederaNetwork),
		MaxAmountRequired: fmt.Sprintf("%d", tinybars),
		Resource:          fmt.Sprintf("https://%s/api/v1/deployment/deploy", host),
		Description:       fmt.Sprintf("Deploy AI portfolio — %.2f HBAR", amountHbar),
		MimeType:          "application/json",
		PayTo:             h.Config.HederaPaymentAccountId,
		MaxTimeoutSeconds: 300,
		Asset:             "HBAR",
		Extra:             map[string]interface{}{"decimals": 8, "name": "HBAR"},
	}
}

func decodeX402Payment(encoded string) (*x402PaymentPayload, error) {
	raw, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		raw, err = base64.URLEncoding.DecodeString(encoded)
		if err != nil {
			return nil, fmt.Errorf("base64 decode failed: %w", err)
		}
	}
	var p x402PaymentPayload
	if err := json.Unmarshal(raw, &p); err != nil {
		return nil, fmt.Errorf("JSON unmarshal failed: %w", err)
	}
	return &p, nil
}

func (h *Handler) verifyX402Payment(
	encodedPayment string,
	decoded *x402PaymentPayload,
	reqs x402PaymentRequirements,
	minAmountHbar float64,
) error {
	// 1. Try blocky402.com facilitator first
	facilitatorURL := "https://blocky402.com"
	if err := verifyViaBlocky402(encodedPayment, reqs, facilitatorURL); err == nil {
		return nil
	} else {
		log.Printf("[Hedera] blocky402 verification failed (%v), falling back to Mirror Node", err)
	}

	// 2. Direct Mirror Node verification
	if txRef := decoded.Payload.TransactionID; txRef != "" {
		return verifyNativeTxMirrorNode(txRef, h.Config.HederaPaymentAccountId, minAmountHbar, h.Config.HederaNetwork)
	}
	if evmHash := decoded.Payload.EvmTransactionHash; evmHash != "" {
		return verifyEvmTxMirrorNode(evmHash, h.Config.HederaPaymentEvmAddress, minAmountHbar, h.Config.HederaNetwork)
	}
	return fmt.Errorf("payment payload has no transactionId or evmTransactionHash")
}

// ─── blocky402.com facilitator ────────────────────────────────────────────────

type blocky402Request struct {
	Payment             string                  `json:"payment"`
	PaymentRequirements x402PaymentRequirements `json:"paymentRequirements"`
}

type blocky402Response struct {
	IsValid       bool   `json:"isValid"`
	InvalidReason string `json:"invalidReason,omitempty"`
}

func verifyViaBlocky402(encodedPayment string, reqs x402PaymentRequirements, facilitatorURL string) error {
	body, _ := json.Marshal(blocky402Request{
		Payment:             encodedPayment,
		PaymentRequirements: reqs,
	})
	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Post(facilitatorURL+"/facilitate", "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("blocky402 unreachable: %w", err)
	}
	defer resp.Body.Close()

	var result blocky402Response
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("blocky402 response parse error: %w", err)
	}
	if !result.IsValid {
		return fmt.Errorf("blocky402 rejected payment: %s", result.InvalidReason)
	}
	return nil
}

// ─── Hedera Mirror Node verification ─────────────────────────────────────────

func mirrorNodeBase(network string) string {
	if network == "mainnet" {
		return "https://mainnet-public.mirrornode.hedera.com"
	}
	return "https://testnet.mirrornode.hedera.com"
}

func verifyNativeTxMirrorNode(txID, recipientAccountId string, minHbar float64, network string) error {
	// Mirror Node format: "0.0.XXXX-seconds-nanos"
	normalized := strings.ReplaceAll(txID, "@", "-")
	parts := strings.SplitN(normalized, "-", 2)
	if len(parts) == 2 {
		normalized = parts[0] + "-" + strings.ReplaceAll(parts[1], ".", "-")
	}

	url := fmt.Sprintf("%s/api/v1/transactions/%s", mirrorNodeBase(network), normalized)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return fmt.Errorf("mirror node request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return fmt.Errorf("transaction not found on Hedera %s (may still be propagating)", network)
	}

	body, _ := io.ReadAll(resp.Body)
	var result struct {
		Transactions []struct {
			Result    string `json:"result"`
			Transfers []struct {
				Account string `json:"account"`
				Amount  int64  `json:"amount"`
			} `json:"transfers"`
		} `json:"transactions"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("mirror node response parse error: %w", err)
	}
	if len(result.Transactions) == 0 {
		return fmt.Errorf("transaction not found on Mirror Node")
	}
	tx := result.Transactions[0]
	if tx.Result != "SUCCESS" {
		return fmt.Errorf("transaction failed on chain: %s", tx.Result)
	}

	minTinybars := int64(minHbar * 1e8)
	for _, t := range tx.Transfers {
		if t.Account == recipientAccountId && t.Amount >= minTinybars {
			return nil
		}
	}
	return fmt.Errorf("recipient %s did not receive %.4f HBAR (%.0f tinybars minimum)", recipientAccountId, minHbar, float64(minTinybars))
}

func verifyEvmTxMirrorNode(evmHash, recipientEvmAddress string, minHbar float64, network string) error {
	url := fmt.Sprintf("%s/api/v1/contracts/results/%s", mirrorNodeBase(network), evmHash)
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return fmt.Errorf("mirror node EVM request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return fmt.Errorf("EVM transaction not found on Hedera %s", network)
	}

	body, _ := io.ReadAll(resp.Body)
	var result struct {
		To     string `json:"to"`
		Amount int64  `json:"amount"`
		Result string `json:"result"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("EVM mirror node response parse error: %w", err)
	}
	if result.Result != "SUCCESS" {
		return fmt.Errorf("EVM transaction failed: %s", result.Result)
	}
	if !strings.EqualFold(result.To, recipientEvmAddress) {
		return fmt.Errorf("payment sent to wrong address (got %s, expected %s)", result.To, recipientEvmAddress)
	}
	minTinybars := int64(minHbar * 1e8)
	if result.Amount < minTinybars {
		return fmt.Errorf("payment amount insufficient: got %d tinybar, need %d", result.Amount, minTinybars)
	}
	return nil
}
