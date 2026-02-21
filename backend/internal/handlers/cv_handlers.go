package handlers

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/ledongthuc/pdf"
)

// ExtractCVContent handles temporary file upload and extracts text content
// Supports .txt, .docx, and .pdf
func (h *Handler) ExtractCVContent(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		fmt.Printf("[CVExtract] Error retrieving file: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get file from form"})
		return
	}

	// 20MB limit
	if file.Size > 20<<20 {
		fmt.Printf("[CVExtract] File too large: %d bytes\n", file.Size)
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size exceeds limit of 20MB"})
		return
	}

	src, err := file.Open()
	if err != nil {
		fmt.Printf("[CVExtract] Failed to open file: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer src.Close()

	// Read file into buffer for processing
	buf := new(bytes.Buffer)
	if _, err := io.Copy(buf, src); err != nil {
		fmt.Printf("[CVExtract] Failed to buffer file: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file buffer"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	var content string

	fmt.Printf("[CVExtract] Processing file: %s (size: %d, ext: %s)\n", file.Filename, file.Size, ext)

	switch ext {
	case ".txt", ".md":
		content = buf.String()
	case ".docx":
		content, err = extractDocxText(buf.Bytes(), file.Size)
		if err != nil {
			fmt.Printf("[CVExtract] DOCX error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse DOCX: " + err.Error()})
			return
		}
	case ".pdf":
		content, err = extractPDFText(buf.Bytes(), file.Size)
		if err != nil {
			fmt.Printf("[CVExtract] PDF error: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse PDF: " + err.Error()})
			return
		}
	default:
		fmt.Printf("[CVExtract] Unsupported extension: %s\n", ext)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported file type. Please use PDF, DOCX, or TXT."})
		return
	}

	// Sanitize content (basic cleanup)
	content = strings.ReplaceAll(content, "\x00", "")
	content = strings.TrimSpace(content)

	// If extraction yields empty content
	if len(content) < 10 {
		fmt.Printf("[CVExtract] Warning: Extracted content too short (%d chars)\n", len(content))
	}

	c.JSON(http.StatusOK, gin.H{
		"filename": file.Filename,
		"content":  content,
		"size":     len(content),
	})
}

// extractDocxText extracts text from a DOCX file (manipulating it as a zip of XMLs)
func extractDocxText(data []byte, size int64) (string, error) {
	r, err := zip.NewReader(bytes.NewReader(data), size)
	if err != nil {
		return "", err
	}

	// Find word/document.xml
	var docFile *zip.File
	for _, f := range r.File {
		if f.Name == "word/document.xml" {
			docFile = f
			break
		}
	}

	if docFile == nil {
		return "", http.ErrMissingFile
	}

	rc, err := docFile.Open()
	if err != nil {
		return "", err
	}
	defer rc.Close()

	// Parse XML to extract text
	// We look for <w:t> tags
	decoder := xml.NewDecoder(rc)
	var textBuilder strings.Builder

	for {
		t, err := decoder.Token()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", err
		}

		switch se := t.(type) {
		case xml.StartElement:
			if se.Name.Local == "t" { // <w:t>
				var s string
				if err := decoder.DecodeElement(&s, &se); err == nil {
					textBuilder.WriteString(s)
					textBuilder.WriteString(" ")
				}
			}
			// Add newlines for paragraphs <w:p>
			if se.Name.Local == "p" {
				textBuilder.WriteString("\n")
			}
		}
	}

	return textBuilder.String(), nil
}

// extractPDFText extracts text from a PDF file using ledongthuc/pdf
func extractPDFText(data []byte, size int64) (string, error) {
	r, err := pdf.NewReader(bytes.NewReader(data), size)
	if err != nil {
		return "", err
	}

	var textBuilder strings.Builder

	// Iterate through all pages
	totalPage := r.NumPage()
	for pageIndex := 1; pageIndex <= totalPage; pageIndex++ {
		p := r.Page(pageIndex)
		if p.V.IsNull() {
			continue
		}

		text, err := p.GetPlainText(nil)
		if err != nil {
			// Continue to next page if one fails, but log it?
			// For now, just ignore detailed per-page errors
			continue
		}
		textBuilder.WriteString(text)
		textBuilder.WriteString("\n\n") // Separation between pages
	}

	return textBuilder.String(), nil
}
