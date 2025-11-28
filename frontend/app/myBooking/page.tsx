"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Booking {
  id: number;
  session_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  number_of_guests: number;
  booking_date: string;
  notes: string;
  status: string;
}

export default function MyBooking() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user?.email) {
      fetchBookings(user.email);
    }
  }, [user]);

  const fetchBookings = async (email: string) => {
    try {
      const response = await axios.get<Booking[]>(
        `${API_URL}/bookings/user/${email}`
      );
      setBookings(response.data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!user?.email) return;
    if (confirm("คุณต้องการลบการจองนี้หรือไม่?")) {
      try {
        await axios.delete(`${API_URL}/bookings/${user.email}/${id}`);
        fetchBookings(user.email);
        alert("ลบสำเร็จ!");
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          การจองของฉัน
        </h1>
        {loading ? (
          <p className="text-center text-gray-500">กำลังโหลด...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-gray-500">ยังไม่มีรายการจอง</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    ชื่อ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    อีเมล
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    เบอร์โทร
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    จำนวนคน
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    วันที่จอง
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{booking.user_name}</td>
                    <td className="px-4 py-3 text-sm">{booking.user_email}</td>
                    <td className="px-4 py-3 text-sm">{booking.user_phone}</td>
                    <td className="px-4 py-3 text-sm">
                      {booking.number_of_guests}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {booking.booking_date}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status === "confirmed" ? "สำเร็จ" : "ยกเลิก"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className={`text-red-600 hover:text-red-800 font-medium border border-red-500 rounded px-3 py-1 ${
                          booking.status !== "confirmed"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={booking.status !== "confirmed"}
                      >
                        ยกเลิก
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
