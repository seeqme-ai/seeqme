package handlers

import (
	"context"
	"io"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"seeqmeai/backend/internal/database"
	"seeqmeai/backend/internal/models"
	"seeqmeai/backend/internal/services"
	"seeqmeai/backend/internal/websocket"
)

func (h *Handler) createNotification(ctx context.Context, userID, fromID primitive.ObjectID, fromName, nType string, postID *primitive.ObjectID, message string) {
	notif := models.Notification{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		FromID:    fromID,
		FromName:  fromName,
		Type:      nType,
		PostID:    postID,
		Message:   message,
		IsRead:    false,
		CreatedAt: time.Now(),
	}
	database.Client.Database(database.DBName).Collection("notifications").InsertOne(ctx, notif)

	// 1. Real-time WebSocket update for immediate in-app UI feedback
	websocket.Manager.BroadcastToRoom("user:"+userID.Hex(), "new_notification", notif)

	// 2. Professional Push Notification (FCM)
	var user models.User
	err := database.Client.Database(database.DBName).Collection("users").FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if err == nil && user.FCMToken != "" && !user.IsMock {
		go func() {
			title := "Mesh Update"
			switch nType {
			case "like":
				title = "New Interaction"
			case "comment":
				title = "New Discussion"
			case "connect_request":
				title = "Network Expansion"
			case "repost":
				title = "Content Amplified"
			}
			
			body := fmt.Sprintf("%s %s", fromName, message)
			h.triggerFCMNotification(user.FCMToken, title, body)
		}()
	}
}

// triggerFCMNotification handles the low-level communication with Firebase Cloud Messaging.
func (h *Handler) triggerFCMNotification(token, title, body string) {
	if h.FCMService == nil {
		log.Println("[FCM] FCM Service not initialized. Skipping notification.")
		return
	}
	err := h.FCMService.SendNotification(token, title, body)
	if err != nil {
		log.Printf("[FCM] Failed to dispatch Push Notification to token %s: %v", token, err)
	} else {
		log.Printf("[FCM] Successfully dispatched Push Notification to token: %s | Title: %s | Body: %s", token, title, body)
	}
}


// fetchLinkPreview extracts OG tags from a URL
func fetchLinkPreview(url string) *models.LinkPreview {
	if url == "" {
		return nil
	}
	
	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024)) // Limit to 1MB
	if err != nil {
		return nil
	}

	html := string(body)
	preview := &models.LinkPreview{URL: url}

	// Simple regex-based OG tag extraction
	titleReg := regexp.MustCompile(`<meta\s+property=["']og:title["']\s+content=["'](.*?)["']`)
	descReg := regexp.MustCompile(`<meta\s+property=["']og:description["']\s+content=["'](.*?)["']`)
	imgReg := regexp.MustCompile(`<meta\s+property=["']og:image["']\s+content=["'](.*?)["']`)
	siteReg := regexp.MustCompile(`<meta\s+property=["']og:site_name["']\s+content=["'](.*?)["']`)

	if match := titleReg.FindStringSubmatch(html); len(match) > 1 {
		preview.Title = match[1]
	} else {
		// Fallback to <title>
		titleTagReg := regexp.MustCompile(`(?i)<title>(.*?)</title>`)
		if match := titleTagReg.FindStringSubmatch(html); len(match) > 1 {
			preview.Title = match[1]
		}
	}

	if match := descReg.FindStringSubmatch(html); len(match) > 1 {
		preview.Description = match[1]
	}
	if match := imgReg.FindStringSubmatch(html); len(match) > 1 {
		preview.Image = match[1]
	}
	if match := siteReg.FindStringSubmatch(html); len(match) > 1 {
		preview.SiteName = match[1]
	}

	if preview.Title == "" && preview.Description == "" {
		return nil
	}

	return preview
}

// GetMeshNodes returns nodes and edges for the cluster visualization
func (h *Handler) GetMeshNodes(c *gin.Context) {
	var nodes []models.SocialNode
	cursor, err := database.Client.Database(database.DBName).Collection("social_nodes").Find(context.Background(), bson.M{}, options.Find())
	if err == nil {
		cursor.All(context.Background(), &nodes)
	}

	// Dynamic edge generation logic
	var edges []bson.M
	if len(nodes) > 1 {
		for i := 0; i < len(nodes); i++ {
			for j := i + 1; j < len(nodes); j++ {
				// Create an edge if they share at least one skill or are in the same group
				sharedSkill := false
				for _, s1 := range nodes[i].Skills {
					for _, s2 := range nodes[j].Skills {
						if s1 == s2 {
							sharedSkill = true
							break
						}
					}
				}
				if sharedSkill || nodes[i].Group == nodes[j].Group {
					edges = append(edges, bson.M{
						"source": nodes[i].ID,
						"target": nodes[j].ID,
						"value":  1,
					})
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"nodes": nodes,
		"edges": edges,
	})
}

// SendConnectionRequest initiates a connection between users
func (h *Handler) SendConnectionRequest(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	fromID, _ := primitive.ObjectIDFromHex(authUser.ID)

	var req struct {
		UserID string `json:"userId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	toID, err := primitive.ObjectIDFromHex(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	conn := models.Connection{
		ID:         primitive.NewObjectID(),
		FromUserID: fromID,
		ToUserID:   toID,
		Status:     "pending",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	_, err = database.Client.Database(database.DBName).Collection("connections").UpdateOne(
		context.Background(),
		bson.M{"fromUserId": fromID, "toUserId": toID},
		bson.M{"$set": conn},
		options.Update().SetUpsert(true),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request"})
		return
	}

	// Send notification email
	var toUser models.User
	err = database.Client.Database(database.DBName).Collection("users").FindOne(context.Background(), bson.M{"_id": toID}).Decode(&toUser)
	if err == nil {
		h.Resend.SendEmail(toUser.Email, "New connection request on SeeqMe", "connection_request.html", map[string]interface{}{
			"FullName": authUser.Email, // Or fetch full name of sender
			"ActionLink": h.Config.FrontendURL + "/network",
		})
		h.createNotification(context.Background(), toID, fromID, authUser.Email, "connect_request", nil, "sent you a connection request")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Request sent"})
}

// AcceptConnectionRequest updates status to accepted
func (h *Handler) AcceptConnectionRequest(c *gin.Context) {
	connID, _ := primitive.ObjectIDFromHex(c.Param("id"))
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	myID, _ := primitive.ObjectIDFromHex(authUser.ID)

	var conn models.Connection
	err := database.Client.Database(database.DBName).Collection("connections").FindOne(context.Background(), bson.M{"_id": connID}).Decode(&conn)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Connection not found"})
		return
	}

	_, err = database.Client.Database(database.DBName).Collection("connections").UpdateOne(
		context.Background(),
		bson.M{"_id": connID},
		bson.M{"$set": bson.M{"status": "accepted", "updatedAt": time.Now()}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept request"})
		return
	}

	// Notify the person who sent the request
	h.createNotification(context.Background(), conn.FromUserID, myID, authUser.Email, "connect_accept", nil, "accepted your connection request")

	c.Status(http.StatusNoContent)
}

// RejectConnectionRequest deletes or updates status to rejected
func (h *Handler) RejectConnectionRequest(c *gin.Context) {
	connID, _ := primitive.ObjectIDFromHex(c.Param("id"))
	_, err := database.Client.Database(database.DBName).Collection("connections").DeleteOne(
		context.Background(),
		bson.M{"_id": connID},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject request"})
		return
	}
	c.Status(http.StatusNoContent)
}

// GetConnections returns the user's connection list categorized by status
func (h *Handler) GetConnections(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(authUser.ID)

	var allConns []models.Connection
	cursor, err := database.Client.Database(database.DBName).Collection("connections").Find(context.Background(), bson.M{
		"$or": []bson.M{
			{"fromUserId": userID},
			{"toUserId": userID},
		},
	})
	if err == nil {
		cursor.All(context.Background(), &allConns)
	}

	accepted := []bson.M{}
	received := []bson.M{}
	sent     := []bson.M{}

	for _, conn := range allConns {
		isFromMe := conn.FromUserID == userID
		targetID := conn.ToUserID
		if !isFromMe {
			targetID = conn.FromUserID
		}

		var targetUser models.User
		database.Client.Database(database.DBName).Collection("users").FindOne(context.Background(), bson.M{"_id": targetID}).Decode(&targetUser)

		item := bson.M{
			"connectionId": conn.ID.Hex(),
			"id":           targetID.Hex(),
			"name":         targetUser.FullName,
			"role":         "Member",
			"location":     targetUser.Country,
			"avatar":       targetUser.AvatarURL,
			"status":       conn.Status,
		}

		if conn.Status == "accepted" {
			accepted = append(accepted, item)
		} else if conn.Status == "pending" {
			if isFromMe {
				sent = append(sent, item)
			} else {
				received = append(received, item)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"accepted": accepted,
		"received": received,
		"sent":     sent,
	})
}

// GetFollowingFeed returns posts from users being followed
func (h *Handler) GetFollowingFeed(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(authUser.ID)

	// 1. Get accepted connections
	filter := bson.M{
		"status": "accepted",
		"$or": []bson.M{
			{"fromUserId": userID},
			{"toUserId": userID},
		},
	}
	cursor, _ := database.Client.Database(database.DBName).Collection("connections").Find(context.Background(), filter)
	var conns []models.Connection
	cursor.All(context.Background(), &conns)

	var friendIDs []primitive.ObjectID
	for _, cn := range conns {
		if cn.FromUserID == userID {
			friendIDs = append(friendIDs, cn.ToUserID)
		} else {
			friendIDs = append(friendIDs, cn.FromUserID)
		}
	}

	// 2. Fetch posts
	var posts []models.Post
	opts := options.Find().SetSort(bson.M{"createdAt": -1}).SetLimit(50)
	cursor, err := database.Client.Database(database.DBName).Collection("posts").Find(context.Background(), bson.M{"authorId": bson.M{"$in": friendIDs}}, opts)
	if err == nil {
		cursor.All(context.Background(), &posts)
	}

	setLikedStatus(posts, userID)
	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GetForYouFeed returns personalized posts (placeholder for algorithm)
func (h *Handler) GetForYouFeed(c *gin.Context) {
	// For now, same as general feed but could include liked content, etc.
	h.GetFeed(c)
}

// setLikedStatus stamps the Liked virtual field on each post for the requesting user.
func setLikedStatus(posts []models.Post, userID primitive.ObjectID) {
	for i := range posts {
		for _, id := range posts[i].LikedBy {
			if id == userID {
				posts[i].Liked = true
				break
			}
		}
	}
}

// GetFeed returns social posts for the user, excluding mock posts.
func (h *Handler) GetFeed(c *gin.Context) {
	var posts []models.Post
	opts := options.Find().SetSort(bson.M{"createdAt": -1}).SetLimit(50)
	// Filter out mock posts
	filter := bson.M{"isMock": false}
	cursor, err := database.Client.Database(database.DBName).Collection("posts").Find(context.Background(), filter, opts)
	if err == nil {
		cursor.All(context.Background(), &posts)
	}

	if authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser); ok && authUser != nil {
		if userID, err := primitive.ObjectIDFromHex(authUser.ID); err == nil {
			setLikedStatus(posts, userID)
		}
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GetPostBySlug returns a single post by its slug
func (h *Handler) GetPostBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var post models.Post
	err := database.Client.Database(database.DBName).Collection("posts").FindOne(context.Background(), bson.M{"slug": slug}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"post": post})
}

// DeletePost removes a post (owner only)
func (h *Handler) DeletePost(c *gin.Context) {
	postID, _ := primitive.ObjectIDFromHex(c.Param("id"))
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(authUser.ID)

	// Check ownership
	var post models.Post
	err := database.Client.Database(database.DBName).Collection("posts").FindOne(context.Background(), bson.M{"_id": postID}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if post.AuthorID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not own this post"})
		return
	}

	_, err = database.Client.Database(database.DBName).Collection("posts").DeleteOne(context.Background(), bson.M{"_id": postID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post deleted"})
}

// CreatePost publishes a new post to the feed
func (h *Handler) CreatePost(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	authorID, _ := primitive.ObjectIDFromHex(authUser.ID)

	var req struct {
		Content string   `json:"content" binding:"required"`
		Tag     string   `json:"tag"`
		Media   string   `json:"media"`
		Link    string   `json:"link"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch user details for the post
	var user models.User
	err := database.Client.Database(database.DBName).Collection("users").FindOne(context.Background(), bson.M{"_id": authorID}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Author not found"})
		return
	}

	post := models.Post{
		ID:          primitive.NewObjectID(),
		AuthorID:    authorID,
		Author:      user.FullName,
		Role:        "Member",
		Location:    user.Country,
		Avatar:      user.AvatarURL,
		Similarity:  100, // Self is 100%
		Content:     req.Content,
		Tag:         req.Tag,
		Media:       req.Media,
		Link:        req.Link,
		LinkPreview: fetchLinkPreview(req.Link),
		Comments:    []models.Comment{},
		SavedBy:     []string{},
		Slug:        generatePostSlug(user.FullName, req.Content),
		SEOTitle:    user.FullName + " on SeeqMe",
		SEODesc:     req.Content,
		Timestamp:  "Just now",
		CreatedAt:  time.Now(),
	}

	_, err = database.Client.Database(database.DBName).Collection("posts").InsertOne(context.Background(), post)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"post": post})
	websocket.Manager.BroadcastToRoom("social_feed", "new_post", post)
}

// CommentOnPost adds a comment to a post
func (h *Handler) CommentOnPost(c *gin.Context) {
	postID, _ := primitive.ObjectIDFromHex(c.Param("id"))
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	authorID, _ := primitive.ObjectIDFromHex(authUser.ID)

	var req struct {
		Content  string `json:"content" binding:"required"`
		ParentID string `json:"parentId"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var pID *primitive.ObjectID
	if req.ParentID != "" {
		id, _ := primitive.ObjectIDFromHex(req.ParentID)
		pID = &id
	}

	var user models.User
	database.Client.Database(database.DBName).Collection("users").FindOne(context.Background(), bson.M{"_id": authorID}).Decode(&user)

	comment := models.Comment{
		ID:        primitive.NewObjectID(),
		PostID:    postID,
		ParentID:  pID,
		AuthorID:  authorID,
		Author:    user.FullName,
		Avatar:    user.AvatarURL,
		Content:   req.Content,
		CreatedAt: time.Now(),
	}

	filter := bson.M{"_id": postID}
	update := bson.M{"$push": bson.M{"comments": comment}}
	_, err := database.Client.Database(database.DBName).Collection("posts").UpdateOne(context.Background(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not add comment"})
		return
	}

	// Notify post owner
	var post models.Post
	err = database.Client.Database(database.DBName).Collection("posts").FindOne(context.Background(), bson.M{"_id": postID}).Decode(&post)
	if err == nil && post.AuthorID != authorID {
		h.createNotification(context.Background(), post.AuthorID, authorID, authUser.Email, "comment", &postID, "commented on your post")
	}

	c.JSON(http.StatusOK, gin.H{"comment": comment})
	websocket.Manager.BroadcastToRoom("social_feed", "post_commented", bson.M{"postId": postID.Hex(), "comment": comment})
	websocket.Manager.BroadcastToRoom("post:"+postID.Hex(), "new_comment", comment)
}

// UpdatePost edits an existing post
func (h *Handler) UpdatePost(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	authorID, _ := primitive.ObjectIDFromHex(authUser.ID)
	postID, _ := primitive.ObjectIDFromHex(c.Param("id"))

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := database.Client.Database(database.DBName).Collection("posts").UpdateOne(
		context.Background(),
		bson.M{"_id": postID, "authorId": authorID},
		bson.M{"$set": bson.M{"content": req.Content, "updatedAt": time.Now()}},
	)

	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Could not update post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post updated"})
}

// LikePost handles liking a post.
func (h *Handler) LikePost(c *gin.Context) {
	postID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	myID, _ := primitive.ObjectIDFromHex(authUser.ID)

	// Check if user has already liked the post
	var existingPost models.Post
	err = database.Client.Database(database.DBName).Collection("posts").FindOne(context.Background(), bson.M{"_id": postID, "likedBy": myID}).Decode(&existingPost)
	if err == nil {
		// User already liked this post, return success without doing anything
		c.JSON(http.StatusOK, gin.H{"message": "Post already liked"})
		return
	} else if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check like status"})
		return
	}

	// Add user to LikedBy array and increment likes count
	updateResult, err := database.Client.Database(database.DBName).Collection("posts").UpdateOne(
		context.Background(),
		bson.M{"_id": postID},
		bson.M{
			"$addToSet": bson.M{"likedBy": myID},
			"$inc":      bson.M{"likes": 1},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to like post"})
		return
	}

	if updateResult.ModifiedCount == 0 {
		// This case should ideally not be hit if the FindOne above worked, but as a safeguard
		c.JSON(http.StatusOK, gin.H{"message": "Post already liked or not found"})
		return
	}

	// Fetch updated post to get current likes and likedBy status
	var updatedPost models.Post
	err = database.Client.Database(database.DBName).Collection("posts").FindOne(context.Background(), bson.M{"_id": postID}).Decode(&updatedPost)
	if err != nil {
		log.Printf("Failed to fetch updated post after like: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated post"})
		return
	}

	// Notify owner
	if updatedPost.AuthorID != myID {
		h.createNotification(context.Background(), updatedPost.AuthorID, myID, authUser.Email, "like", &postID, "liked your post")
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post liked successfully", "likes": updatedPost.Likes, "likedBy": updatedPost.LikedBy})
	websocket.Manager.BroadcastToRoom("social_feed", "post_liked", bson.M{"postId": postID.Hex(), "likes": updatedPost.Likes, "likedBy": updatedPost.LikedBy})
	websocket.Manager.BroadcastToRoom("post:"+postID.Hex(), "likes_update", updatedPost.Likes)
}

// UnlikePost handles unliking a post.
func (h *Handler) UnlikePost(c *gin.Context) {
	postID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	myID, _ := primitive.ObjectIDFromHex(authUser.ID)

	// Remove user from LikedBy array and decrement likes count
	updateResult, err := database.Client.Database(database.DBName).Collection("posts").UpdateOne(
		context.Background(),
		bson.M{"_id": postID, "likedBy": myID}, // Only pull if user actually liked it
		bson.M{
			"$pull": bson.M{"likedBy": myID},
			"$inc":  bson.M{"likes": -1},
		},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unlike post"})
		return
	}

	if updateResult.ModifiedCount == 0 {
		// User had not liked this post, or post not found
		c.JSON(http.StatusOK, gin.H{"message": "Post not liked by user or not found"})
		return
	}

	// Fetch updated post to get current likes and likedBy status
	var updatedPost models.Post
	err = database.Client.Database(database.DBName).Collection("posts").FindOne(context.Background(), bson.M{"_id": postID}).Decode(&updatedPost)
	if err != nil {
		log.Printf("Failed to fetch updated post after unlike: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve updated post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post unliked successfully", "likes": updatedPost.Likes, "likedBy": updatedPost.LikedBy})
	websocket.Manager.BroadcastToRoom("social_feed", "post_unliked", bson.M{"postId": postID.Hex(), "likes": updatedPost.Likes, "likedBy": updatedPost.LikedBy})
	websocket.Manager.BroadcastToRoom("post:"+postID.Hex(), "likes_update", updatedPost.Likes)
}

// RepostPost creates a new post referencing the original
func (h *Handler) RepostPost(c *gin.Context) {
	postID, _ := primitive.ObjectIDFromHex(c.Param("id"))
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	authorID, _ := primitive.ObjectIDFromHex(authUser.ID)
	
	var originalPost models.Post
	err := database.Client.Database(database.DBName).Collection("posts").FindOneAndUpdate(
		context.Background(),
		bson.M{"_id": postID},
		bson.M{"$inc": bson.M{"reposts": 1}},
	).Decode(&originalPost)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch original post"})
		return
	}

	var user models.User
	database.Client.Database(database.DBName).Collection("users").FindOne(context.Background(), bson.M{"_id": authorID}).Decode(&user)

	repost := models.Post{
		ID:             primitive.NewObjectID(),
		AuthorID:       authorID,
		OriginalPostID: &postID,
		Author:         user.FullName,
		Role:           "Member",
		Location:       user.Country,
		Avatar:         user.AvatarURL,
		Similarity:     100,
		Content:        originalPost.Content,
		Tag:            originalPost.Tag,
		Media:          originalPost.Media,
		Link:           originalPost.Link,
		LinkPreview:    originalPost.LinkPreview,
		Comments:       []models.Comment{},
		SavedBy:        []string{},
		Slug:           primitive.NewObjectID().Hex(),
		SEOTitle:       user.FullName + " reposted: " + originalPost.Author,
		SEODesc:        originalPost.Content,
		Timestamp:      "Just now",
		CreatedAt:      time.Now(),
	}

	_, err = database.Client.Database(database.DBName).Collection("posts").InsertOne(context.Background(), repost)
	
	// Notify owner
	if originalPost.AuthorID != authorID {
		h.createNotification(context.Background(), originalPost.AuthorID, authorID, authUser.Email, "repost", &postID, "reposted your post")
	}

	c.JSON(http.StatusOK, gin.H{"repost": repost})
	websocket.Manager.BroadcastToRoom("social_feed", "new_post", repost)
	websocket.Manager.BroadcastToRoom("social_feed", "post_reposted", bson.M{"postId": postID.Hex(), "reposts": originalPost.Reposts + 1})
}

// SavePost adds or removes a post from the user's saved list.
func (h *Handler) SavePost(c *gin.Context) {
	postID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := authUser.ID // User ID is a string

	var post models.Post
	err = database.Client.Database(database.DBName).Collection("posts").FindOne(context.Background(), bson.M{"_id": postID}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	isSaved := false
	for _, id := range post.SavedBy {
		if id == userID {
			isSaved = true
			break
		}
	}

	var update bson.M
	var message string
	if isSaved {
		update = bson.M{"$pull": bson.M{"savedBy": userID}}
		message = "Post unsaved successfully"
	} else {
		update = bson.M{"$addToSet": bson.M{"savedBy": userID}}
		message = "Post saved successfully"
	}

	_, err = database.Client.Database(database.DBName).Collection("posts").UpdateOne(context.Background(), bson.M{"_id": postID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update saved status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": message})
}

// GetNotifications returns notifications for the user
func (h *Handler) GetNotifications(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(authUser.ID)

	var notifs []models.Notification
	opts := options.Find().SetSort(bson.M{"createdAt": -1}).SetLimit(50)
	cursor, err := database.Client.Database(database.DBName).Collection("notifications").Find(context.Background(), bson.M{"userId": userID}, opts)
	if err == nil {
		cursor.All(context.Background(), &notifs)
	}

	c.JSON(http.StatusOK, gin.H{"notifications": notifs})
}

// MarkNotificationsRead marks all user notifications as read
func (h *Handler) MarkNotificationsRead(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, _ := primitive.ObjectIDFromHex(authUser.ID)

	_, err := database.Client.Database(database.DBName).Collection("notifications").UpdateMany(
		context.Background(),
		bson.M{"userId": userID, "isRead": false},
		bson.M{"$set": bson.M{"isRead": true}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not mark notifications as read"})
		return
	}
	c.Status(http.StatusNoContent)
}

// GetSavedPosts returns posts saved by the authenticated user.
func (h *Handler) GetSavedPosts(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := authUser.ID // User ID is already a string

	var posts []models.Post
	opts := options.Find().SetSort(bson.M{"createdAt": -1}).SetLimit(50)
	cursor, err := database.Client.Database(database.DBName).Collection("posts").Find(context.Background(), bson.M{"savedBy": userID}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch saved posts"})
		return
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode saved posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// GetMyPosts returns posts created by the authenticated user.
func (h *Handler) GetMyPosts(c *gin.Context) {
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, err := primitive.ObjectIDFromHex(authUser.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var posts []models.Post
	opts := options.Find().SetSort(bson.M{"createdAt": -1}).SetLimit(50)
	cursor, err := database.Client.Database(database.DBName).Collection("posts").Find(context.Background(), bson.M{"authorId": userID}, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user posts"})
		return
	}
	defer cursor.Close(context.Background())

	if err = cursor.All(context.Background(), &posts); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user posts"})
		return
	}

	setLikedStatus(posts, userID)
	c.JSON(http.StatusOK, gin.H{"posts": posts})
}

// generatePostSlug creates a human-readable URL slug from author name and content.
func generatePostSlug(author, content string) string {
	re := regexp.MustCompile(`[^a-z0-9]+`)
	words := strings.Fields(strings.ToLower(content))
	limit := 6
	if len(words) < limit {
		limit = len(words)
	}
	slug := re.ReplaceAllString(strings.Join(words[:limit], "-"), "-")
	slug = strings.Trim(slug, "-")
	// Append short hex suffix for uniqueness
	suffix := primitive.NewObjectID().Hex()[:7]
	return slug + "-" + suffix
}

// GetTrending returns the latest trending tags and post counts
func (h *Handler) GetTrending(c *gin.Context) {
	var trending []models.TrendingItem
	cursor, err := database.Client.Database(database.DBName).Collection("trending").Find(context.Background(), bson.M{}, options.Find().SetSort(bson.M{"posts": -1}).SetLimit(10))
	if err == nil {
		cursor.All(context.Background(), &trending)
	}

	c.JSON(http.StatusOK, gin.H{"trending": trending})
}

// GetSuggested returns suggested connections for the user
func (h *Handler) GetSuggested(c *gin.Context) {
	var suggested []models.SuggestedUser
	cursor, err := database.Client.Database(database.DBName).Collection("suggested_users").Find(context.Background(), bson.M{}, options.Find().SetLimit(10))
	if err == nil {
		cursor.All(context.Background(), &suggested)
	}

	c.JSON(http.StatusOK, gin.H{"suggested": suggested})
}

// GetTrendingFeed returns actual trending posts (hot in-app + Reddit hot), optionally filtered by tag.
func (h *Handler) GetTrendingFeed(c *gin.Context) {
	db := database.Client.Database(database.DBName)
	ctx := context.Background()
	tag := c.Query("tag")

	inAppFilter := bson.M{"isMock": false}
	if tag != "" {
		inAppFilter["tag"] = tag
	}

	var inAppPosts []models.Post
	cursor, err := db.Collection("posts").Find(ctx, inAppFilter,
		options.Find().SetSort(bson.M{"likes": -1, "reposts": -1}).SetLimit(20))
	if err == nil {
		cursor.All(ctx, &inAppPosts)
	}

	if authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser); ok && authUser != nil {
		if userID, err := primitive.ObjectIDFromHex(authUser.ID); err == nil {
			setLikedStatus(inAppPosts, userID)
		}
	}

	redditFilter := bson.M{"category": "hot"}

	var redditPosts []models.RedditPost
	rcursor, err := db.Collection("reddit_posts").Find(ctx, redditFilter,
		options.Find().SetSort(bson.M{"score": -1}).SetLimit(20))
	if err == nil {
		rcursor.All(ctx, &redditPosts)
	}

	c.JSON(http.StatusOK, gin.H{
		"posts":       inAppPosts,
		"redditPosts": redditPosts,
	})
}

// GetRedditFeed returns paginated Reddit posts from the cache.
func (h *Handler) GetRedditFeed(c *gin.Context) {
	category := c.DefaultQuery("category", "hot")
	db := database.Client.Database(database.DBName)

	filter := bson.M{}
	if category != "all" {
		filter["category"] = category
	}

	var posts []models.RedditPost
	cursor, err := db.Collection("reddit_posts").Find(context.Background(), filter,
		options.Find().SetSort(bson.M{"score": -1}).SetLimit(25))
	if err == nil {
		cursor.All(context.Background(), &posts)
	}

	c.JSON(http.StatusOK, gin.H{"redditPosts": posts})
}

// GetRedditPostBySlug returns a single Reddit post with cached Reddit comments.
func (h *Handler) GetRedditPostBySlug(c *gin.Context) {
	slug := c.Param("slug")
	db := database.Client.Database(database.DBName)

	var post models.RedditPost
	err := db.Collection("reddit_posts").FindOne(context.Background(), bson.M{"slug": slug}).Decode(&post)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	// Fetch top Reddit comments if we don't have any cached yet
	if len(post.TopComments) == 0 {
		comments, err := services.FetchRedditPostComments(context.Background(), post.Subreddit, post.RedditID)
		if err == nil && len(comments) > 0 {
			post.TopComments = comments
			db.Collection("reddit_posts").UpdateOne(context.Background(),
				bson.M{"_id": post.ID},
				bson.M{"$set": bson.M{"topComments": comments}},
			)
		}
	}

	c.JSON(http.StatusOK, gin.H{"post": post})
}

// LikeRedditPost toggles a like on a Reddit post for the authenticated user.
func (h *Handler) LikeRedditPost(c *gin.Context) {
	postID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	db := database.Client.Database(database.DBName)
	_, err = db.Collection("reddit_posts").UpdateOne(context.Background(),
		bson.M{"_id": postID},
		bson.M{"$addToSet": bson.M{"ourLikes": authUser.ID}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not like post"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "liked"})
}

// UnlikeRedditPost removes a like from a Reddit post.
func (h *Handler) UnlikeRedditPost(c *gin.Context) {
	postID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	db := database.Client.Database(database.DBName)
	_, err = db.Collection("reddit_posts").UpdateOne(context.Background(),
		bson.M{"_id": postID},
		bson.M{"$pull": bson.M{"ourLikes": authUser.ID}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not unlike post"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "unliked"})
}

// CommentOnRedditPost adds a SeeqMe user comment to a Reddit post.
func (h *Handler) CommentOnRedditPost(c *gin.Context) {
	postID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}
	authUser, ok := c.Request.Context().Value(models.UserContextKey).(*models.AuthenticatedUser)
	if !ok || authUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	authorID, _ := primitive.ObjectIDFromHex(authUser.ID)

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	database.Client.Database(database.DBName).Collection("users").FindOne(
		context.Background(), bson.M{"_id": authorID},
	).Decode(&user)

	comment := models.Comment{
		ID:        primitive.NewObjectID(),
		PostID:    postID,
		AuthorID:  authorID,
		Author:    user.FullName,
		Avatar:    user.AvatarURL,
		Content:   req.Content,
		CreatedAt: time.Now(),
	}

	db := database.Client.Database(database.DBName)
	_, err = db.Collection("reddit_posts").UpdateOne(context.Background(),
		bson.M{"_id": postID},
		bson.M{"$push": bson.M{"ourComments": comment}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not add comment"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"comment": comment})
}
