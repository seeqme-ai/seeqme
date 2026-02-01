package handlers

import (
	"fmt"
	"net/http"

	"seeqmeai/backend/pkg/cloudinary"

	"github.com/gin-gonic/gin"
)

const MAX_UPLOAD_SIZE = 10 << 20 // 10 MB

func (h *Handler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get file from form"})
		return
	}

	if file.Size > MAX_UPLOAD_SIZE {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("File size exceeds limit of %d MB", MAX_UPLOAD_SIZE/(1<<20))})
		return
	}

	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer src.Close()

	// Upload to Cloudinary
	uploadResult, err := cloudinary.UploadFile(c.Request.Context(), src, file.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Cloudinary upload failed: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"url":       uploadResult.SecureURL,
		"public_id": uploadResult.PublicID,
	})
}

func (h *Handler) DeleteFile(c *gin.Context) {
	publicID := c.Query("public_id")
	if publicID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "public_id is required"})
		return
	}

	err := cloudinary.DeleteFile(c.Request.Context(), publicID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete file from Cloudinary: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File deleted successfully"})
}
