package middleware

import (
	"github.com/gin-gonic/gin"
)

// IdentityMiddleware ensures every request has a subjectId, either from a valid JWT
// or from the X-Anonymous-ID header.
func IdentityMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// If subjectId is already set (by OptionalAuthMiddleware), we're good.
		if _, exists := c.Get("subjectId"); exists {
			c.Next()
			return
		}

		// Fallback to X-Anonymous-ID header for guests
		anonID := c.GetHeader("X-Anonymous-ID")
		if anonID != "" {
			c.Set("subjectId", anonID)
		}

		c.Next()
	}
}
