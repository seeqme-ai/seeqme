package services

import (
	"fmt"
	"sync"
	"time"
)

type Session struct {
	ID          string
	UserID      string
	PortfolioID string
	EnvID       string
	WorkflowID  string
	Status      string
	Files       map[string]string
	Logs        []string
	CreatedAt   time.Time
	LastActive  time.Time
	TTL         time.Duration
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

func (sm *SessionManager) CreateSession(userID, portfolioID, envID string) *Session {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	session := &Session{
		ID:          envID,
		UserID:      userID,
		PortfolioID: portfolioID,
		EnvID:       envID,
		Status:      "active",
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

func (sm *SessionManager) AddFile(sessionID, path, content string) error {
	return sm.UpdateSession(sessionID, func(s *Session) {
		s.Files[path] = content
	})
}

func (sm *SessionManager) GetFiles(sessionID string) (map[string]string, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	session, exists := sm.sessions[sessionID]
	if !exists {
		return nil, fmt.Errorf("session not found")
	}

	return session.Files, nil
}

func (sm *SessionManager) AddLog(sessionID, log string) error {
	return sm.UpdateSession(sessionID, func(s *Session) {
		s.Logs = append(s.Logs, fmt.Sprintf("[%s] %s", time.Now().Format("15:04:05"), log))
	})
}

func (sm *SessionManager) DeleteSession(sessionID string) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	session, exists := sm.sessions[sessionID]
	if !exists {
		return fmt.Errorf("session not found")
	}

	session.Files = nil
	session.Logs = nil
	
	delete(sm.sessions, sessionID)
	return nil
}

func (sm *SessionManager) cleanupExpiredSessions() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		sm.mu.Lock()
		now := time.Now()
		
		for id, session := range sm.sessions {
			if now.Sub(session.LastActive) > session.TTL {
				session.Files = nil
				session.Logs = nil
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
