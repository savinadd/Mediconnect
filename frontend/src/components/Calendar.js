import React, { useState } from 'react';
import { Calendar } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

/**
 * A thin wrapper around react-big-calendar that
 * - manages current view & date in state
 * - exposes a default height of 80vh
 * - enables drill-down on dates
 */
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
  defaultView = 'week',
  defaultDate = new Date(),
  style = { height: '80vh' },
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
