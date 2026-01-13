'use client';

import React from 'react';
import Image from 'next/image';
import { BusFront, User, Phone, MapPin } from 'lucide-react';

interface BusInfo {
  name: string;
  routes: string[];
  status: 'Running' | 'Repairing' | 'Offline' | 'x';
  driverName: string;
  phone: string;
  imageSrc: string;
}

const ALL_BUSES_INFO: BusInfo[] = [
  {
    name: 'BRTC-04 (Joyonti)',
    routes: ['Barishal Club', 'Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc04.png',
  },
  {
    name: 'BRTC-05 (Chitra)',
    routes: ['Barishal Club', 'Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc05.png',
  },
  {
    name: 'BRTC-06 (Boikali/Kirtonkhola)',
    routes: ['Barishal Club'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc06.png',
  },
  {
    name: 'BRTC-07',
    routes: ['Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc07.png',
  },
  {
    name: 'BRTC-08',
    routes: ['Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc08.png',
  },
  {
    name: 'BRTC-09',
    routes: ['Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc09.png',
  },
  {
    name: 'BRTC-10',
    routes: ['Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc10.png',
  },
  {
    name: 'BRTC-11 (Double Decker)',
    routes: ['Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc11.png',
  },
  {
    name: 'BRTC-12',
    routes: ['Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc12.png',
  },
  {
    name: 'BRTC-13',
    routes: ['Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc13.png',
  },
  {
    name: 'BRTC-14',
    routes: ['Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_brtc14.png',
  },
  {
    name: 'Andharmanik',
    routes: ['Natun Bazar'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_andharmanik.png',
  },
  {
    name: 'Sugondha',
    routes: ['Natun Bazar'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_sugondha.png',
  },
  {
    name: 'Sondha',
    routes: ['Natun Bazar'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_sondha.png',
  },
  {
    name: 'Agunmukha',
    routes: ['Natun Bazar'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_agunmukha.png',
  },
  {
    name: 'BRTC (Single Decker)',
    routes: ['Barishal Cantonment', 'Ichladi Toll Plaza', 'Jhalokathi Sadar'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_singlesecker.png',
  },
  {
    name: 'Lata/Payra',
    routes: ['Barishal Club', 'Nothullabad'],
    status: 'x',
    driverName: 'x',
    phone: 'x',
    imageSrc: '/static/bus_lata.png',
  },
];

const BusCard: React.FC<{ info: BusInfo }> = ({ info }) => {
  const statusColor =
    info.status === 'Running'
      ? 'bg-green-100 text-green-700'
      : info.status === 'Repairing'
        ? 'bg-yellow-100 text-yellow-700'
        : info.status === 'Offline'
          ? 'bg-red-100 text-red-700'
          : 'bg-gray-200 text-gray-700';

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-red-300 transition-all duration-500 hover:-translate-y-2 group">
      {}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={info.imageSrc}
          alt={info.name}
          fill
          sizes="(max-width: 600px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-maroon-900/80 to-transparent h-20"></div>
      </div>

      {}
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <BusFront className="text-red-600 w-6 h-6" /> {info.name}
          </h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${statusColor}`}>
            {info.status === 'x' ? 'Status N/A' : info.status}
          </span>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-maroon-600" />
            <span className="font-semibold mr-1">Driver:</span> {info.driverName}
          </div>

          <div className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-maroon-600" />
            <span className="font-semibold mr-1">Phone:</span> {info.phone}
          </div>

          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-2 mt-1 text-maroon-600" />
            <span className="font-semibold mr-1">Routes:</span> {info.routes.join(', ')}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <button className="relative w-full py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-red-600 via-maroon-700 to-red-800 text-white hover:brightness-110 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <span className="relative z-10">View Live Location</span>
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BusesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6a0f1a] via-[#8b1c24] to-[#b02a37] animate-gradient overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-40 bg-[url('/static/wave.svg')] bg-repeat-x animate-wave opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-48 bg-[url('/static/wave.svg')] bg-repeat-x animate-wave-slow opacity-50"></div>
      </div>

      {}
      <div className="relative z-10 pt-20 pb-16 px-6 md:px-10 max-w-7xl mx-auto text-white">
        {}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] mb-3">
            Meet Our Fleet
          </h1>
          <p className="text-lg text-red-100 max-w-3xl mx-auto">
            Discover our 17 buses that connect the University campus with various destinations.
          </p>
        </header>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ALL_BUSES_INFO.map((bus) => (
            <BusCard key={bus.name} info={bus} />
          ))}
        </div>

        {}
        <div className="mt-16 text-center text-sm text-red-200 border-t border-red-300/20 pt-6">
          <p>
            Note: Bus driver names, routes and statuses can be updated any time so stay connected to
            be informed.
          </p>
        </div>
      </div>

      {}
      <style jsx>{`
        @keyframes wave {
          0% {
            background-position-x: 0;
          }
          100% {
            background-position-x: 1000px;
          }
        }
        @keyframes wave-slow {
          0% {
            background-position-x: 0;
          }
          100% {
            background-position-x: 1500px;
          }
        }
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite;
        }
        .animate-wave {
          animation: wave 12s linear infinite;
          background-size: 1000px 100%;
        }
        .animate-wave-slow {
          animation: wave-slow 20s linear infinite;
          background-size: 1500px 100%;
        }
      `}</style>
    </div>
  );
}
