package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mutex      sync.RWMutex
}

var GlobalHub = &Hub{
	clients:    make(map[*websocket.Conn]bool),
	broadcast:  make(chan []byte),
	register:   make(chan *websocket.Conn),
	unregister: make(chan *websocket.Conn),
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mutex.Lock()
			h.clients[client] = true
			h.mutex.Unlock()
			log.Println("New WebSocket client connected")

		case client := <-h.unregister:
			h.mutex.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
			}
			h.mutex.Unlock()
			log.Println("WebSocket client disconnected")

		case message := <-h.broadcast:
			h.mutex.RLock()
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("Error sending message: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mutex.RUnlock()
		}
	}
}

func (h *Hub) BroadcastSessionCancelled(sessionName, userName string) {
	data := map[string]interface{}{
		"type":        "sessionCancelled",
		"sessionName": sessionName,
		"userName":    userName,
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling data: %v", err)
		return
	}
	h.broadcast <- jsonData
}
