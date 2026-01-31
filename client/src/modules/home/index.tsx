'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bus, Users, MapPin, Clock, ArrowUpRight, Waves, RefreshCcw } from 'lucide-react';
import StatCard from './StatCard';
import { parseTime } from './utils';
import { RouteSchedule, schedules } from './data';

const HomePageComponent: React.FC = () => {
  const [nextBuses, setNextBuses] = useState<RouteSchedule[]>([]);

  const featureHighlights = [
    {
      title: 'Unified Campus Mobility',
      description: 'Live tracking, smart schedules and route visibility in one view.',
      icon: <Bus className="w-5 h-5 text-red-600" />,
    },
    {
      title: 'Role-Based Safety',
      description: 'Students, staff and drivers get the updates they need instantly.',
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
      title: 'Explore Routes',
      href: '/routes',
      description: 'Pickup points, destinations and coverage.',
      icon: <MapPin className="w-5 h-5 text-red-600" />,
    },
    {
      title: 'Check Schedules',
      href: '/schedules',
      description: 'Sunday/Thursday departure plans.',
      icon: <Clock className="w-5 h-5 text-red-600" />,
    },
    {
      title: 'Start Free Trial',
      href: '/start_trial',
      description: 'Test UBTS subscription options.',
      icon: <RefreshCcw className="w-5 h-5 text-red-600" />,
    },
    {
      title: 'Contact Operations',
      href: '/contact',
      description: 'Get support from the transport team.',
      icon: <Users className="w-5 h-5 text-red-600" />,
    },
  ];

  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const minutesNow = now.getHours() * 60 + now.getMinutes();

    const upcoming = schedules.map((s) => {
      const toTime = parseTime(s.toUniversity.split(' ').slice(0, 2).join(' '));
      const fromTime = parseTime(s.fromUniversity.split(' ').slice(0, 2).join(' '));
      const nextBus =
        day === 0 && minutesNow < toTime
          ? s.toUniversity
          : day === 4 && minutesNow < fromTime
            ? s.fromUniversity
            : 'No bus today';
      return { ...s, nextBus };
    });

    const timer = setTimeout(() => {
      setNextBuses(upcoming);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-linear-to-br from-blue-100 via-white to-blue-50 overflow-hidden ">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(246, 59, 59, 0.08)_0%,transparent_70%)] animate-[wave_8s_ease-in-out_infinite_alternate]" />
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative w-full h-[380px] md:h-[450px] lg:h-[500px] mt-16 order-1 lg:order-1 overflow-hidden shadow-xl rounded-b-0 md:rounded-b-[3rem]"
      >
        <Image
          src="/static/loginpagebanner.png"
          alt="Campus Banner"
          width={1600}
          height={700}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-red-900/20 flex flex-col items-center justify-center p-4 backdrop-blur-[2px]">
          <h3 className="text-5xl md:text-6xl font-extrabold text-white text-center uppercase tracking-wider drop-shadow-lg">
            Campus Connect
          </h3>
          <p className="mt-4 text-xl text-white font-medium italic flex items-center gap-2">
            <Waves className="w-6 h-6" /> Real-time Bus Tracking Simplified
          </p>
        </div>
      </motion.div>

      {}
      <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-20 py-12 -mt-16 relative z-10 flex flex-col">
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
            color="blue"
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
            color="green"
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
            color="red"
          />
          <StatCard
            title="Total Stops"
            value="13"
            icon={<MapPin className="w-5 h-5" />}
            footerText="Covering 6 Major Routes"
            color="indigo"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/80  backdrop-blur-xl shadow-2xl order-4 lg:order-3 rounded-3xl p-8 border border-red-50 mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold text-red-600 uppercase tracking-widest">
                Built for UBTS
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">
                Campus Transport at a Glance
              </h2>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Everything passengers, drivers and admins need to stay aligned: live visibility,
                accurate schedules and quick access to support.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-4 rounded-2xl border border-red-100 bg-red-50/60 hover:bg-white transition-colors duration-200 shadow-sm"
              >
                <div className="p-3 bg-white rounded-xl shadow-inner">{feature.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900">{feature.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid order-5 lg:order-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group rounded-2xl border border-red-100 bg-white/70 backdrop-blur-lg shadow-md p-5 flex items-center justify-between gap-4 hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 rounded-xl shadow-inner">{link.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900">{link.title}</p>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition" />
            </Link>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/70 mb-20 lg:mb-0  backdrop-blur-xl shadow-2xl rounded-3xl p-3 border-t-4 border-red-600 order-2 lg:order-4"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6 text-center border-b pb-3 flex justify-center items-center gap-2">
            <Clock className="w-6 h-6 text-red-600" /> Live Next Bus Reminder
          </h2>

          <div className="overflow-x-auto rounded-2xl scrollbar-hide">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-linear-to-r from-red-500 to-red-900 text-white text-center  lg:text-left text-sm lg:text-base uppercase tracking-wider">
                  <th className="py-4 px-2 rounded-tl-xl">Route Location</th>
                  <th className="py-4 px-2">Next Departure</th>
                  <th className="py-4 px-2 rounded-tr-xl">Status / Direction</th>
                </tr>
              </thead>
              <tbody>
                {nextBuses.map((bus, idx) => {
                  const isActive = bus.nextBus !== 'No bus today';
                  const direction = bus.nextBus?.includes('University')
                    ? 'To Varsity'
                    : 'From Varsity';

                  return (
                    <motion.tr
                      key={bus.route}
                      whileHover={{ scale: 1.02, backgroundColor: '#f0f9ff' }}
                      transition={{ duration: 0.3 }}
                      className={`${
                        idx % 2 === 0 ? 'bg-white/80' : 'bg-red-50/70'
                      } border-b border-gray-100 backdrop-blur-sm`}
                    >
                      <td className="py-4 px-2 font-semibold text-gray-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" /> {bus.route}
                      </td>
                      <td className="py-4 px-2 text-sm font-bold text-red-700">
                        {bus.nextBus?.split(' ')[0] || 'N/A'}
                        <span className="text-sm font-medium text-gray-500 ml-2">
                          {bus.nextBus?.split(' ').slice(1).join(' ') || ''}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        {isActive ? (
                          <span className="bg-green-100 text-green-700 text-sm font-semibold px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                            {direction}
                          </span>
                        ) : (
                          <span className="bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                            {bus.nextBus}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Timings are calculated for today,{' '}
            {new Date().toDateString()}.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePageComponent;
