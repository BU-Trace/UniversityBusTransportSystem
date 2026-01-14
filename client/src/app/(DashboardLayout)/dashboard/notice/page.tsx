'use client';

import React, { useEffect, useState } from 'react';
import { MdSend, MdSync } from 'react-icons/md';
import { toast } from 'sonner';

import api from '@/lib/axios';

type Notification = {
  title: string;
  message: string;
  createdAt: string;
};

export default function NoticePage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [recent, setRecent] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRecent = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setRecent(data?.data || []);
    } catch (error: unknown) {
      console.error(error);
      toast.error('Failed to load recent notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Message is required');
      return;
    }

    setIsSending(true);
    try {
      const { data } = await api.post('/notifications/broadcast', {
        title: title.trim() || 'Notice',
        message: message.trim(),
      });

      toast.success('Notification sent to all users');
      setTitle('');
      setMessage('');
      setRecent((prev) => [data?.data, ...prev].slice(0, 20));
    } catch (error: unknown) {
      const apiMessage =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      toast.error(apiMessage || 'Failed to send notification. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notice & Alerts</h1>
        <p className="text-gray-500">Send instant notifications to every connected user.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Emergency maintenance, schedule update..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Write the announcement you want every user to see immediately."
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              <MdSend />
              {isSending ? 'Sending...' : 'Send to Everyone'}
            </button>

            <button
              type="button"
              onClick={loadRecent}
              disabled={isLoading}
              className="inline-flex items-center gap-2 border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
            >
              <MdSync className={isLoading ? 'animate-spin' : ''} />
              Refresh Activity
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Broadcasts</h2>
              <p className="text-xs text-gray-500">
                Live feed of the latest notifications sent to users.
              </p>
            </div>
            {isLoading && <span className="text-xs text-gray-500">Refreshing...</span>}
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {recent.length === 0 && (
              <p className="text-sm text-gray-500">No notifications sent yet.</p>
            )}
            {recent.map((notice, idx) => (
              <div
                key={`${notice.createdAt}-${idx}`}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/60"
              >
                <p className="text-xs text-gray-500">
                  {new Date(notice.createdAt).toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{notice.title}</p>
                <p className="text-sm text-gray-700 mt-1">{notice.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
