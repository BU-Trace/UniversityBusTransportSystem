import { Bus } from '../Bus/bus.model';
import User from '../User/user.model';
import { Issue } from '../Issue/issue.model';

const getDashboardStats = async () => {
  const [
    totalBuses,
    activeBuses,
    totalDrivers,
    activeDrivers,
    latestIssue,
    busStatusCounts,
    userRoleCounts,
    monthlyIssues,
  ] = await Promise.all([
    Bus.countDocuments(),
    Bus.countDocuments({ status: 'running' }),
    User.countDocuments({ role: 'driver' }),
    User.countDocuments({ role: 'driver', isActive: true }),
    Issue.findOne().sort({ createdAt: -1 }).populate('relatedBus'),
    Bus.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Issue.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Issue.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  // Format chart data for Recharts
  const busStatusData = busStatusCounts.map((item: { _id: string; count: number }) => ({
    name: item._id || 'unknown',
    value: item.count,
  }));

  const userRoleData = userRoleCounts.map((item: { _id: string; count: number }) => ({
    name: item._id,
    value: item.count,
  }));

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const issueTrendData = monthlyIssues.map((item: { _id: number; count: number }) => ({
    name: monthNames[item._id - 1],
    count: item.count,
  }));

  return {
    overview: {
      totalBuses,
      activeBuses,
      totalDrivers,
      activeDrivers,
    },
    latestAlert: latestIssue
      ? {
          title: latestIssue.title,
          description: latestIssue.description,
          priority: latestIssue.priority,
          createdAt: latestIssue.createdAt,
        }
      : null,
    charts: {
      busStatus: busStatusData,
      userRoles: userRoleData,
      issueTrend: issueTrendData,
    },
    recentReports: (monthlyIssues as any)[1] ? (monthlyIssues as any)[1] : [], // Fixing the destructuring mismatch
  };
};

export const DashboardServices = {
  getDashboardStats,
};
