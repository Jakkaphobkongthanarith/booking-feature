"use client";

import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useAuth } from "./contexts/AuthContext";
import SessionList from "./components/SessionList";

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

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  number_of_guests: number;
  notes: string;
}

export default function Home() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    phone: "",
    number_of_guests: 1,
    notes: "",
  });

  const fetchSessions = async () => {
    try {
      const response = await axios.get<Session[]>(`${API_URL}/sessions`);
      setSessions(response.data || []);
      setSessionLoading(false);
    } catch (error) {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSessionBooking = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!selectedSession) return;
      if (selectedSession.available_slots === 0) {
        alert("session เต็มแล้ว");
        return;
      } else if (formData.number_of_guests > selectedSession.available_slots) {
        alert("จำนวนคนเกินที่ว่าง");
        return;
      }
      const response = await axios.post(`${API_URL}/bookings`, {
        session_id: selectedSession.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone ? formData.phone : undefined,
        number_of_guests: formData.number_of_guests,
        notes: formData.notes,
      });
      setShowBookingForm(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        number_of_guests: 1,
        notes: "",
      });
      fetchSessions();
      alert(`${formData.name} booked successfully`);
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      } else {
        alert("การจองไม่สำเร็จ");
      }
    }
  };

  const handleOpenBookingForm = (session: Session) => {
    setSelectedSession(session);
    setShowBookingForm(true);
    setFormData((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          ระบบจองออนไลน์
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            ช่วงเวลาที่จองได้
          </h2>
          {sessionLoading ? (
            <p className="text-center text-gray-500">กำลังโหลด...</p>
          ) : sessions.length === 0 ? (
            <p className="text-center text-gray-500">
              ยังไม่มี session ที่ว่าง
            </p>
          ) : (
            <SessionList
              sessions={sessions}
              loading={sessionLoading}
              showBookButton={true}
              onBook={handleOpenBookingForm}
            />
          )}
        </div>

        {showBookingForm && selectedSession && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              จอง Session {selectedSession.name || ""} ร้าน{" "}
              {selectedSession.restaurant_data?.name || ""}
            </h2>
            <form onSubmit={handleSessionBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="กรอกชื่อ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="กรอกอีเมล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทร (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="กรอกเบอร์โทร (ถ้ามี)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำนวนคน
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.number_of_guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      number_of_guests: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="จำนวนคนที่จอง"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมายเหตุ
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="หมายเหตุ (ถ้ามี)"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  ยืนยันจอง
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  onClick={() => setShowBookingForm(false)}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
