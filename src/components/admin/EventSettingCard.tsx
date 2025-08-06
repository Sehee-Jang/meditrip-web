"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/services/events/getEvents";
import { Event } from "@/types/event";
import EventSettingForm from "./EventSettingForm";
import EventList from "./EventList";

export default function EventSettingCard() {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    const data = await getEvents();
    setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className='space-y-6'>
      <EventSettingForm onEventSaved={fetchEvents} />
      <EventList events={events} onRefresh={fetchEvents} />
    </div>
  );
}
