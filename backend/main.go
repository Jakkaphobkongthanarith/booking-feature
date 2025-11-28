package main

import (
	"booking-backend/routes"
	"booking-backend/utils"
	"booking-backend/websocket"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	DB := utils.InitDB()
	r := gin.Default()

	go websocket.GlobalHub.Run()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	routes.RegisterRoutes(r, DB)

	port := utils.GetEnv("PORT", "8080")
	log.Printf("Server running on port %s", port)
	r.Run(":" + port)
}

