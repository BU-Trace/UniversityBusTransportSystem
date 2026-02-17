import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Bus, Users, AlertCircle, RefreshCw, Activity, ShieldCheck } from 'lucide-react-native';
import { api } from '../../lib/axios';
import { io, Socket } from 'socket.io-client';

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected'>('disconnected');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const socket: Socket = io('http://localhost:5000'); // Use actual IP in production
    socket.on('connect', () => setSocketStatus('connected'));
    socket.on('disconnect', () => setSocketStatus('disconnected'));
    socket.on('receiveBusStatus', () => fetchStats());

    return () => {
      socket.disconnect();
    };
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, []);

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: 'Total Buses',
        value: data.overview.totalBuses,
        icon: Bus,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        label: 'Active Buses',
        value: data.overview.activeBuses,
        icon: Activity,
        color: 'text-green-600',
        bg: 'bg-green-50',
      },
      {
        label: 'Drivers',
        value: data.overview.totalDrivers,
        icon: Users,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      },
      {
        label: 'Issues',
        value: data.recentReports?.length || 0,
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
      },
    ];
  }, [data]);

  if (loading && !data) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#9b111e" />
        <Text className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-xs">
          Syncing Data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9b111e" />
      }
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-3xl font-black text-gray-900 tracking-tight">OVERVIEW</Text>
          <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            System Monitoring
          </Text>
        </View>
        <TouchableOpacity
          onPress={fetchStats}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <RefreshCw size={20} color="#9b111e" />
        </TouchableOpacity>
      </View>

      {/* System Health */}
      <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            System Health
          </Text>
          <View
            className={`flex-row items-center px-3 py-1 rounded-full ${socketStatus === 'connected' ? 'bg-green-50' : 'bg-red-50'}`}
          >
            <View
              className={`w-2 h-2 rounded-full mr-2 ${socketStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <Text
              className={`text-[10px] font-black uppercase ${socketStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}
            >
              {socketStatus}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center">
          <ShieldCheck size={24} color={socketStatus === 'connected' ? '#10b981' : '#ef4444'} />
          <Text className="text-gray-700 font-bold ml-3 text-sm">
            Real-time synchronization active
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-row flex-wrap justify-between">
        {stats.map((stat, i) => (
          <View
            key={i}
            className="w-[47%] bg-white p-6 rounded-[32px] border border-gray-100 mb-6 shadow-sm"
          >
            <View className={`p-3 rounded-2xl self-start mb-4 ${stat.bg}`}>
              <stat.icon
                size={20}
                color={stat.color.replace('text-', '').replace('-600', '')}
                className={stat.color}
              />
            </View>
            <Text className="text-3xl font-black text-gray-900 mb-1">{stat.value}</Text>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Recent Issues Preview */}
      <View className="mt-4">
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">
          Recent Operational Issues
        </Text>
        {data?.recentReports?.length ? (
          data.recentReports.slice(0, 3).map((report: any) => (
            <View
              key={report._id}
              className="bg-white p-5 rounded-3xl border border-gray-100 mb-4 shadow-sm flex-row items-center"
            >
              <View className="bg-red-50 p-3 rounded-2xl mr-4">
                <AlertCircle size={20} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                  {report.title}
                </Text>
                <Text className="text-[10px] text-gray-500 font-medium mt-1">
                  {report.priority.toUpperCase()} •{' '}
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white p-10 rounded-[32px] border border-gray-100 items-center border-dashed">
            <Text className="text-gray-400 text-[10px] font-black uppercase">No active issues</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AdminDashboard;
