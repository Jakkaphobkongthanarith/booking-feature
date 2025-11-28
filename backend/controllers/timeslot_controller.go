package controllers

import (
	"booking-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetTimeSlots(c *gin.Context, DB *gorm.DB) {
	var slots []models.TimeSlot
	DB.Find(&slots)
	c.JSON(http.StatusOK, slots)
}

