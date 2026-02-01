package middleware

import (
	"context"
	"log"
	"net/http"
	"strings"

	"seeqmeai/backend/internal/auth"
	"seeqmeai/backend/internal/models"

	"github.com/gin-gonic/gin"
)

// OptionalAuthMiddleware attempts to validate a JWT if present and attaches the
// authenticated user to the context. It does NOT fail if the token is missing or invalid.
// This should be used globally to identify users on both public and private routes.
func OptionalAuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// log.Println("[Middleware] No Authorization header found")
			c.Next()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("[Middleware] Malformed Authorization header: %s", authHeader)
			c.Next()
			return
		}

		tokenString := parts[1]
		claims, err := auth.ValidateToken(tokenString, jwtSecret)
		if err != nil {
			log.Printf("[Middleware] Token validation failed: %v", err)
			c.Next()
			return
		}

		log.Printf("[Middleware] Token valid for user: %s", claims.UserID)

		// Set userID in Gin context for handlers using c.Get("userId")
		c.Set("userId", claims.UserID)
		c.Set("subjectId", claims.UserID) // Set subjectId for handlers that require it (e.g. GetPortfolios)

		// Attach user info to the request context for downstream handlers.
		ctx := context.WithValue(c.Request.Context(), models.UserContextKey, &models.AuthenticatedUser{
			ID:    claims.UserID,
			Email: claims.Email,
			Roles: claims.Roles,
		})
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

// RequiredAuthMiddleware checks if a user has been attached to the context.
// It aborts with a 401 Unauthorized error if no authenticated user is found.
// This should be used to protect secure routes after OptionalAuthMiddleware has run.
func RequiredAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, exists := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
		if !exists {
			log.Printf("[Middleware] RequiredAuth failed: UserContextKey missing. Path: %s", c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}
		// log.Printf("[Middleware] RequiredAuth success")
		c.Next()
	}
}

// AdminOnlyMiddleware checks if the authenticated user has the 'admin' role.
// It should be used after RequiredAuthMiddleware.
func AdminOnlyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
			c.Abort()
			return
		}

		isAdmin := false
		for _, role := range user.Roles {
			if role == "admin" {
				isAdmin = true
				break
			}
		}

		if !isAdmin {
			log.Printf("[Middleware] AdminOnly failed: User %s does not have admin role. Path: %s", user.ID, c.Request.URL.Path)
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
