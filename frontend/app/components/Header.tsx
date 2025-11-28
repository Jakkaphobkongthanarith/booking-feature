"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

interface Notification {
  message: string;
  timestamp: string;
}

export default function Header() {
  const { user, loading: userLoading, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfilePanel, setShowProfilePanel] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!wsRef.current) {
      const ws = new WebSocket("ws://localhost:8080/ws");

      ws.onopen = () => {
        console.log("ws connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "sessionCancelled") {
            setNotifications((prev) => [
              {
                message: `มีผู้ใช้ยกเลิกการจอง session ${data.sessionName}`,
                timestamp: new Date().toLocaleTimeString(),
              },
              ...prev,
            ]);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        wsRef.current = null;
      };

      wsRef.current = ws;
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <header className="w-full flex justify-between items-center py-4 px-8 bg-white shadow">
        <div className="flex gap-2 items-center">
          <div>
            <Link href="/">
              <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
                Homepage
              </button>
            </Link>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {userLoading ? (
            <span className="text-gray-400">Loading...</span>
          ) : user ? (
            <>
              {user && (
                <div className="flex justify-center items-center">
                  <span className="font-semibold text-green-700">
                    Hello, {user.name}
                  </span>
                  <button
                    className="relative bg-transparent  cursor-pointer p-4 rounded"
                    onClick={() => setShowProfilePanel((prev) => !prev)}
                    aria-label="Profile"
                  >
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" fill="#555" />
                      <path d="M4 20c0-4 8-4 8-4s8 0 8 4" fill="#555" />
                    </svg>
                  </button>
                  <button
                    className="relative bg-transparent  mr-4 rounded"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    aria-label="Notifications"
                  >
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 006 19h12a1 1 0 00.71-1.71L18 16z"
                        fill="#555"
                      />
                    </svg>
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>
              )}
              <button
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded font-semibold hover:bg-gray-300 transition"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 transition">
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </header>
      {showProfilePanel && user && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfilePanel(false)}
          />
          <div className="absolute top-16 right-8 w-64 bg-white shadow-lg rounded-lg z-50 p-4">
            <h3 className="text-lg font-bold mb-4">เมนู</h3>
            {user.role === "admin" ? (
              <Link href="/adminDashboard">
                <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 mb-2">
                  แดชบอร์ด
                </button>
              </Link>
            ) : null}
            <Link href="/myBooking">
              <button className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 mb-2">
                การจองของฉัน
              </button>
            </Link>
            <button
              className="w-full bg-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-400"
              onClick={() => setShowProfilePanel(false)}
            >
              ปิด
            </button>
          </div>
        </>
      )}
      {showNotifications && (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 p-6 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notif, idx) => (
                <li key={idx} className="bg-gray-100 rounded p-3 flex flex-col">
                  <span>{notif.message}</span>
                  <span className="text-xs text-gray-400 mt-1">
                    {notif.timestamp}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            className="mt-6 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            onClick={() => setShowNotifications(false)}
          >
            ปิด
          </button>
        </div>
      )}
    </>
  );
}
