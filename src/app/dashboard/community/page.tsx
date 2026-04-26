'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/store';

const DEMO_ROOMS = [
  { id: '1', name: 'General', type: 'public', memberCount: 847, unread: 12, lastMessage: 'Anyone tried the new AI tool?', icon: '💬' },
  { id: '2', name: 'VIP Members', type: 'members-only', memberCount: 67, unread: 3, lastMessage: 'Exclusive content dropping today!', icon: '👑' },
  { id: '3', name: 'Announcements', type: 'public', memberCount: 847, unread: 0, lastMessage: 'New course module released', icon: '📢' },
  { id: '4', name: 'Feedback', type: 'public', memberCount: 412, unread: 5, lastMessage: 'Love the new dashboard!', icon: '💡' },
];

const DEMO_MESSAGES = [
  { id: '1', user: 'Sarah M.', avatar: '👩', content: 'Hey everyone! Just finished the first module of the course — absolutely amazing content! 🔥', time: '2m ago', reactions: { '🔥': 5, '❤️': 3 } },
  { id: '2', user: 'Mike R.', avatar: '👨', content: 'Has anyone tried the AI meal plan generator? It gave me a perfect macro split for my goals', time: '5m ago', reactions: { '👍': 8 } },
  { id: '3', user: 'Emma L.', avatar: '👩‍🦰', content: "Question: can I share the templates from the resource pack with my team?", time: '12m ago', reactions: {} },
  { id: '4', user: 'Alex K.', avatar: '🧑', content: "Just hit my first $1k month following the strategy from module 3! Thank you!! 🎉", time: '1h ago', reactions: { '🎉': 12, '💰': 7, '❤️': 4 } },
  { id: '5', user: 'Jordan P.', avatar: '👨‍💻', content: "The AI content generator saved me 3 hours today. This is the future.", time: '2h ago', reactions: { '🤖': 6 } },
];

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [selectedRoom, setSelectedRoom] = useState('1');
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-sm text-gray-500 mt-1">Engage with your audience in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Go Live 🔴</Button>
          <Button>+ Create Room</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Rooms */}
        <div className="lg:col-span-1 space-y-2 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Channels</h3>
          {DEMO_ROOMS.map(room => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                selectedRoom === room.id
                  ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{room.icon}</span>
                  <span className="font-medium text-sm">{room.name}</span>
                </div>
                {room.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center">
                    {room.unread}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1 truncate">{room.lastMessage}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{room.memberCount} members</div>
            </button>
          ))}

          <h3 className="text-xs font-semibold text-gray-400 uppercase mt-4 mb-2">Stats</h3>
          <Card className="p-3">
            <div className="text-xs text-gray-500">Total Members</div>
            <div className="text-lg font-bold">847</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-gray-500">Active Today</div>
            <div className="text-lg font-bold text-emerald-600">124</div>
          </Card>
        </div>

        {/* Chat */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{DEMO_ROOMS.find(r => r.id === selectedRoom)?.icon}</span>
                <h2 className="font-semibold">{DEMO_ROOMS.find(r => r.id === selectedRoom)?.name}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {DEMO_ROOMS.find(r => r.id === selectedRoom)?.memberCount} members
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">📌 Pinned</Button>
                <Button variant="ghost" size="sm">⚙️</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {DEMO_MESSAGES.map(msg => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg shrink-0">
                  {msg.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{msg.user}</span>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                  </div>
                  <p className="text-sm mt-0.5">{msg.content}</p>
                  {Object.entries(msg.reactions).length > 0 && (
                    <div className="flex gap-1.5 mt-1.5">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <button key={emoji} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                          {emoji} {count}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button>Send</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
