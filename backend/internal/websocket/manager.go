package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for now
	},
}

// Client represents a connected user
type Client struct {
	ID    string
	Conn  *websocket.Conn
	Rooms map[string]bool
	mu    sync.Mutex
}

// WSManager handles all active connections
type WSManager struct {
	clients map[*Client]bool
	rooms   map[string]map[*Client]bool
	mu      sync.RWMutex
}

var Manager *WSManager

func init() {
	Manager = &WSManager{
		clients: make(map[*Client]bool),
		rooms:   make(map[string]map[*Client]bool),
	}
}

func (m *WSManager) HandleConnection(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("❌ Upgrade failed: %v", err)
		return
	}

	client := &Client{
		Conn:  conn,
		Rooms: make(map[string]bool),
	}

	m.mu.Lock()
	m.clients[client] = true
	m.mu.Unlock()

	log.Printf("🔌 Webhook Client Connected: %p", client)

	defer func() {
		m.mu.Lock()
		delete(m.clients, client)
		for roomID := range client.Rooms {
			if roomClients, ok := m.rooms[roomID]; ok {
				delete(roomClients, client)
				if len(roomClients) == 0 {
					delete(m.rooms, roomID)
				}
			}
		}
		m.mu.Unlock()
		conn.Close()
		log.Printf("❌ Webhook Client Disconnected: %p", client)
	}()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var payload struct {
			Type string `json:"type"`
			Room string `json:"room"`
		}

		if err := json.Unmarshal(msg, &payload); err != nil {
			log.Printf("⚠️ Invalid WS message: %v", err)
			continue
		}

		switch payload.Type {
		case "subscribe":
			m.mu.Lock()
			if m.rooms[payload.Room] == nil {
				m.rooms[payload.Room] = make(map[*Client]bool)
			}
			m.rooms[payload.Room][client] = true
			client.mu.Lock()
			client.Rooms[payload.Room] = true
			client.mu.Unlock()
			m.mu.Unlock()
			log.Printf("📡 Client %p subscribed to room: %s", client, payload.Room)
		case "unsubscribe":
			m.mu.Lock()
			if roomClients, ok := m.rooms[payload.Room]; ok {
				delete(roomClients, client)
			}
			client.mu.Lock()
			delete(client.Rooms, payload.Room)
			client.mu.Unlock()
			m.mu.Unlock()
			log.Printf("📡 Client %p unsubscribed from room: %s", client, payload.Room)
		}
	}
}

func (m *WSManager) BroadcastToRoom(roomID string, event string, data interface{}) {
	m.mu.RLock()
	clients, ok := m.rooms[roomID]
	m.mu.RUnlock()

	if !ok {
		return
	}

	payload, err := json.Marshal(map[string]interface{}{
		"event": event,
		"data":  data,
	})
	if err != nil {
		log.Printf("❌ Failed to marshal broadcast: %v", err)
		return
	}

	for client := range clients {
		go func(c *Client) {
			c.mu.Lock()
			defer c.mu.Unlock()
			if err := c.Conn.WriteMessage(websocket.TextMessage, payload); err != nil {
				log.Printf("⚠️ Failed to send to client %p: %v", c, err)
			}
		}(client)
	}
}

func BroadcastToUser(userID string, event string, data interface{}) {
	Manager.BroadcastToRoom("user:"+userID, event, data)
}

func BroadcastToPortfolio(portfolioID string, event string, data interface{}) {
	Manager.BroadcastToRoom("portfolio:"+portfolioID, event, data)
}

func BroadcastToSession(sessionID string, event string, data interface{}) {
	Manager.BroadcastToRoom("session:"+sessionID, event, data)
}
