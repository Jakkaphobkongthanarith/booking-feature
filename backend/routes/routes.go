package routes

import (
	"booking-backend/controllers"
	"booking-backend/websocket"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.Engine, DB *gorm.DB) {
	r.GET("/", func(c *gin.Context) { controllers.Root(c) })
	r.GET("/health", func(c *gin.Context) { controllers.Health(c) })
	r.GET("/ws", websocket.HandleWebSocket)

	api := r.Group("/api")
	{
		api.POST("/signup", func(c *gin.Context) { controllers.Signup(c, DB) })
		api.POST("/login", func(c *gin.Context) { controllers.Login(c, DB) })

		api.GET("/restaurants", func(c *gin.Context) { controllers.GetRestaurants(c, DB) })
		api.GET("/restaurants/:id", func(c *gin.Context) { controllers.GetRestaurantByUserId(c, DB) })
		api.POST("/restaurants", func(c *gin.Context) { /* implement create restaurant handler */ })

		api.GET("/time-slots", func(c *gin.Context) { controllers.GetTimeSlots(c, DB) })

		api.GET("/tables", func(c *gin.Context) { controllers.GetTables(c, DB) })
		api.GET("/restaurants/:id/tables", func(c *gin.Context) { controllers.GetRestaurantTables(c, DB) })
		api.POST("/tables", func(c *gin.Context) { controllers.CreateTable(c, DB) })

		api.GET("/users", func(c *gin.Context) { controllers.GetUsers(c, DB) })
		api.POST("/users", func(c *gin.Context) { controllers.CreateUser(c, DB) })

		api.GET("/sessions", func(c *gin.Context) { controllers.GetSessions(c, DB) })
		api.POST("/sessions", func(c *gin.Context) { controllers.CreateSession(c, DB) })
		api.PUT("/sessions/:id", func(c *gin.Context) { controllers.UpdateSession(c, DB) })
		api.DELETE("/sessions/:id", func(c *gin.Context) { controllers.DeleteSession(c, DB) })

		api.GET("/bookings", func(c *gin.Context) { controllers.GetBookings(c, DB) })
		api.GET("/bookings/user/:email", func(c *gin.Context) { controllers.GetBookingByEmail(c, DB) })
		api.POST("/bookings", func(c *gin.Context) { controllers.CreateBooking(c, DB) })
		api.PUT("/bookings/:id", func(c *gin.Context) { controllers.UpdateBooking(c, DB) })
		api.DELETE("/bookings/:email/:id", func(c *gin.Context) { controllers.CancelBooking(c, DB, websocket.GlobalHub) })

		api.GET("/user", func(c *gin.Context) { controllers.GetUser(c, DB) })
	}
}
