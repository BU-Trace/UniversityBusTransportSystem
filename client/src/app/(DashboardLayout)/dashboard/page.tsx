"use client";

import React from 'react';
import { motion } from 'framer-motion';

import { 
  MdDirectionsBus, 
  MdPeople, 
  MdWarning, 
  MdBarChart 
} from 'react-icons/md';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Buses', value: '50', icon: <MdDirectionsBus size={32}/>, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Active Buses', value: '50', icon: <MdDirectionsBus size={32}/>, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total Drivers', value: '50', icon: <MdPeople size={32}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Drivers', value: '50', icon: <MdPeople size={32}/>, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Dashboard Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-2"
      >
        <div className="p-2 bg-red-600 rounded-lg text-white">
          <MdBarChart size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Real-time university bus management statistics
          </p>
        </div>
      </motion.div>

      {/* 2. Responsive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-md border border-white p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all cursor-default group relative overflow-hidden"
          >
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  {stat.label}
                </p>
                <h3 className="text-4xl font-black text-gray-900 leading-none">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="absolute -bottom-2 -right-2 text-gray-100 opacity-20 pointer-events-none">
                {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Warning/Notification Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] p-10 border border-red-100 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-2 h-full bg-[#E31E24]"></div>
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 text-red-600 font-black uppercase tracking-[0.3em] text-xs">
            <MdWarning size={20} /> warning
          </div>
          {/* FIX APPLIED BELOW: Using &quot; instead of " */}
          <p className="text-xl md:text-2xl font-bold text-blue-700 tracking-tight max-w-2xl">
              &quot;Bus 1 cancelled the trip due to accident&quot;
          </p>
          <div className="h-1 w-20 bg-gray-100 rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
}