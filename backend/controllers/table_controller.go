package controllers

import (
	"booking-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetTables(c *gin.Context, DB *gorm.DB) {
	var tables []models.Table
	DB.Preload("Restaurant").Find(&tables)
	c.JSON(http.StatusOK, tables)
}

func GetRestaurantTables(c *gin.Context, DB *gorm.DB) {
	var tables []models.Table
	DB.Where("restaurant_id = ?", c.Param("id")).Find(&tables)
	c.JSON(http.StatusOK, tables)
}

func CreateTable(c *gin.Context, DB *gorm.DB) {
	var table models.Table
	if err := c.ShouldBindJSON(&table); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	DB.Create(&table)
	c.JSON(http.StatusCreated, table)
}
