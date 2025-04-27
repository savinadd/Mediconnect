import React, { useState, useEffect, useContext } from 'react'
import toast from 'react-hot-toast'
import CalendarWrapper from '../components/Calendar'
import { AuthContext } from '../context/AuthContext'
import { dateFnsLocalizer } from 'react-big-calendar'
import { parseISO, startOfWeek, format, getDay } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import '../styles/Calendar.css'

const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

const confirmDialog = message =>
  new Promise(resolve => {
    const id = toast(
      t => (
        <div className="confirm-toast">
          <p>{message}</p>
          <div className="confirm-buttons">
            <button
              className="yes"
              onClick={() => {
                resolve(true)
                toast.dismiss(id)
              }}
            >
              Yes
            </button>
            <button
              className="no"
              onClick={() => {
                resolve(false)
                toast.dismiss(id)
              }}
            >
              No
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    )
  })

export default function BookAppointment() {
  const { userRole } = useContext(AuthContext)
  const [events, setEvents] = useState([])

  const fetchData = async () => {
    try {
      const r1 = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/availability`,
        { credentials: 'include' }
      )
      if (!r1.ok) throw new Error('Failed to load slots')
      const free = await r1.json()

      const r2 = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/appointments/appointments/patient/my`,
        { credentials: 'include' }
      )
      if (!r2.ok) throw new Error('Failed to load your appts')
      const mine = await r2.json()

      const freeEvents = free.map(a => ({
        id: `avail-${a.id}`,
        type: 'availability',
        title: `Dr. ${a.doctor_name}`,
        start: new Date(a.start_time),
        end: new Date(a.end_time),
        color: '#046BF1',
      }))

      const myEvents = mine.map(r => {
        let color, label
        switch (r.status) {
          case 'confirmed':
            color = 'green'
            label = `Confirmed with Dr. ${r.doctor_name}`
            break
          case 'cancelled':
            color = 'gray'
            label = `Cancelled with Dr. ${r.doctor_name}`
            break
          default:
            color = '#fd7e14'
            label = `Pending with Dr. ${r.doctor_name}`
        }
        return {
          id: `app-${r.id}`,
          type: 'appointment',
          title: label,
          start: new Date(r.start_time),
          end: new Date(r.end_time),
          color,
        }
      })

      const allEvents = [...freeEvents, ...myEvents]
      const safeEvents = allEvents.filter(e =>
        e &&
        typeof e.title === 'string' &&
        e.title.trim() !== '' &&
        e.start instanceof Date &&
        !isNaN(e.start.getTime()) &&
        e.end instanceof Date &&
        !isNaN(e.end.getTime())
      )

      setEvents(safeEvents)
    } catch (err) {
      console.error(err)
      toast.error(err.message)
    }
  }

  const handleSelectEvent = async event => {
    const { id, type, title, start } = event

    if (type === 'availability') {
      const ok = await confirmDialog(`Book ${title} on ${start.toLocaleString()}?`)
      if (!ok) return
      const slotId = id.replace('avail-', '')
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/appointments/book`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ availabilityId: slotId }),
          }
        )
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.message || 'Booking failed')
        }
        toast.success('Appointment requested!')
        fetchData()
      } catch (err) {
        toast.error(err.message)
      }
    }

    else if (type === 'appointment' && title.startsWith('Pending')) {
      const ok = await confirmDialog('Cancel this pending request?')
      if (!ok) return
      const requestId = id.replace('app-', '')
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${requestId}/cancel`,
          { method: 'PUT', credentials: 'include' }
        )
        if (!res.ok) throw new Error('Cancel failed')
        toast.success('Pending appointment cancelled')
        fetchData()
      } catch (err) {
        toast.error(err.message)
      }
    }

    else if (type === 'appointment' && title.startsWith('Confirmed')) {
      const ok = await confirmDialog('Cancel this confirmed appointment?')
      if (!ok) return
      const requestId = id.replace('app-', '')
      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/appointments/${requestId}/cancel`,
          { method: 'PUT', credentials: 'include' }
        )
        if (!res.ok) throw new Error('Cancel failed')
        toast.success('Confirmed appointment cancelled')
        fetchData()
      } catch (err) {
        toast.error(err.message)
      }
    }
  }

  useEffect(() => {
    fetchData()
    const iv = setInterval(fetchData, 30000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="book-container">
      <h2>Book / View Your Appointments</h2>
      <CalendarWrapper
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={['month', 'week', 'day']}
        defaultView="month"
        onSelectEvent={handleSelectEvent}
        eventPropGetter={evt => ({ style: { backgroundColor: evt.color } })}
      />
    </div>
  )
}
