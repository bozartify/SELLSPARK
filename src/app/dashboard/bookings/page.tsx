'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getDefaultSessionProducts, generateMockBookings, generateAvailableSlots,
  bookingAnalytics, exportToICal, cancelBooking,
  type SessionProduct, type Booking, type TimeSlot,
} from '@/lib/platform/booking-engine';

const DEFAULT_RULE = { weekdays: ['mon','tue','wed','thu','fri'] as const, startTime: '09:00', endTime: '17:00', timezone: 'America/New_York' };
const SESSIONS = getDefaultSessionProducts();
const MOCK_BOOKINGS = generateMockBookings(SESSIONS);

const SESSION_ICONS: Record<string, string> = { '1:1-coaching': '🎯', 'group-call': '👥', 'workshop': '🏗️', 'consultation': '💡', 'strategy-session': '📊' };
const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500/20 text-green-300',
  completed: 'bg-violet-500/20 text-violet-300',
  cancelled: 'bg-red-500/20 text-red-300',
  pending: 'bg-yellow-500/20 text-yellow-300',
  'no-show': 'bg-orange-500/20 text-orange-300',
  rescheduled: 'bg-blue-500/20 text-blue-300',
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'sessions' | 'analytics'>('overview');
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [selectedSession, setSelectedSession] = useState<SessionProduct>(SESSIONS[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const analytics = bookingAnalytics(bookings);
  const calendarDays = generateAvailableSlots(
    { weekdays: ['mon','tue','wed','thu','fri'], startTime: '09:00', endTime: '17:00', timezone: 'America/New_York' },
    selectedSession,
    bookings,
    new Date(),
    7,
  );

  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date(new Date().toISOString().slice(0,10)) && b.status !== 'cancelled').sort((a,b) => a.date.localeCompare(b.date));
  const pastBookings = bookings.filter(b => new Date(b.date) < new Date(new Date().toISOString().slice(0,10)));

  const handleCancel = (b: Booking) => {
    const updated = cancelBooking(b, 'Cancelled via dashboard');
    setBookings(prev => prev.map(x => x.id === b.id ? updated : x));
    setSelectedBooking(updated);
  };

  const handleDownloadIcal = (b: Booking) => {
    const session = SESSIONS.find(s => s.id === b.sessionProductId);
    const ical = exportToICal(b, session?.title ?? 'Session', 'Your Creator');
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `booking-${b.id}.ics`; a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings & Scheduling</h1>
          <p className="text-sm text-gray-400 mt-1">1:1 coaching · Group calls · Workshops · iCal sync · Stripe payment-on-book</p>
        </div>
        <Badge className="bg-violet-600 text-white">{upcomingBookings.length} Upcoming</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${analytics.totalRevenue.toLocaleString()}`, sub: `$${analytics.avgBookingValue.toFixed(0)} avg` },
          { label: 'Completion Rate', value: `${(analytics.completionRate*100).toFixed(0)}%`, sub: `${analytics.completedBookings} completed` },
          { label: 'No-Show Rate', value: `${(analytics.noShowRate*100).toFixed(0)}%`, sub: analytics.noShowRate < 0.1 ? 'Excellent' : 'Review reminders' },
          { label: 'Repeat Bookers', value: analytics.repeatBookers.toString(), sub: 'booked 2+ times' },
        ].map(kpi => (
          <Card key={kpi.label} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-gray-400 text-xs">{kpi.label}</p>
              <p className="text-white text-2xl font-bold mt-1">{kpi.value}</p>
              <p className="text-gray-500 text-xs">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1 flex-wrap">
        {(['overview','calendar','sessions','analytics'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm capitalize rounded-t ${activeTab===t?'text-violet-400 border-b-2 border-violet-400':'text-gray-400 hover:text-white'}`}>
            {t==='overview'?'📋 Overview':t==='calendar'?'📅 Availability':t==='sessions'?'🎯 Session Types':'📊 Analytics'}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-gray-400 text-xs uppercase tracking-wider">Upcoming Sessions ({upcomingBookings.length})</p>
            {upcomingBookings.length === 0 && <p className="text-gray-500 text-sm">No upcoming bookings</p>}
            {upcomingBookings.map(b => {
              const session = SESSIONS.find(s => s.id === b.sessionProductId);
              return (
                <Card key={b.id}
                  className={`bg-white/5 border-white/10 cursor-pointer transition-all ${selectedBooking?.id===b.id?'border-violet-500/50':''}`}
                  onClick={() => setSelectedBooking(b)}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center text-xl flex-shrink-0">
                        {SESSION_ICONS[session?.type ?? '1:1-coaching']}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{b.attendeeName}</p>
                          <Badge className={STATUS_COLORS[b.status] ?? 'bg-gray-500/20 text-gray-400'}>{b.status}</Badge>
                        </div>
                        <p className="text-gray-400 text-xs">{session?.title} · {b.date} {b.startTime}–{b.endTime}</p>
                      </div>
                      <p className="text-white font-bold flex-shrink-0">${b.amountPaid}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedBooking ? (() => {
            const session = SESSIONS.find(s => s.id === selectedBooking.sessionProductId);
            return (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm">{selectedBooking.attendeeName}</CardTitle>
                    <Badge className={STATUS_COLORS[selectedBooking.status]}>{selectedBooking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { l: 'Session', v: session?.title ?? 'Unknown' },
                      { l: 'Date', v: selectedBooking.date },
                      { l: 'Time', v: `${selectedBooking.startTime}–${selectedBooking.endTime}` },
                      { l: 'Amount', v: `$${selectedBooking.amountPaid}` },
                      { l: 'Reschedules', v: selectedBooking.rescheduleCount.toString() },
                      { l: 'Created', v: new Date(selectedBooking.createdAt).toLocaleDateString() },
                    ].map(item => (
                      <div key={item.l} className="p-2 bg-white/5 rounded">
                        <p className="text-gray-500">{item.l}</p>
                        <p className="text-white">{item.v}</p>
                      </div>
                    ))}
                  </div>
                  {selectedBooking.answers.q1 && (
                    <div className="p-2 bg-white/5 rounded text-xs">
                      <p className="text-gray-500 mb-1">Goal</p>
                      <p className="text-gray-300">{selectedBooking.answers.q1}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <a href={selectedBooking.meetingLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" className="w-full bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs">🎥 Join Meeting</Button>
                    </a>
                    <Button size="sm" onClick={() => handleDownloadIcal(selectedBooking)} className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 text-xs">📅 .ics</Button>
                    {selectedBooking.status === 'confirmed' && (
                      <Button size="sm" onClick={() => handleCancel(selectedBooking)} className="bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs">Cancel</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })() : (
            <div className="flex items-center justify-center h-64 text-gray-500 text-sm border border-white/10 rounded-xl">
              Select a booking to manage
            </div>
          )}
        </div>
      )}

      {/* ─── CALENDAR ─── */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            {SESSIONS.map(s => (
              <button key={s.id} onClick={() => setSelectedSession(s)}
                className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${selectedSession.id===s.id?'bg-violet-600 text-white':'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                <span>{SESSION_ICONS[s.type]}</span>
                {s.title}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(day => (
              <div key={day.date} className={`rounded-lg p-2 ${day.unavailable?'opacity-30':''}`}>
                <p className="text-gray-400 text-xs mb-1">{new Date(day.date + 'T12:00:00').toLocaleDateString('en',{weekday:'short'})}</p>
                <p className="text-white text-xs font-bold mb-2">{day.date.slice(8)}</p>
                <div className="space-y-1">
                  {day.slots.slice(0,4).map(slot => (
                    <button key={slot.startTime}
                      onClick={() => slot.available && setSelectedSlot(slot)}
                      className={`w-full text-xs py-1 px-1.5 rounded text-left transition-all ${
                        slot.available ? selectedSlot?.startTime===slot.startTime && selectedSlot?.date===slot.date ? 'bg-violet-600 text-white' : 'bg-violet-600/20 text-violet-300 hover:bg-violet-600/40' : 'bg-gray-700/50 text-gray-600 cursor-not-allowed'
                      }`}>
                      {slot.startTime}
                    </button>
                  ))}
                  {day.slots.length > 4 && <p className="text-gray-500 text-xs">+{day.slots.length-4} more</p>}
                  {day.fullyBooked && <p className="text-orange-400 text-xs">Full</p>}
                </div>
              </div>
            ))}
          </div>
          {selectedSlot && (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <p className="text-white font-medium">Selected: {selectedSlot.date} at {selectedSlot.startTime}</p>
                <p className="text-gray-400 text-sm mt-1">{selectedSession.title} · {selectedSession.durationMinutes} min · {selectedSession.price > 0 ? `$${selectedSession.price}` : 'Free'}</p>
                <Button className="mt-3 bg-violet-600 hover:bg-violet-700 text-white text-sm">Book This Slot</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── SESSIONS ─── */}
      {activeTab === 'sessions' && (
        <div className="grid md:grid-cols-2 gap-4">
          {SESSIONS.map(session => (
            <Card key={session.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center text-2xl flex-shrink-0">
                    {SESSION_ICONS[session.type]}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{session.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{session.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${session.price}</p>
                    <p className="text-gray-500 text-xs">{session.durationMinutes}min</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>👥 Max {session.maxAttendees === 1 ? '1:1' : session.maxAttendees + ' attendees'}</span>
                  <span>⏱ +{session.bufferAfterMinutes}min buffer</span>
                  <Badge className={session.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}>
                    {session.active ? 'Active' : 'Draft'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {session.questions.map(q => (
                    <div key={q.id} className="text-xs text-gray-400">
                      <span className="text-gray-500">Q:</span> {q.label} {q.required && <span className="text-red-400">*</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs">Edit</Button>
                  <Button size="sm" className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 text-xs">Share Link</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="bg-white/5 border-white/10 border-dashed">
            <CardContent className="p-4 flex items-center justify-center h-40">
              <Button className="bg-violet-600/30 hover:bg-violet-600/50 text-violet-300">+ Create Session Type</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── ANALYTICS ─── */}
      {activeTab === 'analytics' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Completion Rate', value: (analytics.completionRate*100).toFixed(1)+'%', desc: 'sessions successfully completed' },
            { label: 'No-Show Rate', value: (analytics.noShowRate*100).toFixed(1)+'%', desc: analytics.noShowRate < 0.1 ? '✅ Below 10% target' : '⚠️ Consider reminder SMS' },
            { label: 'Peak Day', value: analytics.peakDay, desc: 'most bookings' },
            { label: 'Peak Time', value: analytics.peakTime, desc: 'most popular slot' },
            { label: 'Total Revenue', value: `$${analytics.totalRevenue.toLocaleString()}`, desc: `avg $${analytics.avgBookingValue.toFixed(0)}/booking` },
            { label: 'Repeat Customers', value: analytics.repeatBookers.toString(), desc: 'booked more than once' },
          ].map(stat => (
            <Card key={stat.label} className="bg-white/5 border-white/10">
              <CardContent className="p-5">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-white text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
