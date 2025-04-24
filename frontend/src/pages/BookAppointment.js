import React, { useState, useEffect } from 'react';
import { dateFnsLocalizer } from 'react-big-calendar';
import { parseISO, startOfWeek, format, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import toast from 'react-hot-toast';
import '../styles/Calendar.css';
import CalendarWrapper from '../components/Calendar';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

export default function BookAppointment() {
  const [events, setEvents] = useState([]);

  const fetchData = async () => {
    try {
      const r1 = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/appointments/availability`, {
        credentials: 'include',
      });
      const free = await r1.json();
      if (!r1.ok) throw new Error('Failed to load slots');
      const freeEvents = free.map(a => ({
        id: `avail-${a.id}`,
        title: `Dr. ${a.doctor_name}`,
        start: new Date(a.start_time),
        end: new Date(a.end_time),
        color: '#0d6efd',
      }));

      const r2 = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/appointments/patient/my`,
        { credentials: 'include' }
      );
      const mine = await r2.json();
      if (!r2.ok) throw new Error('Failed to load your appts');
      const myEvents = mine.map(r => {
        let color, label;
        switch (r.status) {
          case 'confirmed':
            color = 'green';
            label = `Confirmed with Dr. ${r.doctor_name}`;
            break;
          case 'cancelled':
            color = 'gray';
            label = `Cancelled with Dr. ${r.doctor_name}`;
            break;
          default:
            color = '#fd7e14';
            label = `Pending with Dr. ${r.doctor_name}`;
        }
        return {
          id: `app-${r.id}`,
          title: label,
          start: new Date(r.start_time),
          end: new Date(r.end_time),
          color,
        };
      });

      setEvents([...freeEvents, ...myEvents]);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleSelectEvent = async event => {
    if (!event.id.startsWith('avail-')) return;
    if (!window.confirm(`Book ${event.title} on ${event.start.toLocaleString()}?`)) return;
    const slotId = event.id.replace('avail-', '');
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/appointments/book`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityId: slotId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Booking failed');
      }
      toast.success('Appointment requested!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="book-container">
      <h2>Book / View Your Appointments</h2>
      <CalendarWrapper
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView="week"
        style={{ height: '80vh' }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={evt => ({
          style: { backgroundColor: evt.color },
        })}
      />
    </div>
  );
}
