'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: ConfirmationModalProps) {
  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={24} />,
      button: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
      iconBg: 'bg-red-500/10',
    },
    warning: {
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
      iconBg: 'bg-amber-500/10',
    },
    info: {
      icon: <AlertTriangle className="text-blue-500" size={24} />,
      button: 'bg-brick-500 hover:bg-brick-600 shadow-brick-500/30',
      iconBg: 'bg-brick-500/10',
    },
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-gray-900/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${styles.iconBg} rounded-xl`}>{styles.icon}</div>
                <h3 className="font-black text-white uppercase tracking-tighter text-lg">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl text-gray-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-400 font-medium leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-white/5 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all font-black text-xs uppercase tracking-widest"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-4 rounded-2xl ${styles.button} text-white transition-all font-black text-xs uppercase tracking-widest shadow-xl`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
