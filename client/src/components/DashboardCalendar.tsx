'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  MdChevronLeft,
  MdChevronRight,
  MdAdd,
  MdDelete,
  MdEventNote,
  MdCalendarViewMonth,
  MdCalendarViewWeek,
  MdCalendarViewDay,
  MdRefresh,
  MdEdit,
} from 'react-icons/md';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

interface CalendarEvent {
  _id: string;
  title: string;
  date: string; // ISO string
  type: 'meeting' | 'task' | 'reminder';
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ExtendedSession {
  accessToken?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

const DashboardCalendar = () => {
  const { data: session } = useSession();
  const s = session as ExtendedSession | null;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Fetch Events from Backend
  const fetchEvents = React.useCallback(async () => {
    if (!s?.accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get<APIResponse<CalendarEvent[]>>(`${BASE_URL}/calendar-event`, {
        headers: { Authorization: s.accessToken },
      });
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch {
      toast.error('Failed to sync calendar');
    } finally {
      setLoading(false);
    }
  }, [s?.accessToken]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Helper selectors
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Prefix empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days in current month
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(currentDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(currentDate.getDate() - 7);
    else newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(currentDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(currentDate.getDate() + 7);
    else newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle || !selectedDate || !s?.accessToken) return;
    try {
      const res = await axios.post<APIResponse<CalendarEvent>>(
        `${BASE_URL}/calendar-event`,
        {
          title: newEventTitle,
          date: selectedDate.toISOString(),
          type: 'task',
        },
        { headers: { Authorization: s.accessToken } }
      );
      if (res.data.success) {
        setEvents([...events, res.data.data]);
        setNewEventTitle('');
        setIsModalOpen(false);
        toast.success('Event scheduled');
      }
    } catch {
      toast.error('Could not create event');
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !editEventTitle || !s?.accessToken) return;
    try {
      const res = await axios.patch<APIResponse<CalendarEvent>>(
        `${BASE_URL}/calendar-event/${editingEvent._id}`,
        { title: editEventTitle },
        { headers: { Authorization: s.accessToken } }
      );
      if (res.data.success) {
        setEvents(events.map((e) => (e._id === editingEvent._id ? res.data.data : e)));
        setEditingEvent(null);
        setEditEventTitle('');
        toast.success('Event updated');
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!s?.accessToken) return;
    try {
      const res = await axios.delete<APIResponse<null>>(`${BASE_URL}/calendar-event/${id}`, {
        headers: { Authorization: s.accessToken },
      });
      if (res.data.success) {
        setEvents(events.filter((e) => e._id !== id));
        toast.info('Event removed');
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return date.getTime() === selectedDate.getTime();
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return events.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group mb-10 transition-all">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-5">
          <div className="flex flex-col">
            <h3 className="text-2xl font-black text-white tracking-tighter leading-none italic uppercase">
              {monthNames[currentDate.getMonth()]}
              <span className="text-brick-500 ml-2">{currentDate.getFullYear()}</span>
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Event Console
              </p>
              {loading && <MdRefresh className="animate-spin text-brick-500" size={12} />}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={handlePrev}
              className="p-2 hover:bg-brick-500/20 text-white rounded-xl transition-all"
            >
              <MdChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 hover:bg-brick-500/20 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-brick-500/20 text-white rounded-xl transition-all"
            >
              <MdChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  view === v
                    ? 'bg-brick-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {v === 'month' && <MdCalendarViewMonth size={16} />}
                {v === 'week' && <MdCalendarViewWeek size={16} />}
                {v === 'day' && <MdCalendarViewDay size={16} />}
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-brick-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brick-600 transition-all shadow-lg hover:shadow-brick-500/40"
          >
            <MdAdd size={20} />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-black text-gray-500 uppercase tracking-[0.3em] pb-4"
          >
            {day}
          </div>
        ))}

        {daysInMonth.map((date, idx) => {
          const dayIndex = date ? date.getDay() : -1;
          const isWeekend = dayIndex === 5 || dayIndex === 6; // Fri or Sat

          return (
            <motion.div
              key={idx}
              onClick={() => {
                if (date) {
                  setSelectedDate(date);
                  const dailyEvents = getEventsForDate(date);
                  if (dailyEvents.length > 0) {
                    setIsDayModalOpen(true);
                  } else {
                    setIsModalOpen(true);
                  }
                }
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.005 }}
              className={`relative min-h-[80px] md:min-h-[110px] p-2 rounded-2xl border transition-all ${
                !date
                  ? 'bg-transparent border-transparent'
                  : isSelected(date)
                    ? 'bg-brick-500/30 border-brick-500 shadow-xl z-10'
                    : isWeekend
                      ? 'bg-brick-500/3 border-white/5 hover:border-brick-500/20 hover:bg-brick-500/5 cursor-pointer'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8 cursor-pointer'
              }`}
            >
              {date && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-lg font-black tracking-tighter ${
                        isToday(date)
                          ? 'text-brick-500 italic'
                          : isSelected(date)
                            ? 'text-white'
                            : 'text-gray-400'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {isToday(date) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-brick-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {getEventsForDate(date)
                      .slice(0, 3)
                      .map((event) => (
                        <div
                          key={event._id}
                          className="group/event relative flex items-center justify-between px-2 py-1 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-all overflow-hidden"
                        >
                          <span className="text-[8px] font-bold text-white truncate max-w-[75%] uppercase tracking-tight">
                            {event.title}
                          </span>
                        </div>
                      ))}
                    {getEventsForDate(date).length > 3 && (
                      <div className="text-[8px] font-black text-gray-500 text-center uppercase tracking-widest pt-1">
                        + {getEventsForDate(date).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Day Events Modal */}
      <AnimatePresence>
        {isDayModalOpen && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsDayModalOpen(false);
                setEditingEvent(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-gray-900/90 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brick-500/20 rounded-2xl">
                    <MdEventNote className="text-brick-500" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">
                      Events for {selectedDate?.toLocaleDateString()}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 bg-white/5 hover:bg-brick-500/20 text-white rounded-xl transition-all"
                >
                  <MdAdd size={20} />
                </button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event._id}
                    className="group bg-white/5 border border-white/5 p-4 rounded-2xl hover:border-brick-500/30 transition-all"
                  >
                    {editingEvent?._id === event._id ? (
                      <div className="space-y-4">
                        <input
                          autoFocus
                          type="text"
                          value={editEventTitle}
                          onChange={(e) => setEditEventTitle(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateEvent}
                            className="flex-1 py-2 bg-brick-500 text-white rounded-xl text-[10px] font-black uppercase"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingEvent(null)}
                            className="flex-1 py-2 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white uppercase tracking-tight">
                            {event.title}
                          </span>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                            {event.type}
                          </span>
                        </div>
                        {(s?.user?.role === 'admin' || s?.user?.role === 'superadmin') && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingEvent(event);
                                setEditEventTitle(event.title);
                              }}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <MdEdit size={18} title="Edit" />
                            </button>
                            <button
                              onClick={() => deleteEvent(event._id)}
                              className="p-2 text-gray-400 hover:text-brick-500 transition-colors"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-gray-900/90 border border-white/10 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brick-500/20 rounded-2xl">
                  <MdEventNote className="text-brick-500" size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">
                    New Dashboard Event
                  </h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mt-1">
                    Scheduling for {selectedDate?.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">
                    Event Title
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g. System Audit"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-gray-600 focus:outline-hidden focus:border-brick-500 transition-all text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEvent}
                    className="flex-1 px-6 py-4 bg-brick-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-brick-600 transition-all shadow-lg"
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Background Icons */}
      <div className="absolute -top-10 -right-10 text-white/2 opacity-5 pointer-events-none transform -rotate-12 scale-[4]">
        <MdCalendarViewMonth />
      </div>
    </div>
  );
};

export default DashboardCalendar;
