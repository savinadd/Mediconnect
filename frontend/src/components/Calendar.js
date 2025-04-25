import React, { useState } from 'react';
import { Calendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function CalendarWrapper({
  localizer,
  events,
  selectable = false,
  onSelectEvent,
  onSelectSlot,
  eventPropGetter,
  startAccessor = 'start',
  endAccessor = 'end',
  views = ['month', 'week', 'day'],
  defaultView = 'month',
  defaultDate = new Date(),
  style = { height: '70vh' },
  toolbar = true,
  drilldownView = 'day',
}) {
  const [view, setView] = useState(defaultView);
  const [date, setDate] = useState(defaultDate);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      selectable={selectable}
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      eventPropGetter={eventPropGetter}
      startAccessor={startAccessor}
      endAccessor={endAccessor}
      view={view}
      onView={setView}
      date={date}
      onNavigate={setDate}
      views={views}
      defaultView={defaultView}
      toolbar={toolbar}
      drilldownView={drilldownView}
      style={style}
    />
  );
}
