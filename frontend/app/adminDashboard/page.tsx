"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import SessionList from "../components/SessionList";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

interface Session {
  id: number;
  name: string;
  date: string;
  max_guests: number;
  available_slots: number;
  restaurant_data?: { name: string };
  time_slot?: { slot_name: string };
}

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
interface Restaurant {
  name: string;
}

interface TimeSlot {
  id: number;
  slot_name: string;
}

interface CreateSessionForm {
  time_slot_id: number;
  name: string;
  date: string;
  max_guests: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timeSlotLoading, setTimeSlotLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState<CreateSessionForm>({
    time_slot_id: 0,
    name: "",
    date: "",
    max_guests: 1,
  });
  const [editForm, setEditForm] = useState<CreateSessionForm>({
    time_slot_id: 0,
    name: "",
    date: "",
    max_guests: 1,
  });
  const handleDeleteSession = async (id: number) => {
    if (confirm("คุณต้องการลบ Session นี้หรือไม่?")) {
      try {
        await axios.delete(`${API_URL}/sessions/${id}`);
        fetchSessions();
        alert("ลบ Session สำเร็จ!");
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบ Session");
      }
    }
  };

  const handleEditSession = (session: Session) => {
    setEditSession(session);
    setEditForm({
      time_slot_id: session.time_slot?.slot_name
        ? timeSlots.find((ts) => ts.slot_name === session.time_slot?.slot_name)
            ?.id || 0
        : 0,
      name: session.name,
      date: session.date,
      max_guests: session.max_guests,
    });
    setShowEditModal(true);
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSession) return;
    try {
      await axios.put(`${API_URL}/sessions/${editSession.id}`, {
        time_slot_id: editForm.time_slot_id,
        name: editForm.name,
        date: editForm.date,
        max_guests: editForm.max_guests,
      });
      alert("แก้ไข Session สำเร็จ!");
      setShowEditModal(false);
      setEditSession(null);
      fetchSessions();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการแก้ไข Session");
    }
  };
  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get<TimeSlot[]>(`${API_URL}/time-slots`);
      setTimeSlots(response.data || []);
      setTimeSlotLoading(false);
    } catch (error) {
      setTimeSlotLoading(false);
    }
  };

  const [restaurantName, setRestaurantName] = useState<string>("");
  const fetchRestaurantName = async (userId: string) => {
    try {
      const response = await axios.get<{ id: number; name: string }>(
        `${API_URL}/restaurants/${userId}`
      );
      setRestaurantName(response.data.name || "");
      setRestaurantId(response.data.id || null);
    } catch (error) {
      setRestaurantName("");
      setRestaurantId(null);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) {
      alert("ไม่พบข้อมูลร้านของคุณ");
      return;
    }
    if (!createForm.time_slot_id || createForm.time_slot_id === 0) {
      alert("กรุณาเลือกช่วงเวลา");
      return;
    }
    try {
      await axios.post(`${API_URL}/sessions`, {
        restaurant_id: restaurantId,
        time_slot_id: createForm.time_slot_id,
        name: createForm.name,
        date: createForm.date,
        max_guests: createForm.max_guests,
      });
      alert("สร้าง Session สำเร็จ!");
      setShowCreateModal(false);
      setCreateForm({
        time_slot_id: 0,
        name: "",
        date: "",
        max_guests: 1,
      });
      fetchSessions();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้าง Session");
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get<Session[]>(`${API_URL}/sessions`);
      setSessions(response.data || []);
      setSessionLoading(false);
    } catch (error) {
      setSessionLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get<Booking[]>(`${API_URL}/bookings`);
      setBookings(response.data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchBookings();
    fetchTimeSlots();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchRestaurantName(user.id);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Admin Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              รายการ Session
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold"
            >
              + สร้าง Session
            </button>
          </div>
          {sessionLoading ? (
            <p className="text-center text-gray-500">กำลังโหลด...</p>
          ) : sessions.length === 0 ? (
            <p className="text-center text-gray-500">ไม่มี session</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      ชื่อ Session
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      วันที่
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      ช่วงเวลา
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      จำนวนคนสูงสุด
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      เหลือที่ว่าง
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{session.name}</td>
                      <td className="px-4 py-3 text-sm">{session.date}</td>
                      <td className="px-4 py-3 text-sm">
                        {session.time_slot?.slot_name || ""}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {session.max_guests}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {session.available_slots}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleEditSession(session)}
                          className="bg-yellow-400 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-500"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {showEditModal && editSession && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  แก้ไข Session
                </h2>
                <form onSubmit={handleUpdateSession} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ช่วงเวลา *
                    </label>
                    <select
                      required
                      value={editForm.time_slot_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          time_slot_id: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>-- เลือกช่วงเวลา --</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.slot_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ Session *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น Dinner Special"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันที่ *
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm({ ...editForm, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      จำนวนคนสูงสุด *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editForm.max_guests}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          max_guests: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="จำนวนคน"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-semibold transition"
                    >
                      บันทึก
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditSession(null);
                      }}
                      className="flex-1 bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 font-semibold transition"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            รายการจองทั้งหมด
          </h2>
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
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{booking.user_name}</td>
                      <td className="px-4 py-3 text-sm">
                        {booking.user_email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {booking.user_phone}
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                สร้าง Session ใหม่
              </h2>
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ช่วงเวลา *
                  </label>
                  <select
                    required
                    value={createForm.time_slot_id}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        time_slot_id: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>-- เลือกช่วงเวลา --</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.slot_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ Session *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="เช่น Dinner Special"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันที่ *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.date}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนคนสูงสุด *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={createForm.max_guests}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        max_guests: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="จำนวนคน"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-semibold transition"
                  >
                    สร้าง Session
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 font-semibold transition"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
