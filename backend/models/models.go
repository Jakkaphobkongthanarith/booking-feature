package models

import "time"

type Restaurant struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"not null"`
	Location    string    `json:"location" gorm:"not null"`
	Description string    `json:"description"`
	Phone       string    `json:"phone"`
	Email       string    `json:"email"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
}

type TimeSlot struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	SlotName  string    `json:"slot_name" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
}

type Table struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	RestaurantID uint       `json:"restaurant_id" gorm:"not null"`
	TableNumber  string     `json:"table_number" gorm:"not null"`
	Capacity     int        `json:"capacity" gorm:"not null"`
	Status       string     `json:"status" gorm:"default:'active'"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	Restaurant   Restaurant `json:"restaurant,omitempty" gorm:"foreignKey:RestaurantID"`
}

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;not null"`
	Password  string    `json:"password,omitempty" gorm:"not null"`
	Phone     string    `json:"phone"`
	Role      string    `json:"role" gorm:"type:enum('admin','user');default:'user';not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Session struct {
	ID             uint       `json:"id" gorm:"primaryKey"`
	RestaurantID   uint       `json:"restaurant_id" gorm:"not null"`
	Date           string     `json:"date" gorm:"type:date;not null"`
	TimeSlotID     uint       `json:"time_slot_id" gorm:"not null"`
	Name 		   string     `json:"name"`
	MaxGuests      int        `json:"max_guests" gorm:"not null"`
	AvailableSlots int        `json:"available_slots" gorm:"not null"`
	IsAvailable    bool       `json:"is_available" gorm:"default:true"`
	TimeSlot       TimeSlot   `json:"time_slot,omitempty" gorm:"foreignKey:TimeSlotID"`
}

type Booking struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	SessionID      uint      `json:"session_id" gorm:"not null"`
	UserID         *uint     `json:"user_id" gorm:"default:null"`
	UserName       string    `json:"user_name" gorm:"type:text"`
	UserEmail      string    `json:"user_email" gorm:"type:text"`
	UserPhone      string    `json:"user_phone" gorm:"type:text"`
	BookingDate    string    `json:"booking_date" gorm:"type:date;not null"`
	NumberOfGuests int       `json:"number_of_guests" gorm:"not null"`
	Status         string    `json:"status" gorm:"default:'confirmed'"`
	Notes          string    `json:"notes"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type UserRestaurant struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	RestaurantID uint      `json:"restaurant_id" gorm:"not null"`
	UserID       uint      `json:"user_id" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	Restaurant   Restaurant `json:"restaurant,omitempty" gorm:"foreignKey:RestaurantID"`
	User         User       `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (UserRestaurant) TableName() string {
	return "users_restaurant"
}
