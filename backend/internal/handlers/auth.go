package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/idtoken"

	"seeqmeai/backend/internal/auth"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/pkg/geoip"
)

// RegisterRequest defines the structure for user registration requests
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	FullName string `json:"fullName" binding:"required"`
}

// LoginRequest defines the structure for user login requests
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// GoogleTokenVerificationRequest defines the structure for the Google token verification
type GoogleTokenVerificationRequest struct {
	Token string `json:"token" binding:"required"`
}

// UpdateUserRequest defines the structure for user update requests
type UpdateUserRequest struct {
	FullName  string `json:"fullName"`
	AvatarURL string `json:"avatarUrl"`
}

// ChangePasswordRequest defines the structure for password change requests
type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=8"`
}

// ForgotPasswordRequest defines the structure for password reset requests
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest defines the structure for password reset submission
type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=8"`
}

// Register handles user registration
func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	db := database.Client.Database(database.DBName)
	count, err := db.Collection("users").CountDocuments(c.Request.Context(), bson.M{"email": req.Email})
	if err != nil {
		fmt.Printf("[Auth] Registration error: %v (DB: %s)\n", err, database.DBName)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error on email check",
			"details": err.Error(),
			"db_name": database.DBName,
		})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		ID:           primitive.NewObjectID(),
		Email:        req.Email,
		Password:     string(hashedPassword),
		FullName:     req.FullName,
		Roles:        []string{"user"},
		AuthProvider: "local",
		IsActive:     true,
		IsVerified:   false,
		Country:      geoip.GetCountryFromIP(c.ClientIP()),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	_, err = db.Collection("users").InsertOne(c.Request.Context(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	token, err := auth.GenerateToken(user.ID.Hex(), user.Email, user.Roles, h.Config.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	frontendURL := h.Config.FrontendURL
	go func() {
		welcomeEmailData := map[string]interface{}{
			"FullName":      user.FullName,
			"DashboardLink": fmt.Sprintf("%s/dashboard", frontendURL),
		}
		if err := h.Resend.SendEmail(user.Email, "Welcome to Seeqme!", "welcome.html", welcomeEmailData); err != nil {
			fmt.Printf("Failed to send welcome email to %s: %v\n", user.Email, err)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  userResponse(user),
	})
}

// Login handles user authentication
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	db := database.Client.Database(database.DBName)
	var user models.User
	err := db.Collection("users").FindOne(c.Request.Context(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Handle old users or missing AuthProvider by defaulting to "local"
	effectiveProvider := user.AuthProvider
	if effectiveProvider == "" {
		effectiveProvider = "local"
	}

	if effectiveProvider != "local" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("You have previously signed in using %s. Please use that method to log in.", effectiveProvider)})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	user.Country = geoip.GetCountryFromIP(c.ClientIP())
	user.UpdatedAt = time.Now()
	db.Collection("users").UpdateOne(c.Request.Context(), bson.M{"_id": user.ID}, bson.M{"$set": bson.M{"country": user.Country, "updatedAt": user.UpdatedAt}})

	token, err := auth.GenerateToken(user.ID.Hex(), user.Email, user.Roles, h.Config.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	go func() {
		loginNotificationData := map[string]interface{}{
			"FullName":  user.FullName,
			"LoginTime": time.Now().Format("January 02, 2006 15:04 MST"),
			"IPAddress": c.ClientIP(),
			"UserAgent": c.Request.UserAgent(),
		}
		if err := h.Resend.SendEmail(user.Email, "New Login to Your Seeqme Account", "login_notification.html", loginNotificationData); err != nil {
			fmt.Printf("Failed to send login notification email to %s: %v\n", user.Email, err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  userResponse(user),
	})
}

// GetMe retrieves authenticated user information from the context
func (h *Handler) GetMe(c *gin.Context) {
	authedUser, exists := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Could not retrieve authenticated user from context"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(authedUser.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format in token"})
		return
	}

	var user models.User
	err = database.Client.Database(database.DBName).Collection("users").FindOne(c.Request.Context(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, userResponse(user))
}

// VerifyGoogleIDToken handles the verification of a Google ID token and user provisioning.
func (h *Handler) VerifyGoogleIDToken(c *gin.Context) {
	var req GoogleTokenVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: token is required."})
		return
	}

	if h.Config.GoogleClientID == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Google authentication is not configured on the server."})
		return
	}

	payload, err := idtoken.Validate(c.Request.Context(), req.Token, h.Config.GoogleClientID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Google token.", "details": err.Error()})
		return
	}

	db := database.Client.Database(database.DBName)
	var user models.User
	err = db.Collection("users").FindOne(c.Request.Context(), bson.M{"email": payload.Claims["email"]}).Decode(&user)

	if err == nil {
		if user.AuthProvider != "google" {
			c.JSON(http.StatusConflict, gin.H{"error": "An account with this email already exists. Please log in using the method you originally signed up with."})
			return
		}
		user.Country = geoip.GetCountryFromIP(c.ClientIP())
		user.UpdatedAt = time.Now()
		db.Collection("users").UpdateOne(c.Request.Context(), bson.M{"_id": user.ID}, bson.M{"$set": bson.M{"country": user.Country, "updatedAt": user.UpdatedAt, "avatarUrl": payload.Claims["picture"].(string)}})
	} else {
		user = models.User{
			ID:           primitive.NewObjectID(),
			Email:        payload.Claims["email"].(string),
			FullName:     payload.Claims["name"].(string),
			Roles:        []string{"user"},
			AuthProvider: "google",
			IsActive:     true,
			IsVerified:   true,
			GoogleID:     payload.Subject,
			AvatarURL:    payload.Claims["picture"].(string),
			Country:      geoip.GetCountryFromIP(c.ClientIP()),
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		_, insertErr := db.Collection("users").InsertOne(c.Request.Context(), user)
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create new user."})
			return
		}
	}

	appToken, err := auth.GenerateToken(user.ID.Hex(), user.Email, user.Roles, h.Config.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate session token."})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": appToken,
		"user":  userResponse(user),
	})
}

// UpdateUser handles user profile updates
func (h *Handler) UpdateUser(c *gin.Context) {
	authedUser, exists := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(authedUser.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	db := database.Client.Database(database.DBName)
	update := bson.M{
		"$set": bson.M{
			"fullName":  req.FullName,
			"avatarUrl": req.AvatarURL,
			"updatedAt": time.Now(),
		},
	}

	_, err = db.Collection("users").UpdateOne(c.Request.Context(), bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	var updatedUser models.User
	err = db.Collection("users").FindOne(c.Request.Context(), bson.M{"_id": objectID}).Decode(&updatedUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated user"})
		return
	}

	c.JSON(http.StatusOK, userResponse(updatedUser))
}

// RequestPasswordReset initiates a password reset process
func (h *Handler) RequestPasswordReset(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	db := database.Client.Database(database.DBName)
	var user models.User
	err := db.Collection("users").FindOne(c.Request.Context(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "If an account with that email exists, a password reset link has been sent."})
		return
	}

	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	token := hex.EncodeToString(b)

	hashedToken, err := bcrypt.GenerateFromPassword([]byte(token), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash token"})
		return
	}

	expiryTime := time.Now().Add(time.Hour)
	update := bson.M{
		"$set": bson.M{
			"passwordResetToken":     string(hashedToken),
			"passwordResetExpiresAt": expiryTime,
			"updatedAt":              time.Now(),
		},
	}

	_, err = db.Collection("users").UpdateOne(c.Request.Context(), bson.M{"_id": user.ID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user with reset token"})
		return
	}

	frontendURL := h.Config.FrontendURL
	go func() {
		resetLink := fmt.Sprintf("%s/auth/reset-password/new?token=%s", frontendURL, token)
		emailData := map[string]interface{}{
			"ResetLink": resetLink,
		}
		if err := h.Resend.SendEmail(user.Email, "Password Reset Request", "password_reset.html", emailData); err != nil {
			fmt.Printf("Failed to send password reset email to %s: %v\n", user.Email, err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"message": "If an account with that email exists, a password reset link has been sent."})
}

// ResetPassword handles password reset submission
func (h *Handler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	db := database.Client.Database(database.DBName)
	var user models.User
	cursor, err := db.Collection("users").Find(c.Request.Context(), bson.M{
		"passwordResetExpiresAt": bson.M{"$gt": time.Now()},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query users"})
		return
	}
	defer cursor.Close(c.Request.Context())

	found := false
	for cursor.Next(c.Request.Context()) {
		var u models.User
		if err := cursor.Decode(&u); err != nil {
			continue
		}
		if u.PasswordResetToken != "" && bcrypt.CompareHashAndPassword([]byte(u.PasswordResetToken), []byte(req.Token)) == nil {
			user = u
			found = true
			break
		}
	}

	if !found {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired password reset token"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"password":  string(hashedPassword),
			"updatedAt": time.Now(),
		},
		"$unset": bson.M{
			"passwordResetToken":     "",
			"passwordResetExpiresAt": "",
		},
	}

	_, err = db.Collection("users").UpdateOne(c.Request.Context(), bson.M{"_id": user.ID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password has been reset successfully."})
}

// VerifyPasswordResetToken validates a password reset token
func (h *Handler) VerifyPasswordResetToken(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	db := database.Client.Database(database.DBName)
	cursor, err := db.Collection("users").Find(c.Request.Context(), bson.M{
		"passwordResetExpiresAt": bson.M{"$gt": time.Now()},
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query users"})
		return
	}
	defer cursor.Close(c.Request.Context())

	for cursor.Next(c.Request.Context()) {
		var u models.User
		if err := cursor.Decode(&u); err != nil {
			continue
		}
		if u.PasswordResetToken != "" && bcrypt.CompareHashAndPassword([]byte(u.PasswordResetToken), []byte(token)) == nil {
			c.JSON(http.StatusOK, gin.H{"message": "Token is valid"})
			return
		}
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired password reset token"})
}

// ChangePassword allows a logged-in user to change their password
func (h *Handler) ChangePassword(c *gin.Context) {
	authedUser, exists := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(authedUser.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	db := database.Client.Database(database.DBName)
	var user models.User
	err = db.Collection("users").FindOne(c.Request.Context(), bson.M{"_id": objectID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect current password"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	update := bson.M{
		"$set": bson.M{
			"password":  string(hashedPassword),
			"updatedAt": time.Now(),
		},
	}

	_, err = db.Collection("users").UpdateOne(c.Request.Context(), bson.M{"_id": objectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// userResponse formats user data for API responses
func userResponse(user models.User) gin.H {
	return gin.H{
		"id":           user.ID.Hex(),
		"email":        user.Email,
		"fullName":     user.FullName,
		"roles":        user.Roles,
		"isActive":     user.IsActive,
		"isVerified":   user.IsVerified,
		"avatarUrl":    user.AvatarURL,
		"country":      user.Country,
		"authProvider": user.AuthProvider,
	}
}
