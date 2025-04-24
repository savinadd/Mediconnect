import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import CalendarWrapper from '../components/Calendar';
import { AuthContext } from '../context/AuthContext';
import { dateFnsLocalizer } from 'react-big-calendar';
import { parseISO, startOfWeek, format, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import '../styles/Calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const confirmDialog = message =>
  new Promise(resolve => {
    const id = toast(
      t => (
        <div className="confirm-toast">
          <p>{message}</p>
          <div className="confirm-buttons">
            <button
              onClick={() => {
                resolve(true);
                toast.dismiss(id);
              }}
            >
              Yes
            </button>
            <button
              onClick={() => {
                resolve(false);
                toast.dismiss(id);
              }}
            >
              No
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  });

export default function DoctorSchedule() {
  const { userRole } = useContext(AuthContext);
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const availR = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/availability/my`,
        { credentials: 'include' }
      );
      if (!availR.ok) throw new Error('Failed to load availability');
      const availRaw = await availR.json();

      const reqR = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/appointments/my`,
        { credentials: 'include' }
      );
      if (!reqR.ok) throw new Error('Failed to load requests');
      const reqRaw = await reqR.json();

      const bookedTimes = new Set(
        reqRaw.map(r => `${new Date(r.start_time).getTime()}-${new Date(r.end_time).getTime()}`)
      );
      const filteredAvail = availRaw.filter(
        a =>
          !bookedTimes.has(`${new Date(a.start_time).getTime()}-${new Date(a.end_time).getTime()}`)
      );

      const availEvents = filteredAvail.map(a => ({
        type: 'availability',
        slotId: a.id,
        title: 'Available',
        start: new Date(a.start_time),
        end: new Date(a.end_time),
        color: '#0d6efd',
      }));

      const reqEvents = reqRaw.map(r => {
        let color, title;
        if (r.status === 'confirmed') {
          color = 'green';
          title = `Confirmed: ${r.patient_name}`;
        } else if (r.status === 'cancelled') {
          color = 'gray';
          title = `Cancelled: ${r.patient_name}`;
        } else {
          color = '#fd7e14'; // pending
          title = `Pending: ${r.patient_name}`;
        }
        return {
          type: 'request',
          requestId: r.id,
          status: r.status,
          title,
          start: new Date(r.start_time),
          end: new Date(r.end_time),
          color,
        };
      });

      setEvents([...availEvents, ...reqEvents]);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleSelectSlot = async ({ start, end }) => {
    if (userRole !== 'doctor') return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/availability`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startTime: start, endTime: end }),
        }
      );
      if (!res.ok) throw new Error('Add slot failed');
      toast.success('Availability added');
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const handleSelectEvent = async event => {
    if (event.type === 'availability') {
      const ok = await confirmDialog('Delete this availability slot?');
      if (!ok) return;
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/appointments/availability/${event.slotId}`,
          { method: 'DELETE', credentials: 'include' }
        );
        if (!res.ok) throw new Error('Delete failed');
        toast.success('Availability removed');
        fetchEvents();
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      }
    } else if (event.type === 'request') {
      if (event.status === 'pending') {
        const ok = await confirmDialog('Approve this appointment?\nNo = Reject');
        const action = ok ? 'approve' : 'cancel';
        try {
          const res = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${event.requestId}/${action}`,
            { method: 'PUT', credentials: 'include' }
          );
          if (!res.ok)
            throw new Error(`${action.charAt(0).toUpperCase() + action.slice(1)} failed`);
          toast.success(`Appointment ${action}d`);
          fetchEvents();
        } catch (err) {
          console.error(err);
          toast.error(err.message);
        }
      } else if (event.status === 'confirmed') {
        const ok = await confirmDialog('Cancel this confirmed appointment?');
        if (!ok) return;
        try {
          const res = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${event.requestId}/cancel`,
            { method: 'PUT', credentials: 'include' }
          );
          if (!res.ok) throw new Error('Cancel failed');
          toast.success('Appointment cancelled');
          fetchEvents();
        } catch (err) {
          console.error(err);
          toast.error(err.message);
        }
      }
    }
  };

  useEffect(() => {
    fetchEvents();
    const iv = setInterval(fetchEvents, 30_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="calendar-container">
      <h2>My Schedule & Requests</h2>
      <CalendarWrapper
        localizer={localizer}
        events={events}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={evt => ({ style: { backgroundColor: evt.color } })}
        views={['month', 'week', 'day']}
        defaultView="week"
      />
    </div>
  );
}
