import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DateSelectArg } from "@fullcalendar/core";


interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay?: boolean;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Add new event
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt("Enter meeting title:");
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      const newEvent = {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        allDay: selectInfo.allDay,
      };

      setEvents((prev) => [...prev, newEvent]);
    }
  };

  // Edit or delete event
  const handleEventClick = (clickInfo: EventClickArg) => {
    const action = prompt(
      `You clicked "${clickInfo.event.title}".\nType "edit" to change title or "delete" to remove it:`
    );

    if (action?.toLowerCase() === "delete") {
      if (window.confirm(`Delete the event "${clickInfo.event.title}"?`)) {
        setEvents((prev) => prev.filter((e) => e.id !== clickInfo.event.id));
      }
    } else if (action?.toLowerCase() === "edit") {
      const newTitle = prompt("Enter new title:", clickInfo.event.title);
      if (newTitle) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === clickInfo.event.id ? { ...e, title: newTitle } : e
          )
        );
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Meeting Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        select={handleDateSelect}
        events={events}
        eventClick={handleEventClick}
        editable={true}
      />
    </div>
  );
};

export default Calendar;
