/**
 * @module booking-engine
 * @description Calendly-compatible booking & scheduling engine for 1:1 coaching,
 * group calls, and event ticketing. Supports availability slots, buffer times,
 * timezone-aware scheduling, iCal export, reminder sequences, and Stripe payment-on-book.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionType   = '1:1-coaching' | 'group-call' | 'workshop' | 'consultation' | 'strategy-session';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'rescheduled';
export type WeekDay       = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface SessionProduct {
  id: string;
  title: string;
  description: string;
  type: SessionType;
  durationMinutes: number;
  price: number;        // 0 = free
  currency: string;
  maxAttendees: number; // 1 = 1:1
  bufferAfterMinutes: number;
  timezone: string;
  meetingLink: string;  // Zoom/Google Meet/custom
  active: boolean;
  color: string;
  questions: BookingQuestion[];
}

export interface BookingQuestion {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface AvailabilityRule {
  weekdays: WeekDay[];
  startTime: string;   // 'HH:MM' 24h
  endTime: string;
  timezone: string;
}

export interface AvailabilityOverride {
  date: string;         // 'YYYY-MM-DD'
  available: boolean;
  slots?: string[];     // specific times if partially available
}

export interface TimeSlot {
  date: string;         // 'YYYY-MM-DD'
  startTime: string;    // 'HH:MM'
  endTime: string;
  available: boolean;
  bookingId?: string;
}

export interface Booking {
  id: string;
  sessionProductId: string;
  attendeeName: string;
  attendeeEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  status: BookingStatus;
  paymentIntentId: string | null;
  amountPaid: number;
  answers: Record<string, string>;
  meetingLink: string;
  reminders: ReminderRecord[];
  createdAt: number;
  cancelledAt?: number;
  cancellationReason?: string;
  rescheduleCount: number;
  notes: string;
}

export interface ReminderRecord {
  scheduledAt: number;
  sentAt: number | null;
  channel: 'email' | 'sms';
  template: string;
}

export interface CalendarDay {
  date: string;
  slots: TimeSlot[];
  fullyBooked: boolean;
  unavailable: boolean;
}

// ─── Session Products ─────────────────────────────────────────────────────────

export function createSessionProduct(
  title: string,
  type: SessionType,
  durationMinutes: number,
  price: number,
): SessionProduct {
  return {
    id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    description: '',
    type,
    durationMinutes,
    price,
    currency: 'USD',
    maxAttendees: type === '1:1-coaching' || type === 'consultation' || type === 'strategy-session' ? 1 : 20,
    bufferAfterMinutes: 15,
    timezone: 'America/New_York',
    meetingLink: 'https://zoom.us/j/placeholder',
    active: true,
    color: '#7c3aed',
    questions: [
      { id: 'q1', label: 'What is your main goal for this session?', type: 'textarea', required: true },
      { id: 'q2', label: 'Experience level', type: 'select', required: false, options: ['Beginner', 'Intermediate', 'Advanced'] },
    ],
  };
}

// ─── Availability ─────────────────────────────────────────────────────────────

const WEEKDAY_INDEX: Record<WeekDay, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };

export function generateAvailableSlots(
  rule: AvailabilityRule,
  session: SessionProduct,
  existingBookings: Booking[],
  startDate: Date,
  days: number = 14,
): CalendarDay[] {
  const result: CalendarDay[] = [];

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const weekday = ['sun','mon','tue','wed','thu','fri','sat'][date.getDay()] as WeekDay;
    const dateStr = date.toISOString().slice(0, 10);

    if (!rule.weekdays.includes(weekday)) {
      result.push({ date: dateStr, slots: [], fullyBooked: false, unavailable: true });
      continue;
    }

    const slots: TimeSlot[] = [];
    const [startH, startM] = rule.startTime.split(':').map(Number);
    const [endH, endM] = rule.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes   = endH * 60 + endM;
    const slotStep     = session.durationMinutes + session.bufferAfterMinutes;

    for (let m = startMinutes; m + session.durationMinutes <= endMinutes; m += slotStep) {
      const slotStart = `${String(Math.floor(m / 60)).padStart(2,'0')}:${String(m % 60).padStart(2,'0')}`;
      const slotEndM  = m + session.durationMinutes;
      const slotEnd   = `${String(Math.floor(slotEndM / 60)).padStart(2,'0')}:${String(slotEndM % 60).padStart(2,'0')}`;

      const booking = existingBookings.find(b =>
        b.date === dateStr && b.startTime === slotStart && b.status !== 'cancelled',
      );

      slots.push({ date: dateStr, startTime: slotStart, endTime: slotEnd, available: !booking, bookingId: booking?.id });
    }

    const availableCount = slots.filter(s => s.available).length;
    result.push({ date: dateStr, slots, fullyBooked: availableCount === 0 && slots.length > 0, unavailable: false });
  }

  return result;
}

// ─── Booking Operations ───────────────────────────────────────────────────────

export function createBooking(
  session: SessionProduct,
  slot: TimeSlot,
  attendeeName: string,
  attendeeEmail: string,
  answers: Record<string, string> = {},
): Booking {
  const now = Date.now();
  const bookingDate = new Date(`${slot.date}T${slot.startTime}`);
  const reminders = generateReminderSequence(bookingDate);

  return {
    id: `bkng-${now}-${Math.random().toString(36).slice(2, 7)}`,
    sessionProductId: session.id,
    attendeeName,
    attendeeEmail,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    timezone: session.timezone,
    status: 'confirmed',
    paymentIntentId: session.price > 0 ? `pi_${Math.random().toString(36).slice(2, 16)}` : null,
    amountPaid: session.price,
    answers,
    meetingLink: session.meetingLink,
    reminders,
    createdAt: now,
    rescheduleCount: 0,
    notes: '',
  };
}

export function cancelBooking(booking: Booking, reason: string = ''): Booking {
  return { ...booking, status: 'cancelled', cancelledAt: Date.now(), cancellationReason: reason };
}

export function rescheduleBooking(booking: Booking, newSlot: TimeSlot): Booking {
  return {
    ...booking,
    date: newSlot.date,
    startTime: newSlot.startTime,
    endTime: newSlot.endTime,
    status: 'confirmed',
    rescheduleCount: booking.rescheduleCount + 1,
  };
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export function generateReminderSequence(sessionDate: Date): ReminderRecord[] {
  const t = sessionDate.getTime();
  return [
    { scheduledAt: t - 24 * 3600000,  sentAt: null, channel: 'email', template: 'reminder_24h' },
    { scheduledAt: t - 1 * 3600000,   sentAt: null, channel: 'email', template: 'reminder_1h'  },
    { scheduledAt: t - 15 * 60000,    sentAt: null, channel: 'sms',   template: 'reminder_15m' },
    { scheduledAt: t + 30 * 60000,    sentAt: null, channel: 'email', template: 'followup'     },
  ];
}

export function getReminderTemplate(template: string, booking: Booking, creatorName: string): { subject: string; body: string } {
  const dateLabel = `${booking.date} at ${booking.startTime}`;
  const templates: Record<string, { subject: string; body: string }> = {
    reminder_24h: {
      subject: `Reminder: Session with ${creatorName} tomorrow`,
      body: `Your session is confirmed for ${dateLabel}. Join here: ${booking.meetingLink}`,
    },
    reminder_1h: {
      subject: `Starting in 1 hour — ${creatorName} session`,
      body: `Your session starts in 1 hour at ${booking.startTime}. Join: ${booking.meetingLink}`,
    },
    reminder_15m: {
      subject: `Starting in 15 min`,
      body: `Your session with ${creatorName} starts in 15 minutes. ${booking.meetingLink}`,
    },
    followup: {
      subject: `How was your session with ${creatorName}?`,
      body: `Thanks for joining! Please leave a review and book your next session.`,
    },
  };
  return templates[template] ?? { subject: 'Session reminder', body: '' };
}

// ─── iCal Export ──────────────────────────────────────────────────────────────

export function exportToICal(booking: Booking, sessionTitle: string, organizerName: string): string {
  const dtStart = booking.date.replace(/-/g,'') + 'T' + booking.startTime.replace(':','') + '00';
  const dtEnd   = booking.date.replace(/-/g,'') + 'T' + booking.endTime.replace(':','') + '00';
  const now = new Date().toISOString().replace(/[-:.]/g,'').slice(0,15) + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SellSpark//BookingEngine//EN',
    'BEGIN:VEVENT',
    `UID:${booking.id}@sellspark.com`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${sessionTitle} with ${organizerName}`,
    `DESCRIPTION:Join here: ${booking.meetingLink}`,
    `LOCATION:${booking.meetingLink}`,
    `ORGANIZER;CN=${organizerName}:mailto:noreply@sellspark.com`,
    `ATTENDEE;CN=${booking.attendeeName}:mailto:${booking.attendeeEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export function bookingAnalytics(bookings: Booking[]): {
  totalBookings: number;
  completedBookings: number;
  completionRate: number;
  noShowRate: number;
  cancellationRate: number;
  totalRevenue: number;
  avgBookingValue: number;
  repeatBookers: number;
  peakDay: string;
  peakTime: string;
} {
  const total      = bookings.length;
  const completed  = bookings.filter(b => b.status === 'completed').length;
  const noShow     = bookings.filter(b => b.status === 'no-show').length;
  const cancelled  = bookings.filter(b => b.status === 'cancelled').length;
  const revenue    = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.amountPaid, 0);

  const emailCounts: Record<string, number> = {};
  bookings.forEach(b => { emailCounts[b.attendeeEmail] = (emailCounts[b.attendeeEmail] || 0) + 1; });
  const repeatBookers = Object.values(emailCounts).filter(c => c > 1).length;

  const dayCounts: Record<string, number> = {};
  const timeCounts: Record<string, number> = {};
  bookings.forEach(b => {
    dayCounts[b.date] = (dayCounts[b.date] || 0) + 1;
    timeCounts[b.startTime] = (timeCounts[b.startTime] || 0) + 1;
  });
  const peakDay  = Object.entries(dayCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? 'N/A';
  const peakTime = Object.entries(timeCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] ?? 'N/A';

  return {
    totalBookings: total,
    completedBookings: completed,
    completionRate: total ? completed / total : 0,
    noShowRate: total ? noShow / total : 0,
    cancellationRate: total ? cancelled / total : 0,
    totalRevenue: revenue,
    avgBookingValue: total ? revenue / total : 0,
    repeatBookers,
    peakDay,
    peakTime,
  };
}

// ─── Default Session Products (for demo) ─────────────────────────────────────

export function getDefaultSessionProducts(): SessionProduct[] {
  return [
    { ...createSessionProduct('1:1 Strategy Call', '1:1-coaching', 60, 297),      description: 'Deep-dive into your business strategy, content plan, and monetisation roadmap.' },
    { ...createSessionProduct('Quick Coaching (30 min)', 'consultation', 30, 97), description: 'Focused 30-minute session on a single urgent problem.' },
    { ...createSessionProduct('Group Mastermind', 'group-call', 90, 47),          description: 'Weekly group coaching call — hot seats, Q&A, and accountability.', maxAttendees: 12 } as SessionProduct,
    { ...createSessionProduct('Product Launch Workshop', 'workshop', 120, 197),   description: 'Build your entire launch plan in one intensive workshop.', maxAttendees: 8 } as SessionProduct,
  ];
}

export function generateMockBookings(sessions: SessionProduct[]): Booking[] {
  const attendees = [
    { name: 'Alex Rivera', email: 'alex@example.com' },
    { name: 'Priya Sharma', email: 'priya@example.com' },
    { name: 'James Okafor', email: 'james@example.com' },
    { name: 'Sofia Lindqvist', email: 'sofia@example.com' },
    { name: 'Carlos Mendez', email: 'carlos@example.com' },
  ];
  const statuses: BookingStatus[] = ['confirmed','confirmed','confirmed','completed','completed','cancelled'];
  const now = Date.now();

  return attendees.flatMap((att, i) => {
    const session = sessions[i % sessions.length];
    const offsetDays = i < 3 ? i + 1 : -(i - 2);
    const date = new Date(now + offsetDays * 86400000).toISOString().slice(0,10);
    const hour = 9 + (i * 2 % 8);
    const startTime = `${String(hour).padStart(2,'0')}:00`;
    const endTime   = `${String(hour + Math.ceil(session.durationMinutes/60)).padStart(2,'0')}:00`;
    return [{
      id: `bkng-mock-${i}`,
      sessionProductId: session.id,
      attendeeName: att.name,
      attendeeEmail: att.email,
      date, startTime, endTime,
      timezone: 'America/New_York',
      status: statuses[i % statuses.length],
      paymentIntentId: session.price > 0 ? `pi_mock_${i}` : null,
      amountPaid: session.price,
      answers: { q1: 'Grow my email list to 10k subscribers' },
      meetingLink: session.meetingLink,
      reminders: [],
      createdAt: now - (5 - i) * 86400000,
      rescheduleCount: 0,
      notes: i === 1 ? 'Client requested recording' : '',
    }];
  });
}
