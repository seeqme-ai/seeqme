package services

import (
	"fmt"
	"sync"
	"time"
)

type Session struct {
	ID          string            `json:"id"`
	UserID      string            `json:"userId"`
	PortfolioID string            `json:"portfolioId"`
	Type        string            `json:"type"`   // "generation", "deployment", "rollback"
	Status      string            `json:"status"` // "active", "completed", "failed"
	Progress    int               `json:"progress"`
	Files       map[string]string `json:"files,omitempty"`
	Logs        []string          `json:"logs"`
	ResultURL   string            `json:"resultUrl,omitempty"`
	CreatedAt   time.Time         `json:"createdAt"`
	LastActive  time.Time         `json:"lastActive"`
	TTL         time.Duration     `json:"-"`
}

type SessionManager struct {
	sessions map[string]*Session
	mu       sync.RWMutex
}

var GlobalSessionManager = NewSessionManager()

func NewSessionManager() *SessionManager {
	sm := &SessionManager{
		sessions: make(map[string]*Session),
	}

	go sm.cleanupExpiredSessions()

	return sm
}

func (sm *SessionManager) CreateSession(userID, portfolioID, sessionID, sessionType string) *Session {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	session := &Session{
		ID:          sessionID,
		UserID:      userID,
		PortfolioID: portfolioID,
		Type:        sessionType,
		Status:      "active",
		Progress:    0,
		Files:       make(map[string]string),
		Logs:        []string{},
		CreatedAt:   time.Now(),
		LastActive:  time.Now(),
		TTL:         30 * time.Minute,
	}

	sm.sessions[session.ID] = session
	return session
}

func (sm *SessionManager) GetSession(sessionID string) (*Session, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	session, exists := sm.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("session not found")
	}

	return session, nil
}

func (sm *SessionManager) GetActiveSession(userID string) (*Session, bool) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	for _, session := range sm.sessions {
		if session.UserID == userID && session.Status == "active" {
			return session, true
		}
	}
	return nil, false
}

func (sm *SessionManager) UpdateSession(sessionID string, updates func(*Session)) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	session, exists := sm.sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}

	updates(session)
	session.LastActive = time.Now()
	return nil
}

func (sm *SessionManager) AddLog(sessionID, logMsg string) error {
	return sm.UpdateSession(sessionID, func(s *Session) {
		s.Logs = append(s.Logs, fmt.Sprintf("[%s] %s", time.Now().Format("15:04:05"), logMsg))
	})
}

func (sm *SessionManager) SetProgress(sessionID string, progress int) error {
	return sm.UpdateSession(sessionID, func(s *Session) {
		s.Progress = progress
	})
}

func (sm *SessionManager) CloseSession(sessionID string, status string, resultURL string) error {
	return sm.UpdateSession(sessionID, func(s *Session) {
		s.Status = status
		s.ResultURL = resultURL
		// We don't delete immediately, let TTL handle it so user can see "Finished" state
		s.TTL = 5 * time.Minute
	})
}

func (sm *SessionManager) DeleteSession(sessionID string) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	delete(sm.sessions, sessionID)
	return nil
}

func (sm *SessionManager) cleanupExpiredSessions() {
	ticker := time.NewTicker(2 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		sm.mu.Lock()
		now := time.Now()

		for id, session := range sm.sessions {
			if now.Sub(session.LastActive) > session.TTL {
				delete(sm.sessions, id)
			}
		}

		sm.mu.Unlock()
	}
}

func (sm *SessionManager) GetActiveSessions(userID string) []*Session {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	var sessions []*Session
	for _, session := range sm.sessions {
		if session.UserID == userID && session.Status == "active" {
			sessions = append(sessions, session)
		}
	}

	return sessions
}

func (sm *SessionManager) GetSessionCount() int {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	return len(sm.sessions)
}
