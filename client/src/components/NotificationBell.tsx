'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, FileText, ExternalLink, Megaphone, Trash2, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import ConfirmationModal from './shared/ConfirmationModal';

export default function NotificationBell() {
  const { notices, unreadCount, markAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleNoticeClick = (id: string, fileUrl?: string) => {
    markAsRead(id);
    if (fileUrl) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getPriorityStyles = (priority?: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15',
          iconBg: 'bg-red-500/20 text-red-400 border-red-500/30',
          badge: 'bg-red-500 text-white',
          label: 'EMERGENCY',
          dot: 'bg-red-500',
        };
      case 'medium':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15',
          iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          badge: 'bg-amber-500 text-white',
          label: 'IMPORTANT',
          dot: 'bg-amber-500',
        };
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15',
          iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          badge: 'bg-blue-500 text-white',
          label: 'INFO',
          dot: 'bg-blue-500',
        };
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="relative p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-xl active:scale-95 group"
      >
        <Bell
          size={24}
          className={`${unreadCount > 0 ? 'animate-[swing_2s_ease-in-out_infinite]' : ''} group-hover:rotate-12 transition-transform`}
        />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brick-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-brick-500 text-[10px] font-black items-center justify-center text-white border-2 border-gray-950">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="fixed md:absolute top-24 md:top-full left-4 right-4 md:left-auto md:right-0 md:mt-4 md:w-md bg-gray-900/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.7)] border border-white/10 z-100 overflow-hidden flex flex-col max-h-[70vh] md:max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brick-500 text-white rounded-2xl shadow-lg shadow-brick-500/30">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-base uppercase tracking-wider">
                    Updates
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brick-500 animate-pulse" />
                    {unreadCount} UNREAD STATUS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto custom-scrollbar flex-1 py-4">
              {notices.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-center px-8">
                  <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6 text-gray-700 border border-white/5">
                    <Bell size={36} />
                  </div>
                  <h4 className="text-white text-xl font-black mb-2 uppercase tracking-tight">
                    Board is Clear
                  </h4>
                  <p className="text-gray-500 text-xs font-medium max-w-xs leading-relaxed">
                    No notifications yet. New updates will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 px-4">
                  {notices.map((n) => {
                    const styles = getPriorityStyles(n.priority);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={n.id}
                        onClick={() => handleNoticeClick(n.id, n.fileUrl)}
                        className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group/item ${styles.bg}`}
                      >
                        {/* Status Bit */}
                        {n.isUnread && (
                          <div
                            className={`absolute top-0 right-0 w-2 h-2 rounded-bl-xl ${styles.dot} shadow-lg shadow-${n.priority === 'high' ? 'red' : n.priority === 'medium' ? 'amber' : 'blue'}-500/50`}
                          />
                        )}

                        <div className="flex gap-4 relative z-10">
                          <div
                            className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover/item:scale-110 ${styles.iconBg}`}
                          >
                            {n.type === 'pdf' ? <FileText size={20} /> : <Megaphone size={20} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between mb-1.5 gap-2">
                              <h4
                                className={`font-black text-sm truncate uppercase tracking-tight italic ${n.isUnread ? 'text-white' : 'text-gray-400'}`}
                              >
                                {n.title}
                              </h4>
                              <span
                                className={`shrink-0 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm ${styles.badge}`}
                              >
                                {styles.label}
                              </span>
                            </div>
                            <p
                              className={`text-xs line-clamp-2 leading-relaxed font-medium ${n.isUnread ? 'text-gray-300' : 'text-gray-500 italic'}`}
                            >
                              {n.type === 'text'
                                ? n.body
                                : 'A PDF attachment is available for review. Click to open.'}
                            </p>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest tabular-nums bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                                  {n.createdAt
                                    ? new Date(n.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Just now'}
                                </span>
                                {!n.isUnread && (
                                  <span className="text-[8px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle2 size={10} /> Read
                                  </span>
                                )}
                              </div>
                              {n.type === 'pdf' && (
                                <span className="flex items-center gap-1.5 text-[9px] font-black text-brick-400 uppercase tracking-widest group-hover/item:text-brick-300 transition-colors">
                                  <ExternalLink size={12} /> View PDF
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notices.length > 0 && (
              <div className="p-4 border-t border-white/5 bg-white/5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                  }}
                  className="w-full py-5 rounded-2xl bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-white/5 active:scale-[0.98] group/trash"
                >
                  <Trash2 size={18} className="group-hover/trash:animate-bounce" /> Clear All
                  Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={clearAll}
        title="Clear All Notifications"
        message="Are you sure you want to clear all your recent notifications? This action cannot be undone."
        confirmLabel="Clear All"
        variant="danger"
      />
    </div>
  );
}
