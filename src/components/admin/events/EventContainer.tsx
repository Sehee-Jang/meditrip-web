"use client";

import { useEffect, useState } from "react";
import { getEvents } from "@/services/events/getEvents";
import { Event } from "@/types/event";
import EventSettingsForm from "@/components/admin/events/EventSettingForm";
import EventTable from "@/components/admin/events/EventTable";

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
      <EventSettingsForm onEventSaved={fetchEvents} />
      <EventTable events={events} onRefresh={fetchEvents} />
    </div>
  );
}
