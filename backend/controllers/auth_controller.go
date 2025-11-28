package controllers

import (
	"booking-backend/models"
	"errors"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

func isValidEmail(email string) bool {
	re := regexp.MustCompile(`^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}

func ExtractUserFromToken(c *gin.Context, DB *gorm.DB) (*models.User, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return nil, errors.New("Authorization header missing")
	}
	tokenString := authHeader
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("Invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("Invalid token claims")
	}
	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		return nil, errors.New("Invalid user_id in token")
	}
	userID := uint(userIDFloat)
	var user models.User
	if err := DB.First(&user, userID).Error; err != nil {
		return nil, errors.New("User not found")
	}
	return &user, nil
}

func GetUser(c *gin.Context, DB *gorm.DB) {
	user, err := ExtractUserFromToken(c, DB)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func sendSignupEmail(to string) {
	m := gomail.NewMessage()
	m.SetHeader("From", "jkpwork123@gmail.com")
	m.SetHeader("To", to)
	m.SetHeader("Subject", "signup complete")
	m.SetBody("text/plain", "Sign up complete!")
	d := gomail.NewDialer("smtp.gmail.com", 587, "jkpwork123@gmail.com", os.Getenv("BOOKING_GMAIL_PASSWORD"))
	err := d.DialAndSend(m)
	if err != nil {
		fmt.Println("Send email error:", err)
	} else {
		fmt.Println("Signup email sent to", to)
	}
}

func Signup(c *gin.Context, DB *gorm.DB) {
	type SignupInput struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required"`
		Phone     string `json:"phone" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	var input SignupInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !isValidEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}
	var existingEmail models.User
	if err := DB.Where("email = ?", input.Email).First(&existingEmail).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}
	var existingName models.User
	if err := DB.Where("name = ?", input.Name).First(&existingName).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name already registered"})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Phone:     input.Phone,
		Password: string(hashedPassword),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	DB.Create(&user)
	go sendSignupEmail(user.Email)
	c.JSON(http.StatusCreated, gin.H{"message": "Signup successful", "user": user})
}

func Login(c *gin.Context, DB *gorm.DB) {
	type LoginInput struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"email":    user.Email,
		"exp":      time.Now().Add(time.Hour * 72).Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": tokenString, "user": user})
}
