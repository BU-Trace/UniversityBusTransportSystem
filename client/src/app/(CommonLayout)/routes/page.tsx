"use client";

import Image from "next/image";
import { MapPin, Bus } from "lucide-react";
import { motion } from "framer-motion";

const routes = [
  {
    name: "Ichladi Toll Plaza ➜ University of Barishal",
    description:
      "The bus starts from Ichladi Toll Plaza, travels along N8 through Rupatali, and reaches the University of Barishal. This route serves students from Ichladi, Rupatali, and nearby areas.",
    schedule: {
      toUniversity: "8:00 AM (Sunday)",
      fromUniversity: "5:30 PM (Thursday)",
    },
    busType: "BRTC (Single Deck)",
    map: "/static/ichladi_route.jpg",
  },
  {
    name: "Jhalokathi Sadar ➜ University of Barishal",
    description:
      "Starting from Jhalokathi Sadar, the bus travels via N8 highway crossing Gabkhan Bridge and Rupatali before reaching the University. Ideal for students from Jhalokathi region.",
    schedule: {
      toUniversity: "8:00 AM (Sunday)",
      fromUniversity: "5:30 PM (Thursday)",
    },
    busType: "BRTC (Single Deck)",
    map: "/static/jhalokathi_route.jpg",
  },
  {
    name: "Nothullabad ➜ University of Barishal",
    description:
      "Departs from Nothullabad Bus Terminal and follows the N8 highway, passing Rupatali and reaching the University campus. One of the most common and fastest routes.",
    schedule: {
      toUniversity: "7:00 AM (Sunday)",
      fromUniversity: "4:00 PM (Thursday)",
    },
    busType: "BRTC (Single Deck)",
    map: "/static/nothullabad_route.jpg",
  },
  {
    name: "Notun Bazar ➜ University of Barishal",
    description:
      "Begins from Bogura Road Police Station moves through Munshi Garaj, Forester Bari, Choumatha and Rupatali before arriving at the University. This route covers Northan Barishal city areas.",
    schedule: {
      toUniversity: "7:30 AM (Sunday)",
      fromUniversity: "4:30 PM (Thursday)",
    },
    busType: "BRTC (Single Deck)",
    map: "/static/notun_route.jpg",
  },
  {
    name: "Barishal Club ➜ University of Barishal",
    description:
      "Originates near Barishal Club and passes Bogra Road, Sadar Road, South Alekanda, and Rupatali before reaching the University campus.",
    schedule: {
      toUniversity: "7:45 AM (Sunday)",
      fromUniversity: "4:30 PM (Thursday)",
    },
    busType: "BRTC (Single Deck)",
    map: "/static/barishalclub_route.jpg",
  },
  {
    name: "Barishal Cantonment ➜ University of Barishal",
    description:
      "Starts from contonmant area and travels along Payra bridge Toll Plaza road, PSTU connecting to the main N8 highway toward the University. Serves students from outer Barishal areas.",
    schedule: {
      toUniversity: "8:00 AM (Sunday)",
      fromUniversity: "5:30 PM (Thursday)",
    },
    busType: "BRTC (Single Deck)",
    map: "/static/PSTU_route.jpg",
  },
];

export default function RoutePage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-12 px-6 flex flex-col items-center overflow-hidden">
      
      {/* Background Water Wave Effect (Maroon, Shaky Animation) */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <style jsx global>{`
          /* Custom CSS keyframes for the continuous background shake */
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
          .animate-shaky-wave {
            animation: shake 0.5s infinite alternate;
          }
        `}</style>
        {/* Maroon radial gradient with the fast shake animation */}
        <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.15)_0%,transparent_70%)] animate-shaky-wave" />
      </div>

      <br />
      <br />
      <div className="max-w-7xl w-full relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold text-red-900 text-center mb-4 tracking-tight drop-shadow-md"
        >
          University Bus Routes
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gray-700 text-lg text-center mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Explore all UBTS bus routes operating between different city locations
          and the University of Barishal. Each route includes departure points,
          major stops, timing schedules and corresponding bus types for your convenience.
        </motion.p>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route, index) => (
            <motion.div
              key={route.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              // FIX: Use type: "tween" for multiple rotation keyframes to avoid Framer Motion error
              whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 1, 0] }} 
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                type: "tween", // Solves the "Only two keyframes currently supported with spring..." error
                ease: "easeInOut" 
              }}
              viewport={{ once: true, amount: 0.3 }}
              className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-red-300/50 transition-all duration-300 p-6 flex flex-col border border-red-200"
            >
              <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-5 border border-gray-100 shadow-inner">
                <Image
                  src={route.map}
                  alt={route.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-3">
                <MapPin className="text-red-700" size={24} />
                {route.name}
              </h2>

              <p className="text-gray-700 text-base mb-5 leading-relaxed flex-grow">{route.description}</p>

              <div className="mt-auto bg-red-50/60 rounded-xl p-5 border border-red-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3 text-red-800 font-semibold text-lg">
                  <Bus className="text-red-700" size={20} />
                  {route.busType}
                </div>
                <div className="text-base text-gray-700 space-y-1">
                  <p>
                    <strong>To University:</strong>{" "}
                    <span className="font-medium text-red-700">{route.schedule.toUniversity}</span>
                  </p>
                  <p>
                    <strong>From University:</strong>{" "}
                    <span className="font-medium text-red-900">{route.schedule.fromUniversity}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center mt-16 text-gray-600 text-sm italic">
          Last updated on {new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}