import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Users, MapPin, Clock, ArrowUpRight, Megaphone } from 'lucide-react';
import StatCard from './StatCard';
import LiveBusSection from './LiveBusSection';
import { SchedulesSection } from '@/components/transport/SchedulesSection';
import { RoutesSection } from '@/components/transport/RoutesSection';
import { BusesSection } from '@/components/transport/BusesSection';
import { BottomNav } from '@/components/transport/BottomNav';
import LuxuryFlipClock from '@/components/common/LuxuryFlipClock';
import LocationDisplay from '@/components/common/LocationDisplay';

const HomePageComponent: React.FC = () => {
  const featureHighlights = [
    {
      title: 'Unified Campus Mobility',
      description: 'Live tracking, smart schedules and route visibility in one view.',
      icon: <Bus className="w-5 h-5 text-red-600" />,
    },
    {
      title: 'Role-Based Safety',
      description: 'Admins, drivers and coordinators get the updates they need instantly.',
      icon: <Users className="w-5 h-5 text-red-600" />,
    },
    {
      title: 'Timely Reminders',
      description: 'Stay ahead of departures with automated alerts and ETAs.',
      icon: <Clock className="w-5 h-5 text-red-600" />,
    },
  ];

  const quickLinks = [
    {
      title: 'Live Bus Tracker',
      description: 'View real-time bus locations.',
      icon: <Bus className="w-5 h-5 text-red-600" />,
      modal: {
        title: 'Live Bus Tracking',
        content:
          'Stay updated with our real-time GPS tracking system. You can see almost exactly where our buses are and their estimated arrival times at each stop.',
        cta: 'Open Tracker',
        href: '#tracker',
      },
    },
    {
      title: 'Check Schedules',
      description: 'Sunday/Thursday departure plans.',
      icon: <Clock className="w-5 h-5 text-red-600" />,
      modal: {
        title: 'Bus Schedules',
        content:
          'Our buses operate on a strict schedule from Sunday to Thursday. Morning trips start from 7:00 AM and evening return trips begin from 4:30 PM.',
        cta: 'View Timetable',
        href: '#schedules',
      },
    },
    {
      title: 'Explore Routes',
      description: 'Pickup points and destinations.',
      icon: <MapPin className="w-5 h-5 text-red-600" />,
      modal: {
        title: 'Route Coverage',
        content:
          'We cover all major areas of Barishal city, including Nathullabad, Sadar Road, and Ruppatoli. Check our interactive map for all stoppages.',
        cta: 'See All Routes',
        href: '#routes',
      },
    },
    {
      title: 'Official Notices',
      description: 'Latest campus transport updates.',
      icon: <Megaphone className="w-5 h-5 text-red-600" />,
      modal: {
        title: 'Notice Board',
        content:
          'Find the latest announcements regarding bus maintenance, route changes, or holiday schedules directly from the transport office.',
        cta: 'Read Notices',
        href: '#notices',
      },
    },
  ];

  const [activeQuickLink, setActiveQuickLink] = React.useState<(typeof quickLinks)[0] | null>(null);

  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-900 via-[#1a0505] to-gray-900 overflow-hidden pb-24">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(246, 59, 59, 0.05)_0%,transparent_70%)] animate-[wave_8s_ease-in-out_infinite_alternate]" />
      </div>

      {/* Hero Banner */}
      {/* Redesigned Hero: Luxury Timepiece & Location */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative w-full mt-16 z-10 flex flex-col items-center"
      >
        <LuxuryFlipClock />

        <div className="w-full px-4 md:px-12 lg:px-20 -mt-8">
          <LocationDisplay />
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-20 py-12 -mt-16 relative z-10 flex flex-col">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 order-3 lg:order-2 lg:grid-cols-4 gap-3 mb-16">
          <StatCard
            title="Total Trips Today"
            value="1,234"
            icon={<Bus className="w-5 h-5" />}
            footerText={
              <>
                <ArrowUpRight className="w-4 h-4 mr-1" /> +12% from Yesterday
              </>
            }
          />
          <StatCard
            title="Total Passengers"
            value="5,678"
            icon={<Users className="w-5 h-5" />}
            footerText={
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                Active Routes
              </span>
            }
          />
          <StatCard
            title="Active Buses"
            value="3/4"
            icon={<Bus className="w-5 h-5" />}
            footerText={
              <>
                <Clock className="w-4 h-4 mr-1" /> Last updated 2 min ago
              </>
            }
          />
          <StatCard
            title="Total Stops"
            value="13"
            icon={<MapPin className="w-5 h-5" />}
            footerText="Covering 6 Major Routes"
          />
        </div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl shadow-2xl order-4 lg:order-3 rounded-3xl p-8 border border-white/20 mb-12 shadow-white/5"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold text-brick-500 uppercase tracking-widest">
                Built for BU Trace
              </p>
              <h2 className="text-3xl font-bold text-white mt-1">Campus Transport at a Glance</h2>
              <p className="text-gray-400 mt-2 max-w-2xl">
                Everything passengers, drivers and admins need to stay aligned: live visibility,
                accurate schedules and quick access to support.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-4 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/15 transition-colors duration-200 shadow-sm group shadow-white/5 cursor-pointer"
              >
                <div className="p-3 bg-white/5 rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                  {React.cloneElement(feature.icon as React.ReactElement<{ className?: string }>, {
                    className: 'w-5 h-5 text-brick-500',
                  })}
                </div>
                <div>
                  <p className="font-semibold text-white">{feature.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid order-5 lg:order-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {quickLinks.map((link) => (
            <div
              key={link.title}
              onClick={() => setActiveQuickLink(link)}
              className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-5 flex items-center justify-between gap-4 hover:-translate-y-1 hover:bg-white/15 transition-all duration-300 shadow-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-xl shadow-inner group-hover:scale-110 transition-transform">
                  {React.cloneElement(link.icon as React.ReactElement<{ className?: string }>, {
                    className: 'w-5 h-5 text-brick-500',
                  })}
                </div>
                <div>
                  <p className="font-semibold text-white">{link.title}</p>
                  <p className="text-xs text-gray-400">{link.description}</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-brick-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          ))}
        </motion.div>

        {/* LiveBusSection */}
        <div className="order-2 lg:order-5 mb-16">
          <LiveBusSection />
        </div>

        {/* Transport Info Sections */}
        <div className="max-w-7xl mx-auto w-full">
          {/* Section 1: Schedules (Time) */}
          <SchedulesSection />

          {/* Divider */}
          <div className="h-px bg-white/10 w-full my-12 hidden md:block"></div>

          {/* Section 2: Routes */}
          <RoutesSection />

          {/* Divider */}
          <div className="h-px bg-white/10 w-full my-12 hidden md:block"></div>

          {/* Section 3: Buses Fleet */}
          <BusesSection />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Quick Link Detail Modal */}
      <AnimatePresence>
        {activeQuickLink && (
          <div className="fixed inset-0 z-2000 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveQuickLink(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-[2.5rem] shadow-3xl overflow-hidden p-10"
            >
              <div className="w-16 h-16 bg-brick-500/10 rounded-3xl flex items-center justify-center text-brick-500 mb-8 border border-brick-500/20">
                {activeQuickLink.icon}
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                {activeQuickLink.modal.title}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-10 font-medium">
                {activeQuickLink.modal.content}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveQuickLink(null)}
                  className="px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <a
                  href={activeQuickLink.modal.href}
                  onClick={() => setActiveQuickLink(null)}
                  className="flex-1 bg-brick-500 text-white px-8 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-brick-600 transition-all shadow-xl shadow-brick-500/20 text-center flex items-center justify-center gap-2 border border-white/10"
                >
                  {activeQuickLink.modal.cta} <ArrowUpRight size={18} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePageComponent;
