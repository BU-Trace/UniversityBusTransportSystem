'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Clock,
  Send,
  X,
  Phone,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Search,
  Hash,
  Filter,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

interface IIssue {
  _id: string;
  issue_id: string;
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'complaint' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contactInfo?: string;
  solution?: string;
  createdAt: string;
}

const IssuesManagementPage = () => {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<IIssue | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filtering, Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'open' | 'in_progress' | 'resolved' | 'closed'
  >('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchIssues = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/issue`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setIssues(data.data);
      }
    } catch (error) {
      console.error('Fetch issues error:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(`${BASE_URL}/issue/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchIssues();
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const handleUpdatePriority = async (id: string, newPriority: string) => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(`${BASE_URL}/issue/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Priority updated to ${newPriority}`);
        fetchIssues();
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDeleteIssue = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this report?') || !session?.accessToken)
      return;
    try {
      const res = await fetch(`${BASE_URL}/issue/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Report deleted permanently');
        fetchIssues();
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleUpdateSolution = async () => {
    if (!selectedIssue || !session?.accessToken) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/issue/${selectedIssue._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          solution: solutionText,
          status: 'resolved',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Solution updated and issue marked as resolved');
        setSelectedIssue(null);
        fetchIssues();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Connection error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredIssues = useMemo(() => {
    const result = issues.filter((issue) => {
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
      const matchesSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.contactInfo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issue_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    // Sort by Date Descending
    return result.sort(
      (a: IIssue, b: IIssue) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [issues, filterStatus, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const paginatedIssues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredIssues.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredIssues, currentPage]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'high':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'medium':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default:
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'in_progress':
        return 'text-blue-400 bg-blue-400/10';
      case 'closed':
        return 'text-gray-400 bg-white/5';
      default:
        return 'text-amber-400 bg-amber-400/10';
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight italic">
            Issue Center
          </h1>
          <p className="text-gray-400 font-medium mt-1">
            Professional lifecycle management for university transport reports
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brick-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brick-500/50 transition-all font-medium"
            />
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/5 w-full lg:w-auto">
            {(['all', 'open', 'in_progress', 'resolved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilterStatus(s);
                  setCurrentPage(1);
                }}
                className={`flex-1 lg:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-[1.25rem] transition-all ${
                  filterStatus === s
                    ? 'bg-brick-600 text-white shadow-lg'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-brick-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Hash size={12} /> Issue Details
                      </div>
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                      Priority
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Clock size={12} /> Received
                      </div>
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Reporter
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {paginatedIssues.map((issue) => (
                      <motion.tr
                        key={issue._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-[10px] font-black text-brick-500 uppercase tracking-widest mb-1">
                              {issue.issue_id}
                            </p>
                            <h4 className="text-white font-black uppercase text-sm group-hover:text-brick-400 transition-colors">
                              {issue.title}
                            </h4>
                            <p className="text-gray-500 text-[10px] font-medium mt-1 line-clamp-1 max-w-xs">
                              {issue.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span
                            className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(issue.priority)}`}
                          >
                            {issue.priority}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span
                            className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${getStatusColor(issue.status)}`}
                          >
                            {issue.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-white text-[10px] font-bold">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-gray-500 text-[9px] font-medium uppercase tracking-tighter">
                            {new Date(issue.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-brick-500/10 rounded-lg text-brick-400">
                              <Phone size={12} />
                            </div>
                            <span className="text-white text-[10px] font-bold truncate max-w-[100px]">
                              {issue.contactInfo || 'Anonymous'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedIssue(issue);
                                setSolutionText(issue.solution || '');
                              }}
                              className="p-2.5 bg-brick-600 hover:bg-brick-700 text-white rounded-xl transition-all shadow-lg shadow-brick-900/40"
                              title={issue.solution ? 'Edit Solution' : 'Resolve'}
                            >
                              <MessageSquare size={14} />
                            </button>

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === issue._id ? null : issue._id);
                                }}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  activeMenuId === issue._id
                                    ? 'bg-brick-600 text-white border-brick-500 shadow-lg'
                                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/5'
                                }`}
                              >
                                <MoreHorizontal size={14} />
                              </button>

                              <AnimatePresence>
                                {activeMenuId === issue._id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, x: 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: 10 }}
                                    className="absolute top-1/2 right-full mr-2 -translate-y-1/2 w-48 bg-[#0a0f25] border border-white/10 rounded-2xl p-2 shadow-2xl z-20 pointer-events-auto"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => {
                                        handleUpdateStatus(issue._id, 'in_progress');
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-blue-400 hover:bg-white/5 rounded-xl flex items-center gap-2"
                                    >
                                      <Clock size={12} /> Mark In Progress
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleUpdateStatus(issue._id, 'closed');
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-gray-400 hover:bg-white/5 rounded-xl flex items-center gap-2"
                                    >
                                      <X size={12} /> Close Report
                                    </button>
                                    <div className="h-px bg-white/5 my-2" />
                                    <button
                                      onClick={() => {
                                        handleUpdatePriority(issue._id, 'urgent');
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-red-400 hover:bg-white/5 rounded-xl"
                                    >
                                      Set Priority: Urgent
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleUpdatePriority(issue._id, 'medium');
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-amber-400 hover:bg-white/5 rounded-xl"
                                    >
                                      Set Priority: Medium
                                    </button>
                                    <div className="h-px bg-white/5 my-2" />
                                    <button
                                      onClick={() => {
                                        handleDeleteIssue(issue._id);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center gap-2 transition-colors"
                                    >
                                      <Trash2 size={12} /> Delete Permanently
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {filteredIssues.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex p-6 bg-white/5 rounded-full text-gray-600 mb-4">
                  <Filter size={40} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  No issues found
                </h3>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-4xl p-4 px-8">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Showing{' '}
                <span className="text-white">
                  {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredIssues.length)}
                </span>{' '}
                of <span className="text-white">{filteredIssues.length}</span> reports
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/5 rounded-xl text-white transition-all shadow-xl"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-2 px-4">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                        currentPage === i + 1
                          ? 'bg-brick-600 text-white shadow-lg'
                          : 'text-gray-500 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/5 rounded-xl text-white transition-all shadow-xl"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Solution Modal */}
      <AnimatePresence>
        {selectedIssue && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIssue(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#070b1c] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 space-y-6">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brick-600/20 rounded-2xl text-brick-400">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white uppercase tracking-tight">
                        Issue Solution
                      </h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {selectedIssue.issue_id}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </header>

                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 space-y-2">
                  <p className="text-[10px] font-black text-brick-500 uppercase tracking-widest">
                    Original Issue
                  </p>
                  <p className="text-white font-black uppercase text-sm">{selectedIssue.title}</p>
                  <p className="text-gray-400 text-xs font-medium leading-relaxed">
                    {selectedIssue.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Write Solution
                  </label>
                  <textarea
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Describe how the issue was resolved..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-4xl px-5 py-5 text-white placeholder:text-gray-600 focus:outline-none focus:border-brick-500/50 focus:bg-white/10 transition-all font-medium resize-none text-sm"
                  />
                </div>

                <button
                  onClick={handleUpdateSolution}
                  disabled={isUpdating || !solutionText}
                  className="w-full py-5 bg-brick-600 hover:bg-brick-700 disabled:opacity-50 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-brick-900/40 transition-all flex items-center justify-center gap-3"
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} /> Resolve Issue
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IssuesManagementPage;
