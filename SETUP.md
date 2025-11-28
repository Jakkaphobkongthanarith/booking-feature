# ขั้นตอนการเริ่มต้นโปรเจกต์

## 1. เตรียม PostgreSQL Database

เปิด **pgAdmin4** และทำตามขั้นตอน:

1. คลิกขวาที่ Databases
2. เลือก Create > Database
3. ตั้งชื่อ: `booking_db`
4. คลิก Save

หรือใช้ SQL Query:

```sql
CREATE DATABASE booking_db;
```

## 2. ตั้งค่า Backend (Golang)

```powershell
# เข้าไปที่โฟลเดอร์ backend
cd backend

# คัดลอกไฟล์ .env
copy .env.example .env

# แก้ไขไฟล์ .env (ใช้ notepad หรือ text editor)
notepad .env
```

แก้ไขค่าใน `.env`:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=<รหัสผ่าน PostgreSQL ของคุณ>
DB_NAME=booking_db
DB_PORT=5432
PORT=8080
```

ติดตั้ง dependencies และรัน:

```powershell
# ติดตั้ง Go modules
go mod download

# รัน backend server
go run main.go
```

✅ Backend จะรันที่ `http://localhost:8080`

## 3. ตั้งค่า Frontend (Next.js)

**เปิด terminal ใหม่อีกหน้าต่าง** แล้วรันคำสั่ง:

```powershell
# เข้าไปที่โฟลเดอร์ frontend
cd frontend

# ติดตั้ง dependencies
npm install

# คัดลอกไฟล์ .env.local
copy .env.local.example .env.local

# รัน frontend development server
npm run dev
```

✅ Frontend จะรันที่ `http://localhost:3000`

## 4. ทดสอบระบบ

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
2. ลองกรอกข้อมูลในฟอร์มจอง
3. คลิก "จองเลย"
4. ดูรายการจองที่แสดงด้านล่าง

## 5. ตรวจสอบข้อมูลใน Database

เปิด pgAdmin4:

1. เข้าไปที่ Database > booking_db
2. คลิกขวา > Query Tool
3. รัน query:

```sql
SELECT * FROM bookings;
```

## คำสั่งที่จำเป็น

### Backend

```powershell
cd backend
go run main.go              # รัน server
go build                    # build เป็น executable
```

### Frontend

```powershell
cd frontend
npm run dev                 # รัน development mode
npm run build               # build สำหรับ production
npm start                   # รัน production server
```

## แก้ไขปัญหาที่พบบ่อย

### ปัญหา: Backend ไม่สามารถเชื่อมต่อ Database

```
Error: failed to connect to database
```

**วิธีแก้:**

1. ตรวจสอบว่า PostgreSQL กำลังรัน (เปิด pgAdmin4)
2. ตรวจสอบ username/password ใน `.env`
3. ตรวจสอบว่าสร้าง database `booking_db` แล้ว

### ปัญหา: Frontend ไม่แสดงข้อมูล

```
Network Error / CORS Error
```

**วิธีแก้:**

1. ตรวจสอบว่า Backend รันอยู่ที่ port 8080
2. ลองเปิด `http://localhost:8080/health` ใน browser
3. ตรวจสอบ `.env.local` ว่ามี `NEXT_PUBLIC_API_URL` ถูกต้อง

### ปัญหา: Go command not found

**วิธีแก้:**
ติดตั้ง Go จาก https://go.dev/dl/

### ปัญหา: npm command not found

**วิธีแก้:**
ติดตั้ง Node.js จาก https://nodejs.org/

## การปิดระบบ

กด `Ctrl + C` ใน terminal ทั้ง Backend และ Frontend
