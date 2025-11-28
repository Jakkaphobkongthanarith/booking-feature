package utils

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() *gorm.DB {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	var dsn string
	databaseURL := os.Getenv("DATABASE_URL")

	if databaseURL != "" {
		dsn = databaseURL
		log.Println("Using DATABASE_URL for connection")
	} else {
		sslMode := GetEnv("DB_SSLMODE", "disable")
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Bangkok",
			GetEnv("DB_HOST", "localhost"),
			GetEnv("DB_USER", "postgres"),
			GetEnv("DB_PASSWORD", ""),
			GetEnv("DB_NAME", "booking_db"),
			GetEnv("DB_PORT", "5432"),
			sslMode,
		)
		log.Println("Using individual DB config for connection")
	}

	DB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully!")
	return DB
}

func GetEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
