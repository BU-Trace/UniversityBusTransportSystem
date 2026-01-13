"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

// React Icons
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
} from "react-icons/md";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle hydration and body scroll lock
  useEffect(() => {
    setMounted(true);

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const admin = {
    name: "Admin 1",
    role: "Admin",
  };

const menuItems = [
    { label: "Dashboard Overview", href: "/dashboard", icon: MdDashboard },
    { label: "Bus Management", href: "/dashboard/busManage", icon: MdDirectionsBus },
    { label: "Driver Management", href: "/dashboard/driverManage", icon: MdPeople },
    { label: "Route Management", href: "/dashboard/routeManage", icon: MdMap },
    { label: "Notice Publish", href: "/dashboard/notice", icon: MdNotifications },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative">
      {/* Mobile menu toggle */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#E31E24] text-white rounded-lg shadow-lg"
        >
          <MdMenu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen ||
          (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="
              fixed lg:sticky top-0 left-0 z-50
              bg-[#E31E24] text-white flex flex-col shadow-2xl
              w-full lg:w-72 h-screen overflow-hidden
            "
          >
            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-4 left-4 p-2 rounded-md bg-white/20"
            >
              <MdClose size={24} />
            </button>

            {/* Brand & profile */}
            <div className="p-6 flex flex-col items-center border-b border-white/10 mt-12 lg:mt-0">
              <h1 className="text-xl font-black mb-6 tracking-tight italic">
                CAMPUS<span className="text-white/70">CONNECT</span>
              </h1>

              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold italic opacity-50">
                    ADMIN
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-white text-[#E31E24] rounded-full shadow-md">
                  <MdEdit size={12} />
                </button>
              </div>

              <h2 className="font-bold text-base uppercase tracking-widest">
                {admin.name}
              </h2>
              <button className="text-[10px] opacity-70 underline mt-0.5 hover:opacity-100">
                Edit Profile
              </button>
            </div>

            {/* Navigation */}
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
                        ? "bg-white text-[#E31E24] shadow-md"
                        : "hover:bg-white/10 text-white/90"
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
              <button className="flex items-center gap-4 w-full px-4 py-3 hover:bg-white/10 rounded-xl font-bold transition-colors">
                <MdLogout size={20} />
                <span className="text-sm">Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
