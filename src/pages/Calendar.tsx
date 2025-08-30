import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DateSelectArg } from "@fullcalendar/core";


interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  type: "availability" | "meeting";
  status?: "pending" | "accepted" | "declined";
  allDay?: boolean;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({});
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 📌 Handle selecting a date (add new)
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setNewEvent({
      start: selectInfo.startStr,
      allDay: selectInfo.allDay,
      type: undefined,
      title: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // 📌 Add new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.type || !newEvent.start) return;

    const eventToAdd: CalendarEvent = {
      id: String(Date.now()),
      title: newEvent.title.trim(),
      start: newEvent.start,
      allDay: !!newEvent.allDay,
      type: newEvent.type,
      status: newEvent.type === "meeting" ? "pending" : undefined,
    };

    setEvents((prev) => [...prev, eventToAdd]);
    setIsModalOpen(false);
    setNewEvent({});
  };

  // 📌 Save edits
  const handleEditEvent = () => {
    if (!newEvent.id || !newEvent.title || !newEvent.type || !newEvent.start) return;

    setEvents((prev) =>
      prev.map((e) =>
        e.id === newEvent.id
          ? { ...e, title: newEvent.title!, type: newEvent.type!, start: newEvent.start! }
          : e
      )
    );

    setIsModalOpen(false);
    setNewEvent({});
    setIsEditing(false);
    setSelectedEvent(null);
  };

  // 📌 When an event is clicked
  const handleEventClick = (clickInfo: EventClickArg) => {
    const found = events.find((e) => e.id === clickInfo.event.id);
    if (found) setSelectedEvent(found);
  };

  // 📌 Accept / Decline Meeting
  const updateMeetingStatus = (status: "accepted" | "declined") => {
    if (!selectedEvent) return;
    setEvents((prev) =>
      prev.map((e) => (e.id === selectedEvent.id ? { ...e, status } : e))
    );
    setSelectedEvent(null);
  };

  // 📌 Delete event
  const deleteEvent = () => {
    if (!selectedEvent) return;
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  // 📌 Open edit modal
  const startEditing = () => {
    if (!selectedEvent) return;
    setNewEvent({ ...selectedEvent });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const calendarEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    allDay: e.allDay,
    color:
      e.type === "availability"
        ? "green"
        : e.status === "accepted"
        ? "blue"
        : e.status === "declined"
        ? "red"
        : "orange",
  }));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Meeting Calendar</h2>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        selectable
        select={handleDateSelect}
        events={calendarEvents}
        eventClick={handleEventClick}
      />

      {/* 📌 Add/Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Event" : "Add New Event"}
            </h3>

            <input
              type="text"
              placeholder="Enter title"
              value={newEvent.title || ""}
              onChange={(e) =>
                setNewEvent((prev) => ({ ...prev, title: e.target.value }))
              }
              className="border p-2 w-full rounded mb-3"
            />

            <select
              value={newEvent.type || ""}
              onChange={(e) =>
                setNewEvent((prev) => ({
                  ...prev,
                  type: e.target.value as "availability" | "meeting",
                }))
              }
              className="border p-2 w-full rounded mb-3"
            >
              <option value="">Select Type</option>
              <option value="availability">Availability Slot</option>
              <option value="meeting">Meeting</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setNewEvent({});
                }}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
              {isEditing ? (
                <button
                  onClick={handleEditEvent}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={handleAddEvent}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📌 Event Details Modal */}
      {selectedEvent && !isModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
        <button
          onClick={startEditing}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Edit
        </button>
      </div>
    
            <p>
              <strong>Type:</strong> {selectedEvent.type}
            </p>
            <p>
              <strong>Date:</strong> {selectedEvent.start}
            </p>
            {selectedEvent.type === "meeting" && (
              <p>
                <strong>Status:</strong> {selectedEvent.status}
              </p>
            )}

            <div className="mt-4 flex justify-between">
              {selectedEvent.type === "meeting" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateMeetingStatus("accepted")}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateMeetingStatus("declined")}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Decline
                  </button>
                </div>
              )}

              <div className="flex gap-2 ml-auto">
              
                <button
                  onClick={deleteEvent}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-3 py-1 bg-gray-400 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
