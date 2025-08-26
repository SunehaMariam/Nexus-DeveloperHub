import React, { useState } from "react";

// Local Card component (no import needed)
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={`bg-white shadow rounded ${className}`} {...props}>
    {children}
  </div>
);

// Local Button component (replace with your own or a simple one)
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }> = ({
  children,
  className = "",
  variant,
  ...props
}) => {
  const variantClass =
    variant === "destructive"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-blue-600 text-white hover:bg-blue-700";
  return (
    <button className={`px-4 py-2 rounded ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface Availability {
  id: number;
  date: string;
  time: string;
}

interface MeetingRequest {
  id: number;
  from: string;
  date: string;
  time: string;
  status: "pending" | "accepted" | "declined";
}

const Calendar: React.FC = () => {
  // State for availability slots
  const [slots, setSlots] = useState<Availability[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // State for meeting requests
  const [requests, setRequests] = useState<MeetingRequest[]>([
    { id: 1, from: "Investor A", date: "2025-08-25", time: "10:00 AM", status: "pending" },
    { id: 2, from: "Investor B", date: "2025-08-26", time: "2:00 PM", status: "pending" },
  ]);

  // Add new availability slot
  const addSlot = () => {
    if (!newDate || !newTime) return;
    const newSlot: Availability = {
      id: Date.now(),
      date: newDate,
      time: newTime,
    };
    setSlots([...slots, newSlot]);
    setNewDate("");
    setNewTime("");
  };

  // Accept/Decline meeting
  const handleRequest = (id: number, action: "accepted" | "declined") => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: action } : req
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Availability Section */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Manage Availability</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="border p-2 rounded w-40"
          />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="border p-2 rounded w-32"
          />
          <Button onClick={addSlot}>Add Slot</Button>
        </div>
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>
                {slot.date} – {slot.time}
              </span>
              <Button variant="destructive" onClick={() => setSlots(slots.filter((s) => s.id !== slot.id))}>
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Meeting Requests */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Meeting Requests</h2>
        <ul className="space-y-3">
          {requests.map((req) => (
            <li
              key={req.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <p>
                  <strong>{req.from}</strong> requested a meeting on{" "}
                  {req.date} at {req.time}
                </p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={
                      req.status === "accepted"
                        ? "text-green-600"
                        : req.status === "declined"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }
                  >
                    {req.status}
                  </span>
                </p>
              </div>
              {req.status === "pending" && (
                <div className="flex gap-2">
                  <Button onClick={() => handleRequest(req.id, "accepted")}>
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleRequest(req.id, "declined")}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Calendar;