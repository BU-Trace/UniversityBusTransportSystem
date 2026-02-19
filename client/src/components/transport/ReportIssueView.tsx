'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const categories = [
  { value: 'complaint', label: 'Complaint' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

const ReportIssueView: React.FC = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('complaint');
  const [contactInfo, setContactInfo] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !contactInfo) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          category,
          contactInfo,
          description,
          priority: 'medium',
          status: 'open',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        toast.success('Report submitted successfully!');
        setTitle('');
        setContactInfo('');
        setDescription('');
      } else {
        toast.error(data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Could not connect to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 border border-green-500/30">
          <CheckCircle2 size={40} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">
            Report Submitted!
          </h3>
          <p className="text-gray-400 mt-2 max-w-sm">
            Thank you for helping us improve our service. Our team will review your report shortly.
          </p>
        </div>
        <button
          onClick={() => setIsSuccess(false)}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs border border-white/10 transition-all"
        >
          Submit Another Report
        </button>
      </motion.div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-8 py-8 custom-scrollbar">
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <div className="flex items-center gap-2 text-brick-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
            <AlertCircle size={14} /> Anonymous Reporting
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">
            Submit an Issue
          </h3>
          <p className="text-gray-400 text-sm font-medium">
            Report bugs, voice complaints, or suggest new features to improve our transport network.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Bus 5 is delayed, AC not working..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brick-500/50 focus:bg-white/10 transition-all font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-brick-500/50 focus:bg-white/10 transition-all font-medium appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-gray-900 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold bg-white/5 px-4 py-3 rounded-xl border border-white/5 w-full">
                <Info size={14} className="text-brick-500" />
                No login required for submission
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
              Contact Info (Email/Phone)
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="E.g., student@example.com or 01XXXXXXXXX"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brick-500/50 focus:bg-white/10 transition-all font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about the issue..."
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brick-500/50 focus:bg-white/10 transition-all font-medium resize-none"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            type="submit"
            className="w-full py-5 bg-brick-600 hover:bg-brick-700 disabled:bg-brick-800/50 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-brick-900/40 transition-all flex items-center justify-center gap-3 mt-4"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={18} /> Submit Report
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueView;
