package websocket

import (
	"log"
	"sync"

	socketio "github.com/googollee/go-socket.io"
	"github.com/googollee/go-socket.io/engineio"
	"github.com/googollee/go-socket.io/engineio/transport"
	"github.com/googollee/go-socket.io/engineio/transport/polling"
	"github.com/googollee/go-socket.io/engineio/transport/websocket"
)

var (
	Server              *socketio.Server
	envRooms            = make(map[string][]socketio.Conn)
	envRoomsMutex       sync.RWMutex
	portfolioRooms      = make(map[string][]socketio.Conn)
	portfolioRoomsMutex sync.RWMutex
	userRooms           = make(map[string][]socketio.Conn)
	userRoomsMutex      sync.RWMutex
)

func InitSocketIO() error {
	server := socketio.NewServer(&engineio.Options{
		Transports: []transport.Transport{
			polling.Default,
			websocket.Default,
		},
	})

	server.OnConnect("/", func(s socketio.Conn) error {
		log.Printf("✅ Socket connected: %s", s.ID())
		return nil
	})

	server.OnEvent("/", "subscribe:environment", func(s socketio.Conn, data map[string]interface{}) {
		if envID, ok := data["envId"].(string); ok {
			envRoomsMutex.Lock()
			envRooms[envID] = append(envRooms[envID], s)
			envRoomsMutex.Unlock()
			log.Printf("📡 Client %s subscribed to environment: %s", s.ID(), envID)
		}
	})

	server.OnEvent("/", "subscribe:portfolio", func(s socketio.Conn, data map[string]interface{}) {
		if portfolioID, ok := data["portfolioId"].(string); ok {
			portfolioRoomsMutex.Lock()
			portfolioRooms[portfolioID] = append(portfolioRooms[portfolioID], s)
			portfolioRoomsMutex.Unlock()
			log.Printf("📡 Client %s subscribed to portfolio room: %s", s.ID(), portfolioID)
		}
	})

	server.OnEvent("/", "subscribe:user", func(s socketio.Conn, data map[string]interface{}) {
		if userID, ok := data["userId"].(string); ok {
			userRoomsMutex.Lock()
			userRooms[userID] = append(userRooms[userID], s)
			userRoomsMutex.Unlock()
			log.Printf("📡 Client %s subscribed to user room: %s", s.ID(), userID)
		}
	})

	server.OnEvent("/", "unsubscribe:environment", func(s socketio.Conn, data map[string]interface{}) {
		if envID, ok := data["envId"].(string); ok {
			envRoomsMutex.Lock()
			if conns, exists := envRooms[envID]; exists {
				for i, conn := range conns {
					if conn.ID() == s.ID() {
						envRooms[envID] = append(conns[:i], conns[i+1:]...)
						break
					}
				}
			}
			envRoomsMutex.Unlock()
			log.Printf("📡 Client %s unsubscribed from environment: %s", s.ID(), envID)
		}
	})

	server.OnEvent("/", "unsubscribe:portfolio", func(s socketio.Conn, data map[string]interface{}) {
		if portfolioID, ok := data["portfolioId"].(string); ok {
			portfolioRoomsMutex.Lock()
			if conns, exists := portfolioRooms[portfolioID]; exists {
				for i, conn := range conns {
					if conn.ID() == s.ID() {
						portfolioRooms[portfolioID] = append(conns[:i], conns[i+1:]...)
						break
					}
				}
			}
			portfolioRoomsMutex.Unlock()
			log.Printf("📡 Client %s unsubscribed from portfolio: %s", s.ID(), portfolioID)
		}
	})

	server.OnDisconnect("/", func(s socketio.Conn, reason string) {
		log.Printf("❌ Socket disconnected: %s (reason: %s)", s.ID(), reason)

		envRoomsMutex.Lock()
		for envID, conns := range envRooms {
			for i, conn := range conns {
				if conn.ID() == s.ID() {
					envRooms[envID] = append(conns[:i], conns[i+1:]...)
					break
				}
			}
		}
		envRoomsMutex.Unlock()

		portfolioRoomsMutex.Lock()
		for portfolioID, conns := range portfolioRooms {
			for i, conn := range conns {
				if conn.ID() == s.ID() {
					portfolioRooms[portfolioID] = append(conns[:i], conns[i+1:]...)
					break
				}
			}
		}
		portfolioRoomsMutex.Unlock()

		userRoomsMutex.Lock()
		for userID, conns := range userRooms {
			for i, conn := range conns {
				if conn.ID() == s.ID() {
					userRooms[userID] = append(conns[:i], conns[i+1:]...)
					break
				}
			}
		}
		userRoomsMutex.Unlock()
	})

	Server = server
	return nil
}

// Note: Broadcast functions moved to manager.go to unify logic for raw WebSocket clients.
