import React, { createContext, useContext, useState } from "react";

interface Meeting {
  id: number;
  sender: string;
  dateTime: string;
}

interface MeetingsContextType {
  slots: string[];
  setSlots: React.Dispatch<React.SetStateAction<string[]>>;
  meetingRequests: Meeting[];
  setMeetingRequests: React.Dispatch<React.SetStateAction<Meeting[]>>;
  confirmedMeetings: Meeting[];
  setConfirmedMeetings: React.Dispatch<React.SetStateAction<Meeting[]>>;
  confirmMeeting: (meeting: Meeting) => void;   // ✅ new method
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

export const MeetingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [meetingRequests, setMeetingRequests] = useState<Meeting[]>([
    { id: 1, sender: "Investor A", dateTime: "2025-08-25 10:00 AM" },
    { id: 2, sender: "Investor B", dateTime: "2025-08-26 2:00 PM" }
  ]);
  const [confirmedMeetings, setConfirmedMeetings] = useState<Meeting[]>([]);

  // ✅ Add a helper function here
  const confirmMeeting = (meeting: Meeting) => {
    setConfirmedMeetings((prev) => [...prev, meeting]);
    // optionally remove it from requests once confirmed
    setMeetingRequests((prev) => prev.filter((req) => req.id !== meeting.id));
  };

  return (
    <MeetingsContext.Provider
      value={{
        slots,
        setSlots,
        meetingRequests,
        setMeetingRequests,
        confirmedMeetings,
        setConfirmedMeetings,
        confirmMeeting,   // ✅ expose it
      }}
    >
      {children}
    </MeetingsContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (!context) throw new Error("useMeetings must be used within a MeetingsProvider");
  return context;
};
