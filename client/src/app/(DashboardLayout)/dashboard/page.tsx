'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MdDirectionsBus,
  MdPeople,
  MdBarChart,
  MdArrowForward,
  MdCheckCircle,
  MdPlayArrow,
  MdSubtitles,
  MdSettingsEthernet,
  MdWifi,
  MdMemory,
  MdList,
  MdRefresh,
} from 'react-icons/md';
import { RefreshCcw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { toast } from 'sonner';
import DashboardWatch from '@/components/DashboardWatch';
import DashboardCalendar from '@/components/DashboardCalendar';

interface ActiveSession {
  id: string;
  name: string;
  role: string;
  profileImage?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

interface DashboardData {
  overview: {
    totalBuses: number;
    activeBuses: number;
    totalDrivers: number;
    activeDrivers: number;
  };
  latestAlert: {
    title: string;
    description: string;
    priority: string;
    createdAt: string;
  } | null;
  charts: {
    busStatus: { name: string; value: number }[];
    userRoles: { name: string; value: number }[];
    issueTrend: { name: string; count: number }[];
  };
  recentReports: IRecentReport[];
}

interface IRecentReport {
  _id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  description: string;
}

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

const MergedDashboard = () => {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'connecting'>(
    'connecting'
  );
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  const [activities, setActivities] = useState<
    { id: string; text: string; time: string; type: string }[]
  >([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  const fetchStats = React.useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast.error(json.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      toast.error('Could not connect to server');
    } finally {
      setLoading(false);
      setLastSync(new Date().toLocaleTimeString());
    }
  }, [session]);

  const handleManualRefresh = async () => {
    await fetchStats();
    toast.success('Dashboard data synchronized.');
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();

    // Socket Initialization for Real-time Robust System
    const socket: Socket = io(BASE_URL.replace('/api/v1', ''), {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      setSocketStatus('connected');
      console.log('📡 Dashboard Socket Connected');

      // Register this user session
      if (session?.user) {
        socket.emit('registerUser', {
          id: session.user.id || session.user._id,
          name: session.user.name,
          role: session.user.role,
          profileImage: session.user.profileImage || session.user.image,
        });
      }
    });

    socket.on('activeSessionsUpdate', (sessions: ActiveSession[]) => {
      setActiveSessions(sessions);
    });

    socket.on('disconnect', () => {
      setSocketStatus('disconnected');
    });

    socket.on('receiveBusStatus', () => {
      // Robust auto-refresh on status change
      fetchStats();
      setActivities((prev) => [
        {
          id: Math.random().toString(),
          text: 'Bus status updated by system',
          time: new Date().toLocaleTimeString(),
          type: 'system',
        },
        ...prev.slice(0, 4),
      ]);
    });

    socket.on('receiveLocation', (data) => {
      setActivities((prev) => [
        {
          id: Math.random().toString(),
          text: `Bus ${data.busId.split('_')[1]} updated location`,
          time: new Date().toLocaleTimeString(),
          type: 'location',
        },
        ...prev.slice(0, 4),
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchStats, session?.user]);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: 'Total Buses',
        value: data.overview.totalBuses.toString(),
        icon: <MdDirectionsBus size={32} />,
        color: 'text-brick-400',
        bg: 'bg-brick-500/20',
      },
      {
        label: 'Active Buses',
        value: data.overview.activeBuses.toString(),
        icon: <MdDirectionsBus size={32} />,
        color: 'text-orange-400',
        bg: 'bg-orange-500/20',
      },
      {
        label: 'Total Drivers',
        value: data.overview.totalDrivers.toString(),
        icon: <MdPeople size={32} />,
        color: 'text-blue-400',
        bg: 'bg-blue-500/20',
      },
      {
        label: 'Active Drivers',
        value: data.overview.activeDrivers.toString(),
        icon: <MdPeople size={32} />,
        color: 'text-green-400',
        bg: 'bg-green-500/20',
      },
    ];
  }, [data]);

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
      const json = await res.json();
      if (json.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchStats();
      }
    } catch {
      toast.error('Update failed');
    }
  };

  const [selectedReport, setSelectedReport] = useState<IRecentReport | null>(null);
  const [reportSolution, setReportSolution] = useState('');

  const handleResolveReport = async () => {
    if (!selectedReport || !session?.accessToken) return;
    try {
      const res = await fetch(`${BASE_URL}/issue/${selectedReport._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          status: 'resolved',
          solution: reportSolution,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Issue resolved successfully');
        setSelectedReport(null);
        setReportSolution('');
        fetchStats();
      }
    } catch {
      toast.error('Resolution failed');
    }
  };

  if (!mounted) return null;

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brick-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            Loading Real-time Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-brick-500 rounded-2xl text-white shadow-lg shadow-brick-500/20">
              <MdBarChart size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight uppercase">Overview</h1>
              <p className="text-gray-400 text-sm font-medium tracking-wide">
                Real-time university bus management statistics
              </p>
            </div>
          </div>
        </motion.div>

        <button
          onClick={handleManualRefresh}
          className="px-6 py-3 bg-white/5 hover:bg-brick-500/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/10 transition-all flex items-center gap-3 shadow-xl hover:shadow-brick-500/5 hover:border-brick-500/30"
        >
          <RefreshCcw className={`w-4 h-4 text-brick-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Dynamic Watch Component (New) */}
      <DashboardWatch activeSessions={activeSessions} />

      <DashboardCalendar />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* System Health Module (New Robust Component) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="xl:col-span-1 bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
        >
          <div className="relative z-10">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              Live System Health
              <span className="flex h-2 w-2 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${socketStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${socketStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}
                ></span>
              </span>
            </h4>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <MdWifi size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    Network
                  </span>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase">Stable</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${socketStatus === 'connected' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}
                  >
                    <MdSettingsEthernet size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    Socket.io
                  </span>
                </div>
                <span
                  className={`text-[10px] font-black uppercase ${socketStatus === 'connected' ? 'text-blue-500' : 'text-red-500'}`}
                >
                  {socketStatus}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                    <MdMemory size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    Last Sync
                  </span>
                </div>
                <span className="text-[10px] font-black text-purple-500 uppercase">{lastSync}</span>
              </div>
            </div>

            <button
              onClick={() => {
                fetchStats();
                setLastSync(new Date().toLocaleTimeString());
              }}
              className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2 group-hover:border-brick-500/30"
            >
              <MdRefresh size={14} className={loading ? 'animate-spin' : ''} /> Force Re-Sync
            </button>
          </div>
          <div className="absolute -bottom-6 -right-6 text-white/5 opacity-5 pointer-events-none transform rotate-12 scale-150">
            <MdMemory size={80} />
          </div>
        </motion.div>

        {/* Dynamic Stats Row (3 items now) */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.slice(0, 3).map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl hover:shadow-brick-500/10 transition-all cursor-default group relative overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">
                    {stat.label}
                  </p>
                  <h3 className="text-5xl font-black text-white leading-none tracking-tighter">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform duration-500 shadow-inner`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 text-white/5 opacity-10 pointer-events-none transform rotate-12 scale-150">
                {stat.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      {/* Issue Trend Area Chart (Full Width) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-3xl"
      >
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brick-500"></span>
          Reported Issues Trend
        </h4>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.charts.issueTrend || []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#ffffff40"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#ffffff40"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                }}
                itemStyle={{ fontWeight: 'black', color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#ef4444"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorCount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bus Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-3xl flex flex-col"
        >
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Bus Fleet Status
          </h4>
          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.charts.busStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  cornerRadius={8}
                >
                  {(data?.charts.busStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Roles Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-3xl flex flex-col"
        >
          <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            User Distribution
          </h4>
          <div className="h-[250px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.charts.userRoles || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff40"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#ffffff40"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {(data?.charts.userRoles || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live Activity Feed (Dynamic System Component) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0a0f25] backdrop-blur-3xl rounded-[3rem] border border-brick-500/10 p-10 shadow-3xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brick-500"></span>
              Live Activity
            </h4>
            <div className="p-2 bg-brick-500/10 rounded-lg text-brick-400">
              <MdList size={18} />
            </div>
          </div>
          <div className="flex-1 space-y-6 overflow-hidden">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="w-1 bg-brick-500/20 group-hover:bg-brick-500 rounded-full transition-colors h-10"></div>
                  <div>
                    <p className="text-[11px] font-bold text-white uppercase tracking-tight">
                      {activity.text}
                    </p>
                    <p className="text-[9px] text-gray-500 font-black uppercase mt-1">
                      {activity.time} • {activity.type}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <MdRefresh size={32} className="animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Listening for events...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Operational Control Center (Full Width) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-10 shadow-3xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brick-500"></span>
              Operational Control Center
            </h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              Direct management for recent system issues
            </p>
          </div>
          <a
            href="/dashboard/issues"
            className="text-[10px] font-black text-brick-400 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors group"
          >
            Manage All <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data?.recentReports?.length ? (
            data.recentReports.map((report: IRecentReport) => (
              <div
                key={report._id}
                className="flex flex-col p-6 bg-white/5 rounded-4xl border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                      report.priority === 'urgent'
                        ? 'text-red-400 border-red-400/20 bg-red-400/5'
                        : report.priority === 'high'
                          ? 'text-orange-400 border-orange-400/20 bg-orange-400/5'
                          : 'text-amber-400 border-amber-400/20 bg-amber-400/5'
                    }`}
                  >
                    {report.priority}
                  </div>
                  <div
                    className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                      report.status === 'resolved'
                        ? 'text-emerald-400 bg-emerald-400/10'
                        : report.status === 'in_progress'
                          ? 'text-blue-400 bg-blue-400/10'
                          : 'text-amber-400 bg-amber-400/10'
                    }`}
                  >
                    {report.status.replace('_', ' ')}
                  </div>
                </div>

                <h5 className="text-sm font-black text-white uppercase tracking-tight mb-2 truncate">
                  {report.title}
                </h5>
                <p className="text-[11px] text-gray-400 font-medium line-clamp-2 mb-6">
                  {report.description}
                </p>

                <div className="mt-auto flex items-center gap-3">
                  {report.status !== 'resolved' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(report._id, 'in_progress')}
                        className="flex-1 py-3 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-500/10 transition-all flex items-center justify-center gap-2"
                      >
                        <MdPlayArrow size={14} /> Track
                      </button>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/10 transition-all flex items-center justify-center gap-2"
                      >
                        <MdCheckCircle size={14} /> Resolve
                      </button>
                    </>
                  )}
                  {report.status === 'resolved' && (
                    <div className="w-full py-3 bg-white/5 text-emerald-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 italic">
                      <MdCheckCircle size={14} /> System Fixed
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="xl:col-span-3 text-center py-12 bg-white/5 rounded-4xl border border-white/5 border-dashed">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                No active operations pending
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Resolve Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedReport(null)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-md bg-[#070b1c] border border-white/10 rounded-[3rem] p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                <MdCheckCircle size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                Quick Resolve
              </h3>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                  Issue
                </p>
                <p className="text-sm text-white font-bold">{selectedReport.title}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <MdSubtitles /> Solution Details
                </label>
                <textarea
                  value={reportSolution}
                  onChange={(e) => setReportSolution(e.target.value)}
                  placeholder="How was this fixed?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium text-sm resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveReport}
                disabled={!reportSolution}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40"
              >
                Confirm Resolution
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MergedDashboard;
