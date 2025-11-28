Design Choice
Database: Supabase(postgres)
หน้าบ้าน + หลังบ้้าน: next + go
จากฟีเจอร์ที่ได้รับมอบหมาย ผมทำการอิงมาจากการจองsessionซึ่งจะแบ่งเป็น
สถานที่ -> session -> booking
โดย สถานที่ จะเชื่อมกับ user ที่มี role เป็น admin (user management สามารถต่อเติมเพิ่มได้เช่นสร้าง superAdmin/manager ในการสร้าง ผู้ใช้ที่มีrole admin, สร้าง สถานที่สำหรับ session แยกย่อย)

- สถานที่ เนื่องจากตอนดีไซน์เริ่มแรก นึกถึงระบบร้านอาหาร จึงตั้งเป็น restaurant ไว้ ซึ่งจะเชื่อมกับผู้ใช้ที่เป็น admin และมี location เป็นของตนเอง
- เมื่อทำการสมัครสมาชิก จะมีการตรวจสอบว่าอีเมลและชื่อที่ใช้สมัคร ซึ่งเมื่อสมัครสำเร็จ จะมีเมลแจ้งว่า signup complete
- role user จะสามารถ ดู จอง ยกเลิก sessionของตนเอง ได้ หากตัว session นั้นยังมีที่ว่างอยู่ ซึ่งจะมีhandleรองรับ เมื่อยกเลิกการจอง session จะใช้ websocket แจ้งเตือนผู้ใช้คนอื่นๆว่ามีผูใช้ยกเลิกการจอง
- role admin ที่ผูกกับสถานที่ สามารถทำสิ่งที่ role user ทำได้ และสามารถ สร้าง แก้ไข ลบ session ได้ รวมถึงดูรายการการจองของ User ทั้งหมด
- ระบบGIS พยามทำแล้วไม่สำเร็จครับ T-T

-------------------- วิธีรัน ----------------------
front

> cd frontend
> npm install
> npm run dev

back
> cd backend
> go mod tidy
> go run main.go

deploy link: https://nurturing-bravery-frontend.up.railway.app/
