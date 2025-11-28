package controllers

import (
	"booking-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetRestaurants(c *gin.Context, DB *gorm.DB) {
	var restaurants []models.Restaurant
	DB.Find(&restaurants)
	c.JSON(http.StatusOK, restaurants)
}

func GetRestaurantByUserId(c *gin.Context, DB *gorm.DB) {
	userId := c.Param("id")
	
	var userRestaurant models.UserRestaurant
	if err := DB.Where("user_id = ?", userId).First(&userRestaurant).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found for this user"})
		return
	}
	
	var restaurant models.Restaurant
	if err := DB.First(&restaurant, userRestaurant.RestaurantID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{ "id": restaurant.ID,"name": restaurant.Name})
}
