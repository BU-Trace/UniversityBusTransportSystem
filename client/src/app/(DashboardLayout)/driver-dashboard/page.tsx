"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { Home } from 'lucide-react';
import Link from "next/link";

import {
  MdLogout,
  MdMenu,
  MdClose,
  MdEdit,
  MdLocationOn,
  MdDirectionsBus,
  MdPhone,
  MdBadge,
} from "react-icons/md";

export default function DriverDashboard() {
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [driverName, setDriverName] = useState(session?.user?.name || "John Doe");
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  
  const [formName, setFormName] = useState(driverName);
  const [formStatus, setFormStatus] = useState(false);
  const [formRoute, setFormRoute] = useState("");

  const destinations = [
    "University",
    "Notun Bazar",
    "Barishal Club",
    "Nothullabad",
  ];

  const driverInfo = {
    name: driverName,
    role: "Driver",
    busNumber: "81",
    registration: "UK07PA7498",
    contact: "9917360253",
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen || isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen, isModalOpen]);

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDriverName(formName);
    setActiveRoute(formRoute);
    setIsModalOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative">
      
      {}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[50] p-2 bg-[#E31E24] text-white rounded-lg shadow-lg"
        >
          <MdMenu size={24} />
        </button>
      )}

      {}
      <AnimatePresence>
        {(isOpen ||
          (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="
              fixed lg:sticky top-0 left-0 z-[60]
              bg-[#E31E24] text-white flex flex-col shadow-2xl
              w-full lg:w-80 h-screen overflow-y-auto scrollbar-hide
            "
          >
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden absolute top-4 left-4 p-2 rounded-md bg-white/20"
            >
              <MdClose size={24} />
            </button>

            {}
            <div className="p-6 flex flex-col items-center border-b border-white/10 mt-12 lg:mt-0">
              <h1 className="text-xl font-black mb-6 tracking-tight italic">
                CAMPUS<span className="text-white/70">CONNECT</span>
              </h1>

              <div className="relative mb-3">
                <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/10 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold italic opacity-50">
                    {driverInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white text-[#E31E24] rounded-full shadow-md">
                  <MdEdit size={14} />
                </button>
              </div>

              <h2 className="font-bold text-lg uppercase tracking-widest mt-2">
                {driverInfo.name}
              </h2>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mt-2 uppercase tracking-wide">
                {driverInfo.role}
              </span>
            </div>

            {}
            <div className="flex-1 px-6 py-6 space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/10 pb-2">
                  Vehicle Details
                </p>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg"><MdDirectionsBus size={20} /></div>
                  <div><p className="text-xs opacity-70">Bus Number</p><p className="font-bold text-lg">{driverInfo.busNumber}</p></div>
                </div>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg"><MdBadge size={20} /></div>
                  <div><p className="text-xs opacity-70">Registration</p><p className="font-bold tracking-wider">{driverInfo.registration}</p></div>
                </div>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="p-2 bg-white/10 rounded-lg"><MdPhone size={20} /></div>
                  <div><p className="text-xs opacity-70">Contact</p><p className="font-bold">{driverInfo.contact}</p></div>
                </div>
              </div>
            </div>

            {}
            <div className="p-6 border-t border-white/10 mb-4 lg:mb-0">
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-4 w-full px-19 py-3 hover:bg-white/10 rounded-xl font-bold transition-colors"
              >
                <MdLogout size={20} />
                <span className="text-sm">Log Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 w-full max-w-6xl mx-auto space-y-8">
          
          {}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
          >
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                Trip Control
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                Manage your current route and status
              </p>
            </div>
            
            {}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#E31E24] text-white px-6 py-3 rounded-xl shadow-lg font-bold hover:bg-red-700 transition-all flex items-center gap-2 transform active:scale-95"
            >
              <MdEdit size={20} />
              Update Status
            </button>
          </motion.div>

          {}
          <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MdLocationOn className="text-[#E31E24]" />
              Selected Destination
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map((dest) => (
                <div
                  key={dest}
                  className={`
                    p-4 rounded-xl font-bold text-sm transition-all border-2 text-center cursor-default
                    ${
                      activeRoute === dest
                        ? "border-green-500 bg-green-500 text-white shadow-md transform scale-105"
                        : "border-gray-100 bg-gray-50 text-gray-400 opacity-60"
                    }
                  `}
                >
                  {dest}
                </div>
              ))}
            </div>
          </section>

          {/*Map*/}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 h-96 overflow-hidden relative group"
            >
              <iframe
                title="Bus Location"
                src="https://maps.google.com/maps?q=Barishal,Bangladesh&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '1.5rem' }}
                loading="lazy"
                allowFullScreen
                className="grayscale group-hover:grayscale-0 transition-all duration-500"
              ></iframe>
              <div className="absolute top-6 left-90 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold shadow-sm pointer-events-none">
                📍 Live Location
              </div>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Bus Documents</h2>
                <div className={`w-3 h-3 rounded-full ${true ? 'bg-green-500' : 'bg-red-500'} ring-4 ring-green-100`}></div>
              </div>

              <div className="flex-1 bg-blue-50 rounded-2xl flex items-center justify-center p-6 border-2 border-dashed border-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                <div className="relative w-full h-full min-h-[200px]">
                  <Image
                    src="/f1.png"
                    alt="Bus Document"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Link
        href="/"
        title="Go to Home"
        className="fixed top-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 z-40"
      >
        <Home size={24} />
      </Link>

      {/*statusBar*/}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-red-600/90 backdrop-blur-xl text-white p-8 rounded-3xl shadow-2xl w-full max-w-[400px] flex flex-col border border-white/20 relative"
            >
                {}
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/40 transition"
                >
                    <MdClose size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">Update Status</h2>

                {}
                <div className="flex justify-between items-center mb-6 bg-black/20 p-4 rounded-xl">
                    <label className="text-sm font-semibold uppercase tracking-wider">Active Status</label>
                    <div
                        onClick={() => setFormStatus(!formStatus)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                            formStatus ? 'bg-green-400' : 'bg-pink-300'
                        }`}
                    >
                        <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                formStatus ? 'translate-x-6' : ''
                            }`}
                        ></div>
                    </div>
                </div>

                {}
                <form onSubmit={handleModalSubmit} className="flex flex-col space-y-5">
                    {}
                    <div>
                        <label className="text-xs ml-2 opacity-80 mb-1 block">Driver Name</label>
                        <input
                            type="text"
                            placeholder="Name"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-gray-800 bg-white/90 focus:outline-none focus:ring-4 focus:ring-red-300 font-semibold"
                        />
                    </div>

                    {}
                    <div>
                        <label className="text-xs ml-2 opacity-80 mb-1 block">Select Route</label>
                        <select
                            value={formRoute}
                            onChange={(e) => setFormRoute(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-gray-800 bg-white/90 focus:outline-none focus:ring-4 focus:ring-red-300 font-semibold appearance-none"
                        >
                            <option value="">-- Choose Destination --</option>
                            {destinations.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>

                    {}
                    <button
                        type="submit"
                        className="mt-4 bg-white text-red-600 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition transform active:scale-95"
                    >
                        Save Updates
                    </button>
                </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}