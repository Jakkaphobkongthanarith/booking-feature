package controllers

import (
	"booking-backend/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetBookings(c *gin.Context, DB *gorm.DB) {
	var bookings []models.Booking
	DB.Order("created_at desc").Find(&bookings)

	type BookingWithUserAndRestaurant struct {
		models.Booking
		RestaurantName   string      `json:"restaurant_name"`
	}
	var result []BookingWithUserAndRestaurant
	for _, b := range bookings {
		var session models.Session
		DB.First(&session, b.SessionID)
		var restaurant models.Restaurant
		DB.First(&restaurant, session.RestaurantID)
		result = append(result, BookingWithUserAndRestaurant{
			Booking:          b,
			RestaurantName:   restaurant.Name,
		})
	}
	c.JSON(http.StatusOK, result)
}

func GetBookingByEmail(c *gin.Context, DB *gorm.DB) {
    email := c.Param("email")
	var bookings []models.Booking
	if err := DB.Where("user_email = ?", email).Order("created_at desc").Find(&bookings).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "No bookings found for this email"})
        return
    }
    c.JSON(http.StatusOK, bookings)
}

func CreateBooking(c *gin.Context, DB *gorm.DB) {
	var input struct {
		SessionID      uint   `json:"session_id"`
		Name           string `json:"name"`
		Email          string `json:"email"`
		Phone          *string `json:"phone"`
		NumberOfGuests int    `json:"number_of_guests"`
		Notes          string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Phone != nil && *input.Phone != "" {
		phone := *input.Phone
		for _, ch := range phone {
			if ch < '0' || ch > '9' {
				c.JSON(http.StatusBadRequest, gin.H{"error": "เบอร์โทรต้องเป็นตัวเลขเท่านั้น"})
				return
			}
		}
		if len(phone) != 10 || phone[0] != '0' {
			c.JSON(http.StatusBadRequest, gin.H{"error": "เบอร์โทรต้องมี 10 หลักและขึ้นต้นด้วย 0"})
			return
		}
	}

	var session models.Session
	if err := DB.First(&session, input.SessionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Session not found"})
		return
	}
	if session.AvailableSlots < input.NumberOfGuests {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough slots"})
		return
	}

	booking := models.Booking{
		SessionID:      input.SessionID,
		UserName:       input.Name,
		UserEmail:      input.Email,
		UserPhone:      "",
		BookingDate:    time.Now().Format("2006-01-02"),
		NumberOfGuests: input.NumberOfGuests,
		Status:         "confirmed",
		Notes:          input.Notes,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}
	if input.Phone != nil {
		booking.UserPhone = *input.Phone
	}
	result := DB.Create(&booking)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	session.AvailableSlots -= input.NumberOfGuests
	if session.AvailableSlots == 0 {
		session.IsAvailable = false
	}
	DB.Save(&session)

	c.JSON(http.StatusCreated, gin.H{
		"message": input.Name + " booked successfully",
		"booking": booking,
	})
}

func UpdateBooking(c *gin.Context, DB *gorm.DB) {
	var booking models.Booking
	if err := DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	oldStatus := booking.Status
	var input struct {
		UserName       *string `json:"user_name"`
		UserEmail      *string `json:"user_email"`
		UserPhone      *string `json:"user_phone"`
		NumberOfGuests *int    `json:"number_of_guests"`
		Status         *string `json:"status"`
		Notes          *string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.UserName != nil {
		booking.UserName = *input.UserName
	}
	if input.UserEmail != nil {
		booking.UserEmail = *input.UserEmail
	}
	if input.UserPhone != nil {
		booking.UserPhone = *input.UserPhone
	}
	if input.NumberOfGuests != nil {
		booking.NumberOfGuests = *input.NumberOfGuests
	}
	if input.Status != nil {
		booking.Status = *input.Status
	}
	if input.Notes != nil {
		booking.Notes = *input.Notes
	}

	if oldStatus != "cancelled" && booking.Status == "cancelled" {
		var session models.Session
		if err := DB.First(&session, booking.SessionID).Error; err == nil {
			session.AvailableSlots += booking.NumberOfGuests
			session.IsAvailable = true
			DB.Save(&session)
		}
	}

	DB.Save(&booking)
	c.JSON(http.StatusOK, gin.H{
		"message": "Booking updated",
		"booking": booking,
	})
}

func DeleteBooking(c *gin.Context, DB *gorm.DB) {
	var booking models.Booking
	if err := DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	var session models.Session
	if err := DB.First(&session, booking.SessionID).Error; err == nil {
		session.AvailableSlots += booking.NumberOfGuests
		session.IsAvailable = true
		DB.Save(&session)
	}

	DB.Delete(&booking)
	c.JSON(http.StatusOK, gin.H{"message": "Booking deleted"})
}


func CancelBooking(c *gin.Context, DB *gorm.DB, hub interface { BroadcastSessionCancelled(string, string) }) {
    email := c.Param("email")
    bookingId := c.Param("id")
    var booking models.Booking
    if err := DB.Where("id = ? AND user_email = ?", bookingId, email).First(&booking).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found for this email"})
        return
    }
    if booking.Status == "cancelled" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Booking already cancelled"})
        return
    }
    booking.Status = "cancelled"
    DB.Save(&booking)

    var session models.Session
    if err := DB.First(&session, booking.SessionID).Error; err == nil {
        session.AvailableSlots += booking.NumberOfGuests
        session.IsAvailable = true
        DB.Save(&session)
        
        hub.BroadcastSessionCancelled(session.Name, booking.UserName)
    }
	c.JSON(http.StatusOK, gin.H{"message": "Sessions cancelled, seats available again", "booking": booking})
}
