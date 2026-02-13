/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Search,
  Upload,
  FileText,
  RefreshCw,
  Megaphone,
  Loader,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/axios';
import ConfirmationModal from '@/components/shared/ConfirmationModal';

type NoticeType = 'text' | 'pdf';
type NoticePriority = 'low' | 'medium' | 'high';
type NoticeStatus = 'draft' | 'published';

type INotice = {
  id: string;
  title: string;
  type: NoticeType;
  priority: NoticePriority;
  status: NoticeStatus;
  body?: string;
  fileUrl?: string;
  createdAt?: string;
  publishedAt?: string;
  isPublished?: boolean;
};

const CLOUD_NAME = 'dpiofecgs';
const UPLOAD_PRESET = 'butrace';

async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(url, { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.error?.message || 'Cloudinary upload failed');
  return data.secure_url as string;
}

function safeOpen(url?: string) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function formatDate(d?: string) {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleString();
}

const PriorityBadge = ({ priority }: { priority: NoticePriority }) => {
  const styles = {
    low: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    medium: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    high: 'bg-red-500/10 border-red-500/20 text-red-500 animate-pulse',
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${styles[priority]}`}
    >
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }: { status: NoticeStatus }) => {
  const styles = {
    draft: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    published: 'bg-green-500/10 border-green-500/20 text-green-400',
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${styles[status]}`}
    >
      {status}
    </span>
  );
};

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </motion.div>
  );
}

function HeaderModal({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="p-8 border-b border-white/5 flex justify-between items-start gap-4 sticky top-0 bg-gray-900/90 backdrop-blur-3xl z-10">
      <div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed">{subtitle}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-3 bg-white/5 text-gray-400 rounded-2xl hover:bg-brick-500 hover:text-white transition-all shadow-lg border border-white/10"
      >
        <X size={24} />
      </button>
    </div>
  );
}

interface IRawNotice {
  _id?: string;
  id?: string;
  title?: string;
  type?: NoticeType;
  priority?: NoticePriority;
  status?: NoticeStatus;
  body?: string;
  text?: string;
  fileUrl?: string;
  pdfUrl?: string;
  attachmentUrl?: string;
  createdAt?: string;
  publishedAt?: string;
  isPublished?: boolean;
  published?: boolean;
}

export default function NoticeManagementPage() {
  const { data: session } = useSession();

  const [mounted, setMounted] = useState(false);
  const [notices, setNotices] = useState<INotice[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [noticeType, setNoticeType] = useState<NoticeType>('text');
  const [priority, setPriority] = useState<NoticePriority>('medium');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }

  const normalizeNotice = useCallback(
    (n: IRawNotice): INotice => ({
      id: n?._id || n?.id || '',
      title: n?.title || '',
      type: (n?.type as NoticeType) || (n?.fileUrl ? 'pdf' : 'text'),
      priority: (n?.priority as NoticePriority) || 'medium',
      status: (n?.status as NoticeStatus) || 'published',
      body: n?.body || n?.text || '',
      fileUrl: n?.fileUrl || n?.pdfUrl || n?.attachmentUrl || '',
      createdAt: n?.createdAt,
      publishedAt: n?.publishedAt,
      isPublished: n?.isPublished ?? n?.published ?? true,
    }),
    []
  );

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<IRawNotice[]>>('/notice/get-all-notices', {
        params: {
          page,
          limit,
          searchTerm: query.trim() || undefined,
        },
      });
      const res = response.data;

      const list = (res?.data || []).map(normalizeNotice);
      setNotices(list);
      setTotalPages(res?.meta?.totalPages || 1);
      setTotalCount(res?.meta?.total || 0);
    } catch (_e) {
      // toast is handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, limit, query, normalizeNotice]);

  useEffect(() => {
    if (mounted && session) {
      const timer = setTimeout(() => {
        loadNotices();
      }, 500); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [mounted, session, loadNotices]);

  const openAdd = () => {
    setModalType('add');
    setSelectedId(null);
    setTitle('');
    setBody('');
    setFileUrl('');
    setIsModalOpen(true);
  };

  const openEdit = (n: INotice) => {
    setModalType('edit');
    setSelectedId(n.id);
    setNoticeType(n.type);
    setPriority(n.priority);
    setTitle(n.title);
    setBody(n.body || '');
    setFileUrl(n.fileUrl || '');
    setIsModalOpen(true);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return toast.error('Please upload a PDF file.');
    }
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setFileUrl(url);
    } catch (_err) {
      // toast is handled by global helper or interceptor
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const saveNotice = async (vStatus: NoticeStatus) => {
    if (uploading) return toast.error('Wait for upload to finish.');
    if (!title.trim()) return toast.error('Title is required');
    if (noticeType === 'text' && !body.trim()) return toast.error('Notice text is required');
    if (noticeType === 'pdf' && !fileUrl.trim()) return toast.error('PDF file is required');

    const payload = {
      title: title.trim(),
      type: noticeType,
      priority,
      status: vStatus,
      body: noticeType === 'text' ? body.trim() : undefined,
      fileUrl: noticeType === 'pdf' ? fileUrl.trim() : undefined,
    };

    try {
      if (modalType === 'edit' && selectedId) {
        await api.put(`/notice/publish-notice/${selectedId}`, payload);
      } else {
        await api.post('/notice/create-notice', payload);
      }

      // If it's a draft, toast manually. If published, SSE in NotificationContext will toast.
      if (vStatus === 'draft') {
        toast.success('Draft saved.');
      }

      setIsModalOpen(false);
      loadNotices();
    } catch (_err) {
      // toast is handled by interceptor
    }
  };

  const openDeleteConfirm = (id: string) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };

  const deleteNoticeFunc = async () => {
    if (!selectedId) return;
    try {
      await api.delete(`/notice/delete-notice/${selectedId}`);
      loadNotices();
      toast.success('Notice deleted.');
    } catch (_e) {
      // toast is handled by interceptor
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-12 pb-12">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Notice Publish
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed">
            Manage announcements, alerts, and PDF schedules.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brick-400 transition-colors"
              size={20}
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search notices..."
              className="w-full pl-12 pr-6 py-4 rounded-3xl border border-white/5 bg-white/5 text-white shadow-2xl outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-medium placeholder:text-gray-600"
            />
          </div>

          <button
            onClick={openAdd}
            className="bg-brick-500 text-white px-8 py-5 rounded-4xl font-black text-xs uppercase tracking-widest hover:bg-brick-600 transition-all shadow-2xl shadow-brick-500/30 flex items-center gap-3 border border-white/10"
          >
            <Plus size={20} /> New Notice
          </button>

          <button
            onClick={loadNotices}
            className="p-5 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-3xl transition-all border border-white/5 shadow-xl"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* list */}
      <div className="bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white/10 shadow-3xl overflow-hidden min-h-[520px] flex flex-col relative">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="font-black text-xl text-white uppercase tracking-wider flex items-center gap-3">
            <Megaphone className="text-brick-400" size={28} /> Notice Board
          </h3>
          <div className="text-xs font-black text-gray-400 tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/10">
            TOTAL: <span className="text-brick-400 ml-1">{loading ? '...' : totalCount}</span>
          </div>
        </div>

        <div className="p-8 overflow-x-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="py-24 text-center">
              <div className="mx-auto w-12 h-12 border-4 border-brick-500/20 border-t-brick-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                Loading...
              </p>
            </div>
          ) : notices.length === 0 ? (
            <div className="py-24 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-brick-500/10 flex items-center justify-center mb-6 text-brick-500">
                <Megaphone size={32} />
              </div>
              <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">
                Empty Board
              </h4>
              <p className="text-gray-500 font-medium leading-relaxed">
                Start by creating a new notice.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-b border-white/5">
                  <th className="pb-8">Information</th>
                  <th className="pb-8">Status / Priority</th>
                  <th className="pb-8">Type & Attachment</th>
                  <th className="pb-8">Created At</th>
                  <th className="pb-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {notices.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all group"
                  >
                    <td className="py-6 px-2">
                      <div className="font-black text-white group-hover:text-brick-400 transition-colors text-base tracking-tight max-w-sm truncate">
                        {n.title}
                      </div>
                      <div className="mt-2 text-xs font-bold text-gray-500 line-clamp-1 max-w-xs">
                        {n.body || (n.fileUrl ? 'PDF Attachment' : 'No preview available')}
                      </div>
                    </td>

                    <td className="py-8">
                      <div className="flex flex-col gap-2 scale-90 origin-left">
                        <StatusBadge status={n.status} />
                        <PriorityBadge priority={n.priority} />
                      </div>
                    </td>

                    <td className="py-8">
                      {n.type === 'pdf' ? (
                        <button
                          onClick={() => safeOpen(n.fileUrl)}
                          className="flex items-center gap-3 text-xs font-black text-gray-400 hover:text-white transition-colors group/btn"
                        >
                          <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover/btn:bg-brick-500 group-hover/btn:border-brick-400 transition-all">
                            <FileText size={16} />
                          </div>
                          PDF View
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 text-xs font-black text-gray-500">
                          <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            <FileText size={16} />
                          </div>
                          Text Only
                        </div>
                      )}
                    </td>

                    <td className="py-8 font-bold text-gray-500 text-xs tabular-nums tracking-wider uppercase">
                      {formatDate(n.createdAt)}
                    </td>

                    <td className="py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-100 transition-all duration-500">
                        <button
                          onClick={() => openEdit(n)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-white hover:bg-brick-500 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(n.id)}
                          className="p-4 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-2xl transition-all border border-white/10 shadow-2xl active:scale-90"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination UI */}
        <div className="p-8 border-t border-white/5 bg-white/5 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Page <span className="text-white">{page}</span> of{' '}
            <span className="text-white">{totalPages}</span>
          </div>
          <div className="flex gap-4">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
              className="p-4 bg-white/5 text-gray-400 hover:text-white rounded-2xl border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page === totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="p-4 bg-white/5 text-gray-400 hover:text-white rounded-2xl border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* modal */}
      <AnimatePresence>
        {isModalOpen && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-3xl rounded-[3rem] shadow-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/10 relative custom-scrollbar"
            >
              <HeaderModal
                title={modalType === 'add' ? 'New Notice' : 'Update Notice'}
                subtitle="Specify priority and publish now or save as draft."
                onClose={() => setIsModalOpen(false)}
              />

              <div className="p-8 space-y-8">
                {/* Notice header fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 font-sans">
                      Notice Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Bus Schedule Update"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-gray-600 outline-none focus:border-brick-500/50 focus:ring-4 focus:ring-brick-500/10 transition-all font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 font-sans">
                      Type
                    </label>
                    <select
                      value={noticeType}
                      onChange={(e) => setNoticeType(e.target.value as NoticeType)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-brick-500/50 transition-all font-bold appearance-none"
                    >
                      <option value="text" className="bg-gray-900">
                        Text Content
                      </option>
                      <option value="pdf" className="bg-gray-900">
                        PDF Document
                      </option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 font-sans">
                      Priority Level
                    </label>
                    <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/10">
                      {(['low', 'medium', 'high'] as NoticePriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            priority === p
                              ? p === 'high'
                                ? 'bg-red-500 text-white'
                                : p === 'medium'
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-500 text-white'
                              : 'text-gray-500 hover:bg-white/5'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 font-sans">
                      Quick Hints
                    </label>
                    <div className="flex items-center gap-3 p-5 bg-brick-500/10 rounded-2xl border border-brick-500/20 text-brick-400">
                      <AlertCircle size={18} />
                      <span className="text-[10px] font-bold uppercase">
                        High priority sends push notification
                      </span>
                    </div>
                  </div>
                </div>

                {noticeType === 'text' ? (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 font-sans">
                      Notice Body
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Type your notice detail here..."
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white placeholder:text-gray-600 outline-none focus:border-brick-500/50 transition-all font-medium leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 font-sans flex items-center gap-2">
                      PDF Attachment
                    </label>

                    <div
                      className="relative group p-12 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 transition-all hover:border-brick-500/50 flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden"
                      onClick={() => !uploading && fileRef.current?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader className="animate-spin text-brick-500 mb-4" size={48} />
                          <p className="text-white font-black uppercase tracking-widest text-xs">
                            Uploading...
                          </p>
                        </>
                      ) : fileUrl ? (
                        <>
                          <FileText className="text-green-400 mb-4" size={48} />
                          <p className="text-white font-black mb-1 text-sm uppercase tracking-tighter line-clamp-1 px-4">
                            {fileUrl.split('/').pop()}
                          </p>
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                            Click to replace
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload
                            className="text-gray-600 group-hover:text-brick-500 transition-colors mb-4"
                            size={48}
                          />
                          <p className="text-white font-black uppercase tracking-widest text-xs mb-1">
                            Upload PDF Document
                          </p>
                          <p className="text-gray-500 text-xs font-medium italic">Max size: 10MB</p>
                        </>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={onFileChange}
                      />
                    </div>
                  </div>
                )}

                {/* actions */}
                <div className="pt-4 flex gap-4 sticky bottom-0 bg-gray-900 pb-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 rounded-3xl font-black text-gray-500 hover:text-white hover:bg-white/5 transition-all text-xs uppercase tracking-[0.3em]"
                  >
                    Cancel
                  </button>
                  <div className="flex-2 flex gap-4">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => saveNotice('draft')}
                      className="flex-1 py-5 rounded-3xl font-black text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex justify-center items-center gap-3 text-xs uppercase tracking-[0.3em]"
                    >
                      <Save size={18} /> Draft
                    </button>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => saveNotice('published')}
                      className="flex-1 py-5 rounded-3xl font-black text-white bg-brick-500 hover:bg-brick-600 shadow-2xl shadow-brick-500/30 transition-all flex justify-center items-center gap-3 text-xs uppercase tracking-[0.3em] border border-white/10"
                    >
                      {uploading ? (
                        <Loader className="animate-spin" size={18} />
                      ) : (
                        <Megaphone size={18} />
                      )}
                      {modalType === 'add' ? 'Publish' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={deleteNoticeFunc}
        title="Delete Notice"
        message="Are you sure you want to permanently delete this notice? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
