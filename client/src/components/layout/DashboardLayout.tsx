'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MdDashboard,
  MdPeople,
  MdMap,
  MdNotifications,
  MdLogout,
  MdMenu,
  MdClose,
  MdEdit,
  MdSettings,
  MdDirectionsCar,
  MdPerson,
  MdReportProblem,
} from 'react-icons/md';
import NotificationBell from '../NotificationBell';
import { useUser } from '@/context/UserContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const { user: ctxUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

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

  const role = session?.user?.role || 'user';

  const menuItems = useMemo(() => {
    const adminItems = [
      { label: 'Overview', href: '/dashboard', icon: MdDashboard },
      { label: 'Schedule', href: '/dashboard/schedule', icon: MdMap },
      { label: 'Users', href: '/dashboard/userManage', icon: MdPeople },
      { label: 'Notices', href: '/dashboard/notice', icon: MdNotifications },
      { label: 'Issues', href: '/dashboard/issues', icon: MdReportProblem },
    ];

    const driverItems = [
      { label: 'My Duty', href: '/driver-dashboard', icon: MdDirectionsCar },
      { label: 'Profile', href: '/dashboard/editProfile', icon: MdPerson },
    ];

    const studentItems = [
      { label: 'Track Bus', href: '/user-dashboard', icon: MdMap },
      { label: 'Profile', href: '/dashboard/editProfile', icon: MdPerson },
    ];

    const normalizedRole = role?.toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'superadmin') return adminItems;
    if (role === 'driver') return driverItems;
    return studentItems;
  }, [role]);

  const displayName = ctxUser?.name || session?.user?.name || 'User';
  const profilePhoto =
    ctxUser?.profileImage ||
    session?.user?.image ||
    session?.user?.photoUrl ||
    session?.user?.profileImage ||
    '';

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-brick-900 font-sans relative overflow-hidden">
      {/* Mobile Menu Triggers (Hamburger Left, Close Right) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="hamburger"
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="lg:hidden fixed top-8 left-6 z-100 text-brick-600 rounded-2xl shadow-2xl border p-2.5 border-white/20 backdrop-blur-md"
          >
            <MdMenu size={24} />
          </motion.button>
        )}

        {isOpen && (
          <motion.button
            key="close"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed top-8 right-6 z-100 text-brick-600 rounded-2xl shadow-2xl border p-2.5 border-white/20 backdrop-blur-md"
          >
            <MdClose size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`
              fixed lg:sticky top-0 left-0 z-50
              bg-white/5 backdrop-blur-3xl text-white flex flex-col
              w-72 h-screen border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)]
              ${isOpen ? 'flex' : 'hidden lg:flex'}
            `}
          >
            {/* Sidebar Branding / Header */}
            <div className="p-4 lg:p-6 flex flex-col items-center border-b border-white/5 shrink-0">
              <Link href="/" className="flex items-center gap-3 mb-6 group">
                <div className="w-8 h-8 group-hover:rotate-6 transition-transform overflow-hidden flex items-center justify-center">
                  <Image
                    src="/static/logo.png"
                    alt="BU Trace Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-lg font-black tracking-tighter italic">
                  BU<span className="text-brick-400">TRACE</span>
                </h1>
              </Link>

              {/* Profile Section */}
              <div className="relative mb-3 flex flex-col items-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl border-2 border-white/20 bg-white/5 flex items-center justify-center shadow-2xl overflow-hidden group">
                  {profilePhoto ? (
                    <Image
                      src={profilePhoto}
                      alt={displayName}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-brick-500/20 to-brick-500/40 flex items-center justify-center">
                      <MdPerson className="text-brick-400 text-3xl opacity-80" />
                    </div>
                  )}
                </div>
                <Link
                  href="/dashboard/editProfile"
                  className="absolute -bottom-1 -right-1 p-1.5 bg-brick-500 text-white rounded-lg shadow-lg hover:scale-110 transition-transform border border-white/20"
                >
                  <MdEdit size={12} />
                </Link>
              </div>

              <div className="text-center w-full px-2">
                <h2 className="font-bold text-base uppercase tracking-widest text-white truncate w-full">
                  {displayName}
                </h2>
                <span className="text-[10px] font-black tracking-[0.2em] text-brick-400 uppercase bg-brick-500/10 px-2 py-0.5 rounded-full mt-1.5 inline-block border border-brick-500/20">
                  {role}
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 mt-4 px-3 space-y-1.5 overflow-y-auto custom-scrollbar min-h-0">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all group
                    ${
                      pathname === item.href
                        ? 'bg-brick-500 text-white shadow-xl shadow-brick-500/20 border border-brick-400/30'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }
                  `}
                >
                  <div className="relative">
                    <item.icon
                      size={22}
                      className={`transition-colors ${pathname === item.href ? 'text-white' : 'text-brick-500/70 group-hover:text-brick-400'}`}
                    />
                    {pathname === item.href && (
                      <motion.div
                        layoutId="sidebar-accent"
                        className="absolute -left-7 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      />
                    )}
                  </div>
                  <span className="text-sm tracking-wide">{item.label}</span>
                  {pathname === item.href && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 lg:p-4 border-t border-white/5 space-y-1 shrink-0">
              {role !== 'driver' && (
                <Link
                  href="/dashboard/editProfile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-400 hover:text-white transition-colors text-xs font-bold"
                >
                  <MdSettings size={16} className="text-gray-500" />
                  Settings
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 w-full px-4 py-2.5 bg-white/5 hover:bg-brick-600/20 text-brick-400 hover:text-brick-300 rounded-xl font-black transition-all border border-white/5 hover:border-brick-500/30 shadow-lg"
              >
                <MdLogout size={18} />
                <span className="text-xs tracking-wide">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-24 md:h-28 flex items-center justify-between px-4 lg:px-8 bg-white/5 backdrop-blur-2xl border-b border-white/10 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-14" /> {/* Space for mobile menu button */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-1.5 h-10 bg-brick-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300" />
              <div>
                <h2 className="text-lg md:text-2xl font-black text-white italic uppercase tracking-tighter">
                  {menuItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
                </h2>
                <p className="hidden sm:block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-1">
                  BU Trace - University Bus Transport System
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <NotificationBell />

            <div className="hidden md:flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="text-right">
                <p className="text-xs font-black text-white uppercase tracking-wide">
                  {displayName}
                </p>
                <p className="text-[10px] font-bold text-brick-400 uppercase tracking-widest">
                  {role}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shadow-2xl">
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-brick-500/10 flex items-center justify-center">
                    <MdPerson className="text-brick-400 text-2xl" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
