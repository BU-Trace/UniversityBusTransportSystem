'use client';

import Image from 'next/image';
import { MapPin, Bus } from 'lucide-react';
import { motion } from 'framer-motion';

const routes = [
  {
    name: 'Ichladi Toll Plaza ➜ University of Barishal',
    description:
      'The bus starts from Ichladi Toll Plaza, travels along N8 through Rupatali, and reaches the University of Barishal. This route serves students from Ichladi, Rupatali, and nearby areas.',
    schedule: {
      toUniversity: '8:00 AM (Sunday)',
      fromUniversity: '5:30 PM (Thursday)',
    },
    busType: 'BRTC (Single Deck)',
    map: '/static/ichladi_route.jpg',
  },
  {
    name: 'Jhalokathi Sadar ➜ University of Barishal',
    description:
      'Starting from Jhalokathi Sadar, the bus travels via N8 highway crossing Gabkhan Bridge and Rupatali before reaching the University. Ideal for students from Jhalokathi region.',
    schedule: {
      toUniversity: '8:00 AM (Sunday)',
      fromUniversity: '5:30 PM (Thursday)',
    },
    busType: 'BRTC (Single Deck)',
    map: '/static/jhalokathi_route.jpg',
  },
  {
    name: 'Nothullabad ➜ University of Barishal',
    description:
      'Departs from Nothullabad Bus Terminal and follows the N8 highway, passing Rupatali and reaching the University campus. One of the most common and fastest routes.',
    schedule: {
      toUniversity: '7:00 AM (Sunday)',
      fromUniversity: '4:00 PM (Thursday)',
    },
    busType: 'BRTC (Single Deck)',
    map: '/static/nothullabad_route.jpg',
  },
  {
    name: 'Notun Bazar ➜ University of Barishal',
    description:
      'Begins from Bogura Road Police Station moves through Munshi Garaj, Forester Bari, Choumatha and Rupatali before arriving at the University. This route covers Northan Barishal city areas.',
    schedule: {
      toUniversity: '7:30 AM (Sunday)',
      fromUniversity: '4:30 PM (Thursday)',
    },
    busType: 'BRTC (Single Deck)',
    map: '/static/notun_route.jpg',
  },
  {
    name: 'Barishal Club ➜ University of Barishal',
    description:
      'Originates near Barishal Club and passes Bogra Road, Sadar Road, South Alekanda, and Rupatali before reaching the University campus.',
    schedule: {
      toUniversity: '7:45 AM (Sunday)',
      fromUniversity: '4:30 PM (Thursday)',
    },
    busType: 'BRTC (Single Deck)',
    map: '/static/barishalclub_route.jpg',
  },
  {
    name: 'Barishal Cantonment ➜ University of Barishal',
    description:
      'Starts from contonmant area and travels along Payra bridge Toll Plaza road, PSTU connecting to the main N8 highway toward the University. Serves students from outer Barishal areas.',
    schedule: {
      toUniversity: '8:00 AM (Sunday)',
      fromUniversity: '5:30 PM (Thursday)',
    },
    busType: 'BRTC (Single Deck)',
    map: '/static/PSTU_route.jpg',
  },
];

export default function RoutePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-12 px-6 flex flex-col items-center overflow-hidden">
      {}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <style jsx global>{`
          @keyframes waterFlow {
            0% {
              transform: translateX(0) translateY(0) rotate(0deg);
            }
            50% {
              transform: translateX(-50px) translateY(25px) rotate(1deg);
            }
            100% {
              transform: translateX(0) translateY(0) rotate(0deg);
            }
          }
          .wave-layer {
            background: radial-gradient(
              circle at center,
              rgba(255, 0, 0, 0.15) 0%,
              transparent 70%
            );
            animation: waterFlow 8s ease-in-out infinite alternate;
            filter: blur(80px);
          }
          .wave-layer-2 {
            background: radial-gradient(
              circle at 70% 30%,
              rgba(255, 150, 150, 0.2) 0%,
              transparent 70%
            );
            animation: waterFlow 10s ease-in-out infinite alternate-reverse;
            filter: blur(120px);
          }
        `}</style>

        <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] wave-layer opacity-70"></div>
        <div className="absolute w-[200%] h-[200%] top-[-40%] left-[-60%] wave-layer-2 opacity-70"></div>
      </div>

      {}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-7xl w-full text-center"
      >
        <br />
        <br />
        <h1 className="text-5xl md:text-6xl font-extrabold text-red-700 mb-4 tracking-tight drop-shadow-lg">
          University Bus Routes
        </h1>
        <p className="text-gray-700 text-lg mb-12 max-w-3xl mx-auto leading-relaxed">
          Explore all UBTS bus routes operating between different city locations and the University
          of Barishal. Each route includes departure points, major stops, timing schedules, and
          corresponding bus types for your convenience.
        </p>
      </motion.div>

      {}
      <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl relative z-10">
        {routes.map((route, index) => (
          <motion.div
            key={route.name}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={{
              y: -10,
              scale: 1.04,
              rotate: [0, -1, 1, 0],
              transition: { duration: 0.6 },
            }}
            transition={{
              duration: 0.7,
              delay: index * 0.1,
              ease: 'easeInOut',
            }}
            viewport={{ once: true }}
            className="bg-white/60 backdrop-blur-lg border border-red-200 rounded-3xl shadow-xl hover:shadow-red-300/50 p-6 flex flex-col transform-gpu"
          >
            <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-5 border border-gray-100 shadow-inner">
              <Image
                src={route.map}
                alt={route.name}
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-3">
              <MapPin className="text-red-700" size={24} />
              {route.name}
            </h2>

            <p className="text-gray-700 text-base mb-5 leading-relaxed flex-grow">
              {route.description}
            </p>

            <div className="mt-auto bg-gradient-to-r from-red-50/70 to-white/60 rounded-xl p-5 border border-red-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-red-800 font-semibold text-lg">
                <Bus className="text-red-700" size={20} />
                {route.busType}
              </div>
              <div className="text-base text-gray-700 space-y-1">
                <p>
                  <strong>To University:</strong>{' '}
                  <span className="font-medium text-red-700">{route.schedule.toUniversity}</span>
                </p>
                <p>
                  <strong>From University:</strong>{' '}
                  <span className="font-medium text-red-900">{route.schedule.fromUniversity}</span>
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {}
      <p className="text-center mt-16 text-gray-600 text-sm italic relative z-10">
        Last updated on{' '}
        {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}
