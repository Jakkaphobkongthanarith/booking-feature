package controllers

import (
	"booking-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetUsers(c *gin.Context, DB *gorm.DB) {
	var users []models.User
	DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context, DB *gorm.DB) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if user.Role == "" {
		user.Role = "user"
	}
	DB.Create(&user)
	c.JSON(http.StatusCreated, user)
}
