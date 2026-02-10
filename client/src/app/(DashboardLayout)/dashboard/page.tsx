/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Home } from 'lucide-react';
import Link from 'next/link';

import {
  MdDashboard,
  MdDirectionsBus,
  MdPeople,
  MdMap,
  MdNotifications,
  MdLogout,
  MdMenu,
  MdClose,
  MdEdit,
  MdWarning,
  MdBarChart,
} from 'react-icons/md';

function getInitial(name?: string) {
  const n = (name || '').trim();
  return n ? n[0].toUpperCase() : 'U';
}

function getDisplayName(session: any) {
  return session?.user?.name || session?.user?.fullName || session?.user?.username || 'User';
}

function getProfilePhoto(session: any) {
  return session?.user?.photoUrl || session?.user?.profileImage || session?.user?.image || '';
}

export default function MergedDashboard() {
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const displayName = getDisplayName(session);
  const profilePhoto = getProfilePhoto(session);
  const initial = getInitial(displayName);

  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const menuItems = [
    { label: 'Dashboard Overview', href: '/dashboard', icon: MdDashboard },
    { label: 'Bus Management', href: '/dashboard/busManage', icon: MdDirectionsBus },
    { label: 'User Management', href: '/dashboard/userManage', icon: MdPeople },
    { label: 'Route Management', href: '/dashboard/routeManage', icon: MdMap },
    { label: 'Notice Publish', href: '/dashboard/notice', icon: MdNotifications },
  ];

  const stats = [
    {
      label: 'Total Buses',
      value: '50',
      icon: <MdDirectionsBus size={32} />,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Active Buses',
      value: '50',
      icon: <MdDirectionsBus size={32} />,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: 'Total Drivers',
      value: '50',
      icon: <MdPeople size={32} />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Drivers',
      value: '50',
      icon: <MdPeople size={32} />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative">
      {/*Mobile Menu*/}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#E31E24] text-white rounded-lg shadow-lg"
        >
          <MdMenu size={24} />
        </button>
      )}

      {/*Sidebar*/}
      <AnimatePresence>
        {(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="
              fixed lg:sticky top-0 left-0 z-50
              bg-[#E31E24] text-white flex flex-col shadow-2xl
              w-full lg:w-72 h-screen overflow-hidden
            "
          >
            {/*closeButton*/}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-4 left-4 p-2 rounded-md bg-white/20"
            >
              <MdClose size={24} />
            </button>

            {/*Brand*/}
            <div className="p-6 flex flex-col items-center border-b border-white/10 mt-12 lg:mt-0">
              <h1 className="text-xl font-black mb-6 tracking-tight italic">
                CAMPUS<span className="text-white/70">CONNECT</span>
              </h1>

              {/*Avatar*/}
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center shadow-lg overflow-hidden">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black italic text-white/80">{initial}</span>
                  )}
                </div>

                <Link
                  href="/dashboard/editProfile"
                  title="Edit Profile"
                  className="absolute bottom-0 right-0 p-1.5 bg-white text-[#E31E24] rounded-full shadow-md hover:scale-105 transition-transform"
                  onClick={() => setIsOpen(false)}
                >
                  <MdEdit size={12} />
                </Link>
              </div>

              {}
              <h2 className="font-bold text-base uppercase tracking-widest truncate max-w-[220px] text-center">
                {displayName}
              </h2>

              {}
              <Link
                href="/dashboard/editProfile"
                onClick={() => setIsOpen(false)}
                className="text-[10px] opacity-70 underline mt-0.5 hover:opacity-100"
              >
                Edit Profile
              </Link>
            </div>

            {/*Nav*/}
            <nav className="flex-1 mt-4 px-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all
                    ${
                      pathname === item.href
                        ? 'bg-white text-[#E31E24] shadow-md'
                        : 'hover:bg-white/10 text-white/90'
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-6 border-t border-white/10 mb-4 lg:mb-0">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-4 w-full px-18.5 py-3 hover:bg-white/10 rounded-xl font-bold transition-colors"
              >
                <MdLogout size={20} />
                <span className="text-sm">Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full">
          <div className="space-y-8">
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
                    <div
                      className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform duration-300`}
                    >
                      {stat.icon}
                    </div>
                  </div>

                  <div className="absolute -bottom-2 -right-2 text-gray-100 opacity-20 pointer-events-none">
                    {stat.icon}
                  </div>
                </motion.div>
              ))}
            </div>

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

                <p className="text-xl md:text-2xl font-bold text-blue-700 tracking-tight max-w-2xl">
                  &quot;Bus 1 cancelled the trip due to accident&quot;
                </p>
                <div className="h-1 w-20 bg-gray-100 rounded-full"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/*home btn*/}
      <Link
        href="/"
        title="Go to Home"
        className="fixed top-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 z-50"
      >
        <Home size={24} />
      </Link>
    </div>
  );
}
