package controllers

import (
	"booking-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UpdateSessionInput struct {
	TimeSlotID   uint   `json:"time_slot_id"`
	Name         string `json:"name"`
	Date         string `json:"date"`
	MaxGuests    int    `json:"max_guests"`
}


type SessionModel struct {
	ID             uint            `json:"id"`
	RestaurantID   uint            `json:"restaurant_id"`
	Date           string          `json:"date"`
	TimeSlotID     uint            `json:"time_slot_id"`
	Name 		  	string          `json:"name"`
	MaxGuests      int             `json:"max_guests"`
	AvailableSlots int             `json:"available_slots"`
	IsAvailable    bool            `json:"is_available"`
	TimeSlot       models.TimeSlot `json:"time_slot"`
	Bookings       []models.Booking `json:"bookings"`
	RestaurantData models.Restaurant `json:"restaurant_data"`
}

func GetSessions(c *gin.Context, DB *gorm.DB) {
	var sessions []models.Session
	restaurantID := c.Query("restaurant_id")
	query := DB.Preload("TimeSlot").Order("created_at desc")
	if restaurantID != "" {
		query = query.Where("restaurant_id = ?", restaurantID)
	}
	query.Find(&sessions)

	var result []SessionModel
	for _, sess := range sessions {
		var bookings []models.Booking
		DB.Where("session_id = ?", sess.ID).Find(&bookings)

		var restaurant models.Restaurant
		DB.Where("id = ?", sess.RestaurantID).First(&restaurant)

		result = append(result, SessionModel{
			ID:             sess.ID,
			RestaurantID:   sess.RestaurantID,
			Date:           sess.Date,
			TimeSlotID:     sess.TimeSlotID,
			Name:           sess.Name,
			MaxGuests:      sess.MaxGuests,
			AvailableSlots: sess.AvailableSlots,
			IsAvailable:    sess.IsAvailable,
			TimeSlot:       sess.TimeSlot,
			Bookings:       bookings,
			RestaurantData: restaurant,
		})
	}
	c.JSON(http.StatusOK, result)
}

type CreateSessionInput struct {
	RestaurantID uint   `json:"restaurant_id" binding:"required"`
	TimeSlotID   uint   `json:"time_slot_id" binding:"required"`
	Name         string `json:"name" binding:"required"`
	Date         string `json:"date" binding:"required"`
	MaxGuests    int    `json:"max_guests" binding:"required"`
}

func CreateSession(c *gin.Context, DB *gorm.DB) {
	var input CreateSessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var restaurant models.Restaurant
	if err := DB.First(&restaurant, input.RestaurantID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	var timeSlot models.TimeSlot
	if err := DB.First(&timeSlot, input.TimeSlotID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Time slot not found"})
		return
	}


	session := models.Session{
		RestaurantID:   input.RestaurantID,
		TimeSlotID:     input.TimeSlotID,
		Name:           input.Name,
		Date:           input.Date,
		MaxGuests:      input.MaxGuests,
		AvailableSlots: input.MaxGuests,
		IsAvailable:    true,
	}

	if err := DB.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session"})
		return
	}

	DB.Preload("TimeSlot").Preload("Restaurant").First(&session, session.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Session created successfully",
		"session": session,
	})
}

func UpdateSession(c *gin.Context, DB *gorm.DB) {
	id := c.Param("id")
	var session models.Session
	if err := DB.First(&session, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}

	var input UpdateSessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	session.TimeSlotID = input.TimeSlotID
	session.Name = input.Name
	session.Date = input.Date
	session.MaxGuests = input.MaxGuests
	DB.Save(&session)

	c.JSON(http.StatusOK, gin.H{"message": "Session updated successfully", "session": session})
}

func DeleteSession(c *gin.Context, DB *gorm.DB) {
	id := c.Param("id")
	var session models.Session
	if err := DB.First(&session, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}
	if err := DB.Delete(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Session deleted successfully"})
}
