'use client';

import React from 'react';
import {
  LayoutDashboard,
  Bus,
  MapPin,
  Calendar,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-gradient-to-b from-red-800 to-maroon-900 text-white flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 text-2xl font-bold tracking-wide border-b border-white/20">
          UBTS Admin
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <SidebarItem icon={<Bus size={20} />} label="Buses" />
          <SidebarItem icon={<MapPin size={20} />} label="Routes" />
          <SidebarItem icon={<Calendar size={20} />} label="Schedules" />
          <SidebarItem icon={<Users size={20} />} label="Users" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-white/20">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">At a Glance</h1>
          <p className="text-gray-500">University Bus Transport Overview</p>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Trips Today"
            value="1,234"
            badge="+12%"
            badgeColor="bg-blue-100 text-blue-700"
          />

          <StatCard
            title="Passengers Today"
            value="5,678"
            badge="Active"
            badgeColor="bg-green-100 text-green-700"
          />

          <StatCard
            title="Active Buses"
            value="3/4"
            badge="Online"
            badgeColor="bg-green-100 text-green-700"
          />

          <StatCard
            title="Total Stops"
            value="13"
            badge="3 Routes"
            badgeColor="bg-red-100 text-red-700"
          />
        </div>

        {/* ================= PLACEHOLDER SECTIONS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h3>
            <p className="text-gray-500 text-sm">
              Latest bus movements, route updates and admin actions will appear here.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">System Status</h3>
            <p className="text-gray-500 text-sm">
              Real-time health of tracking, schedules and user services.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;

/* ================= COMPONENTS ================= */

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active }) => {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition
        ${
          active
            ? 'bg-white/20 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  badge: string;
  badgeColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, badge, badgeColor }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between">
      <div>
        <p className="text-gray-500 text-sm mb-2">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
      </div>
      <span
        className={`mt-4 w-fit px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}
      >
        {badge}
      </span>
    </div>
  );
};
