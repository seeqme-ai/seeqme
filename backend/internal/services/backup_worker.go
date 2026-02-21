package services

import (
	"context"
	"log"
	"time"

	"seeqmeai/backend/internal/database"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// BackupCleanupWorker periodically deletes expired portfolio backups.
type BackupCleanupWorker struct {
	interval time.Duration
}

// NewBackupCleanupWorker creates a new worker that runs every 24 hours.
func NewBackupCleanupWorker() *BackupCleanupWorker {
	return &BackupCleanupWorker{
		interval: 24 * time.Hour,
	}
}

// Start begins the cleanup loop. It runs an initial cleanup immediately,
// then repeats on a 24-hour ticker.
func (w *BackupCleanupWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	// Initial cleanup on start
	w.Cleanup(ctx)

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.Cleanup(ctx)
		}
	}
}

// Cleanup deletes all backups whose expiresAt field is in the past.
func (w *BackupCleanupWorker) Cleanup(ctx context.Context) {
	collection := database.Client.Database(database.DBName).Collection("backups")

	now := primitive.NewDateTimeFromTime(time.Now())
	filter := bson.M{
		"expiresAt": bson.M{
			"$exists": true,
			"$lte":    now,
		},
	}

	result, err := collection.DeleteMany(ctx, filter)
	if err != nil {
		log.Printf("[BackupCleanupWorker] Error cleaning up expired backups: %v", err)
		return
	}

	if result.DeletedCount > 0 {
		log.Printf("[BackupCleanupWorker] Deleted %d expired backups", result.DeletedCount)
	}
}
