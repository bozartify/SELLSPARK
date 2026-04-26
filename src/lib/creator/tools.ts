/**
 * Creator Power Tools
 *
 * - Live Streaming (WebRTC)
 * - Community Chat (WebSocket)
 * - Scheduling & Calendar
 * - File Manager
 * - Link-in-Bio Builder
 * - Custom Forms & Surveys
 * - Testimonial Collector
 * - Content Calendar & Scheduler
 * - Waitlist & Launch System
 * - Notification Center
 */

// ─── Live Streaming ─────────────────────────────────────────────────────────
export interface LiveStream {
  id: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended';
  viewerCount: number;
  startedAt: string | null;
  endedAt: string | null;
  recording: boolean;
  chatEnabled: boolean;
  productPins: string[]; // product IDs pinned during stream
  scheduledFor?: string;
  thumbnail?: string;
}

export class LiveStreamManager {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async startStream(options: {
    video: boolean;
    audio: boolean;
    screen?: boolean;
  }): Promise<MediaStream | null> {
    try {
      if (options.screen) {
        this.stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: options.audio,
        });
      } else {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: options.video ? { width: { ideal: 1920 }, height: { ideal: 1080 } } : false,
          audio: options.audio,
        });
      }

      // Start recording
      this.recorder = new MediaRecorder(this.stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      this.recorder.ondataavailable = (e) => { if (e.data.size > 0) this.chunks.push(e.data); };
      this.recorder.start(1000);

      return this.stream;
    } catch { return null; }
  }

  stopStream(): Blob | null {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.chunks.length > 0) {
      const recording = new Blob(this.chunks, { type: 'video/webm' });
      this.chunks = [];
      return recording;
    }
    return null;
  }

  get isStreaming(): boolean {
    return this.stream !== null && this.stream.active;
  }
}

// ─── Community Chat System ──────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'product-link' | 'system';
  timestamp: string;
  reactions: Record<string, number>;
  replyTo?: string;
  pinned: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'public' | 'members-only' | 'vip' | 'dm';
  memberCount: number;
  unreadCount: number;
  lastMessage?: ChatMessage;
}

// ─── Content Calendar & Scheduler ───────────────────────────────────────────
export interface ScheduledContent {
  id: string;
  title: string;
  type: 'product-launch' | 'email' | 'social-post' | 'livestream' | 'blog' | 'promotion';
  status: 'draft' | 'scheduled' | 'published' | 'cancelled';
  scheduledFor: string;
  platforms: string[];
  content: string;
  media?: string[];
  tags: string[];
}

export function getContentCalendar(month: number, year: number): Array<{
  date: string;
  items: ScheduledContent[];
  isToday: boolean;
}> {
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    return { date, items: [], isToday: date === today };
  });
}

// ─── Custom Forms & Surveys ─────────────────────────────────────────────────
export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'rating' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: { min?: number; max?: number; pattern?: string };
}

export interface CustomForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  submitButton: string;
  successMessage: string;
  redirectUrl?: string;
  notifyEmail?: string;
  responseCount: number;
  active: boolean;
}

// ─── Testimonial Collector ──────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  customerName: string;
  customerTitle?: string;
  customerAvatar?: string;
  rating: number;
  text: string;
  videoUrl?: string;
  productId?: string;
  verified: boolean;
  featured: boolean;
  approved: boolean;
  createdAt: string;
}

export interface TestimonialWall {
  id: string;
  title: string;
  layout: 'grid' | 'masonry' | 'carousel' | 'list';
  testimonials: Testimonial[];
  showRatings: boolean;
  showPhotos: boolean;
  theme: 'light' | 'dark';
  embedCode: string;
}

// ─── Waitlist & Launch System ───────────────────────────────────────────────
export interface Waitlist {
  id: string;
  productId: string;
  name: string;
  description: string;
  subscriberCount: number;
  launchDate?: string;
  referralEnabled: boolean;
  referralReward?: string;
  status: 'active' | 'launched' | 'closed';
  milestones: Array<{
    count: number;
    reward: string;
    reached: boolean;
  }>;
}

export interface WaitlistSubscriber {
  id: string;
  email: string;
  name?: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  position: number;
  joinedAt: string;
}

// ─── Notification Center ────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: 'sale' | 'review' | 'subscriber' | 'milestone' | 'system' | 'ai-insight' | 'payout';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  icon: string;
  createdAt: string;
}

export const NOTIFICATION_TEMPLATES: Record<string, (data: Record<string, string>) => AppNotification> = {
  newSale: (data) => ({
    id: `notif_${Date.now()}`, type: 'sale', title: 'New Sale!',
    message: `${data.customerName} purchased ${data.productName} for ${data.amount}`,
    read: false, actionUrl: '/dashboard/orders', icon: '💰', createdAt: new Date().toISOString(),
  }),
  newReview: (data) => ({
    id: `notif_${Date.now()}`, type: 'review', title: 'New Review',
    message: `${data.customerName} left a ${data.rating}-star review on ${data.productName}`,
    read: false, actionUrl: '/dashboard/products', icon: '⭐', createdAt: new Date().toISOString(),
  }),
  milestone: (data) => ({
    id: `notif_${Date.now()}`, type: 'milestone', title: 'Milestone Reached!',
    message: `Congratulations! You've reached ${data.milestone} in total revenue!`,
    read: false, actionUrl: '/dashboard/analytics', icon: '🏆', createdAt: new Date().toISOString(),
  }),
  aiInsight: (data) => ({
    id: `notif_${Date.now()}`, type: 'ai-insight', title: 'AI Insight',
    message: data.insight,
    read: false, actionUrl: '/dashboard/analytics', icon: '🧠', createdAt: new Date().toISOString(),
  }),
};

export const liveStreamManager = new LiveStreamManager();
