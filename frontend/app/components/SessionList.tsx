import React from "react";

interface Session {
  id: number;
  name: string;
  date: string;
  max_guests: number;
  available_slots: number;
  restaurant_data?: { name: string };
  time_slot?: { slot_name: string };
}

interface SessionListProps {
  sessions: Session[];
  loading: boolean;
  showBookButton?: boolean;
  onBook?: (session: Session) => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  loading,
  showBookButton = false,
  onBook,
}) => {
  return (
    <div
      className={
        sessions.length > 10 ? "max-h-96 overflow-y-auto" : "overflow-x-auto"
      }
    >
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              ร้าน
            </th>
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
              จำนวนคน
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
              ที่ว่าง
            </th>
            {showBookButton && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                จอง
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">
                {session.restaurant_data?.name || "-"}
              </td>
              <td className="px-4 py-3 text-sm">{session.name || "-"}</td>
              <td className="px-4 py-3 text-sm">{session.date}</td>
              <td className="px-4 py-3 text-sm">
                {session.time_slot?.slot_name || "-"}
              </td>
              <td className="px-4 py-3 text-sm">{session.max_guests}</td>
              <td className="px-4 py-3 text-sm">{session.available_slots}</td>
              {showBookButton && (
                <td className="px-4 py-3 text-sm">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => onBook && onBook(session)}
                  >
                    จอง
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SessionList;
