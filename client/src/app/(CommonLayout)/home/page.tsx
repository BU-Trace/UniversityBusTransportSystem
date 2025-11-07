'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bus, Users, MapPin, Clock, ArrowUpRight, Waves, RefreshCcw } from 'lucide-react';

interface RouteSchedule {
  route: string;
  toUniversity: string;
  fromUniversity: string;
  nextBus?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  footerText: React.ReactNode;
  color: string;
}

const schedules: RouteSchedule[] = [
  {
    route: 'Ichladi Toll Plaza',
    toUniversity: '8:00 AM (Sunday)',
    fromUniversity: '5:30 PM (Thursday)',
  },
  {
    route: 'Jhalokathi Sadar',
    toUniversity: '8:00 AM (Sunday)',
    fromUniversity: '5:30 PM (Thursday)',
  },
  { route: 'Nothullabad', toUniversity: '7:00 AM (Sunday)', fromUniversity: '4:00 PM (Thursday)' },
  { route: 'Notun Bazar', toUniversity: '7:30 AM (Sunday)', fromUniversity: '4:30 PM (Thursday)' },
  {
    route: 'Barishal Club',
    toUniversity: '7:45 AM (Sunday)',
    fromUniversity: '4:30 PM (Thursday)',
  },
  {
    route: 'Barishal Cantonment',
    toUniversity: '8:00 AM (Sunday)',
    fromUniversity: '5:30 PM (Thursday)',
  },
];

const parseTime = (timeStr: string) => {
  const [time, meridian] = timeStr.split(' ');
  const [hour, minute] = time.split(':').map(Number);
  let h = hour;
  if (meridian === 'PM' && hour !== 12) h += 12;
  if (meridian === 'AM' && hour === 12) h = 0;
  return h * 60 + (minute || 0);
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, footerText, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className={`relative bg-white/30 backdrop-blur-xl shadow-lg rounded-2xl p-6 border border-${color}-300 overflow-hidden`}
  >
    {}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-pulse opacity-60 pointer-events-none"></div>
    <div className="flex items-center justify-between relative z-10">
      <p className="text-gray-600 font-semibold text-sm uppercase">{title}</p>
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600 shadow-inner`}>
        {icon}
      </div>
    </div>
    <h2 className="text-4xl font-extrabold text-gray-900 mt-2 relative z-10">{value}</h2>
    <div className={`font-medium text-sm mt-4 flex items-center text-${color}-600 relative z-10`}>
      {footerText}
    </div>
  </motion.div>
);

const HomePage: React.FC = () => {
  const [nextBuses, setNextBuses] = useState<RouteSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  console.log(isLoading);

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
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 overflow-hidden">
      {}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(246, 59, 59, 0.08)_0%,transparent_70%)] animate-[wave_8s_ease-in-out_infinite_alternate]" />
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative w-full h-[380px] md:h-[450px] lg:h-[500px] mt-16 overflow-hidden shadow-xl rounded-b-[3rem]"
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
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-12 -mt-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard
            title="Total Trips Today"
            value="1,234"
            icon={<Bus className="w-6 h-6" />}
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
            icon={<Users className="w-6 h-6" />}
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
            icon={<Bus className="w-6 h-6" />}
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
            icon={<MapPin className="w-6 h-6" />}
            footerText="Covering 6 Major Routes"
            color="indigo"
          />
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border-t-4 border-red-600"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center border-b pb-3 flex justify-center items-center gap-2">
            <Clock className="w-6 h-6 text-red-600" /> Live Next Bus Reminder
          </h2>

          <div className="overflow-x-auto rounded-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-red-500 to-red-900 text-white text-left text-base uppercase tracking-wider">
                  <th className="py-4 px-6 rounded-tl-xl">Route Location</th>
                  <th className="py-4 px-6">Next Departure</th>
                  <th className="py-4 px-6 rounded-tr-xl">Status / Direction</th>
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
                      <td className="py-4 px-6 font-semibold text-gray-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" /> {bus.route}
                      </td>
                      <td className="py-4 px-6 text-lg font-bold text-red-700">
                        {bus.nextBus?.split(' ')[0] || 'N/A'}
                        <span className="text-sm font-medium text-gray-500 ml-2">
                          {bus.nextBus?.split(' ').slice(1).join(' ') || ''}
                        </span>
                      </td>
                      <td className="py-4 px-6">
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

export default HomePage;
