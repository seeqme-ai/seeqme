package handlers

import (
	"net/http"
	"seeqmeai/backend/internal/services"

	"github.com/gin-gonic/gin"
)

// GetActiveSession returns the current active session for the authenticated user
func (h *Handler) GetActiveSession(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	session, found := services.GlobalSessionManager.GetActiveSession(userID.(string))
	if !found {
		// Return 200 OK with null/empty to clear console of 404 errors during normal idle state
		c.JSON(http.StatusOK, nil)
		return
	}

	c.JSON(http.StatusOK, session)
}

// GetSession returns a specific session by ID
func (h *Handler) GetSession(c *gin.Context) {
	sessionID := c.Param("id")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Session ID required"})
		return
	}

	session, err := services.GlobalSessionManager.GetSession(sessionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, session)
}
