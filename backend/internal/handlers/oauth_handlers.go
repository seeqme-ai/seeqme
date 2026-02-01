package handlers

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"seeqmeai/backend/internal/auth"
	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/pkg/geoip"
)

func (h *Handler) GoogleLogin(c *gin.Context) {
	b := make([]byte, 16)
	rand.Read(b)
	h.oauthStateString = base64.URLEncoding.EncodeToString(b)
	url := h.googleOauthConfig.AuthCodeURL(h.oauthStateString)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func (h *Handler) GoogleCallback(c *gin.Context) {
	// This is a server-to-server callback flow and is different from the
	// frontend-driven token verification flow I implemented.
	// I am leaving this code as-is, but noting it is a separate, unused auth path.
	state := c.Query("state")
	if state != h.oauthStateString {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid oauth state"})
		return
	}

	code := c.Query("code")
	token, err := h.googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to exchange token: " + err.Error()})
		return
	}

	response, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get user info: " + err.Error()})
		return
	}
	defer response.Body.Close()

	contents, err := ioutil.ReadAll(response.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read user info: " + err.Error()})
		return
	}

	var userInfo struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := json.Unmarshal(contents, &userInfo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse user info: " + err.Error()})
		return
	}

	db := database.Client.Database(database.DBName)
	var user models.User
	err = db.Collection("users").FindOne(context.Background(), bson.M{"email": userInfo.Email}).Decode(&user)

	if err != nil { // User does not exist, create new user
		user = models.User{
			Email:      userInfo.Email,
			FullName:   userInfo.Name,
			GoogleID:   userInfo.ID,
			AvatarURL:  userInfo.Picture,
			IsVerified: true,
			IsActive:   true,
			Roles:      []string{"user"},
			AuthProvider: "google",
			Country:    geoip.GetCountryFromIP(c.ClientIP()),
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		res, dbErr := db.Collection("users").InsertOne(context.Background(), user)
		if dbErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
		user.ID = res.InsertedID.(primitive.ObjectID)

	} else { // User exists, update info
		update := bson.M{
			"$set": bson.M{
				"googleId":  userInfo.ID,
				"avatarUrl": userInfo.Picture,
				"country":   geoip.GetCountryFromIP(c.ClientIP()),
				"updatedAt": time.Now(),
			},
		}
		_, dbErr := db.Collection("users").UpdateOne(context.Background(), bson.M{"_id": user.ID}, update)
		if dbErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
			return
		}
	}

	jwtToken, err := auth.GenerateToken(user.ID.Hex(), user.Email, user.Roles, h.Config.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	redirectURL := h.Config.FrontendURL + "/auth/callback?token=" + jwtToken
	c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}