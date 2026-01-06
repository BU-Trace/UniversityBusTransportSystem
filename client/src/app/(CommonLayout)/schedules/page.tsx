'use client';

import { MapPin, Expand, Minimize2, Clock } from 'lucide-react';
import React, { useState } from 'react';
import RouteSelector from './RouteSelector';

type Schedule = {
  fromCity: { [time: string]: string[] };
  fromUniversity: { [time: string]: string[] };
};

const schedules: Record<string, Schedule> = {
  'Barishal Club': {
    fromCity: {
      '7:30 AM': ['BRTC-06'],
      '8:30 AM': ['BRTC-04', 'BRTC-05'],
      '9:15 AM': ['BRTC-06 (Boikali)'],
      '10:15 AM': ['BRTC-05 (Chitra)'],
      '11:15 AM': ['BRTC-04'],
      '12:00 PM': ['BRTC-05'],
      '1:00 PM': ['BRTC-06 (Kirtonkhola)'],
      '2:00 PM': ['BRTC-04 (Joyonti)'],
      '3:00 PM': ['BRTC-06 (Boikali)'],
      '3:40 PM': ['BRTC-04', 'BRTC-05'],
      '4:40 PM': ['Chitra'],
      '8:30 PM': ['2 Buses (Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti)'],
      '9:30 PM': ['Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti'],
    },
    fromUniversity: {
      '8:30 AM': ['Boikali, BRTC-06'],
      '9:30 AM': ['Chitra, BRTC-05'],
      '10:30 AM': ['Kirtonkhola, BRTC-04'],
      '11:15 AM': ['BRTC-05'],
      '12:10 PM': ['BRTC-06'],
      '1:15 PM': ['Joyonti, BRTC-04'],
      '2:15 PM': ['Boikali, BRTC-06'],
      '3:10 PM': ['BRTC-04, BRTC-05'],
      '4:10 PM': ['Chitra, BRTC-05'],
      '5:10 PM': ['Chitra, BRTC-04, BRTC-05'],
      '6:45 PM': ['Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti'],
      '9:00 PM': ['Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti'],
    },
  },
  Nothullabad: {
    fromCity: {
      '7:30 AM': ['BRTC-07'],
      '8:30 AM': ['BRTC-08, BRTC-11'],
      '9:15 AM': ['BRTC-09, BRTC-10'],
      '10:15 AM': ['BRTC-12, BRTC-13, BRTC-14'],
      '11:15 AM': ['BRTC-09, BRTC-11'],
      '12:00 PM': ['BRTC-08, BRTC-09'],
      '12:30 PM': ['BRTC-10, BRTC-12'],
      '1:00 PM': ['BRTC-07, BRTC-13'],
      '2:00 PM': ['BRTC-08, BRTC-09'],
      '3:00 PM': ['BRTC-10, BRTC-14'],
      '3:30 PM': ['BRTC-12'],
      '4:30 PM': ['BRTC-13'],
      '8:30 PM': ['BRTC-11 (Double Decker)'],
      '9:30 PM': ['BRTC-11 (Double Decker)'],
    },
    fromUniversity: {
      '8:30 AM': ['BRTC-07'],
      '9:30 AM': ['BRTC-08, BRTC-11'],
      '10:00 AM': ['BRTC-09, BRTC-10'],
      '11:15 AM': ['BRTC-12, BRTC-13'],
      '12:10 PM': ['BRTC-07, BRTC-11'],
      '1:15 PM': ['BRTC-08, BRTC-09'],
      '2:15 PM': ['BRTC-10, BRTC-12, BRTC-14'],
      '3:10 PM': ['BRTC-07, BRTC-13'],
      '4:15 PM': ['BRTC-08, BRTC-10'],
      '5:10 PM': ['BRTC-09, BRTC-12, BRTC-13, BRTC-14'],
      '6:45 PM': ['Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti'],
      '9:00 PM': ['BRTC-11 (Double Decker)'],
      '10:00 PM': ['BRTC-11 (Double Decker)'],
    },
  },
  'Natun Bazar': {
    fromCity: {
      '7:30 AM': ['Andharmanik'],
      '8:30 AM': ['Sugondha'],
      '9:15 AM': ['Sondha'],
      '10:15 AM': ['Agunmukha, Andharmanik'],
      '11:15 AM': ['Sugondha'],
      '12:00 PM': ['Sondha'],
      '12:45 PM': ['Agunmukha'],
      '1:50 PM': ['Sugondha'],
      '2:45 PM': ['Andharmanik'],
      '3:40 PM': ['Sondha'],
      '4:40 PM': ['Sugondha'],
    },
    fromUniversity: {
      '7:45 AM': ['Sugondha'],
      '8:30 AM': ['Sondha'],
      '9:30 AM': ['Agunmukha'],
      '10:30 AM': ['Sugondha'],
      '11:15 AM': ['Sondha'],
      '12:10 PM': ['Agunmukha'],
      '1:15 PM': ['Sugondha'],
      '2:15 PM': ['Andharmanik'],
      '3:10 PM': ['Sondha'],
      '4:10 PM': ['Sugondha'],
      '5:10 PM': ['Sondha, Andharmanik'],
    },
  },
  'Barishal Cantonment': {
    fromCity: {
      '8:00 AM (Sunday)': ['BRTC (Single Decker)'],
      '5:30 PM (Thursday)': ['BRTC (Single Decker)'],
    },
    fromUniversity: {
      '7:00 AM (Sunday)': ['BRTC (Single Decker)'],
      '4:00 PM (Thursday)': ['BRTC (Single Decker)'],
    },
  },
  'Ichladi Toll Plaza': {
    fromCity: {
      '8:00 AM (Sunday)': ['BRTC (Single Decker)'],
      '5:30 PM (Thursday)': ['BRTC (Single Decker)'],
    },
    fromUniversity: {
      '4:00 PM (Thursday)': ['BRTC (Single Decker)'],
    },
  },
  'Jhalokathi Sadar': {
    fromCity: {
      '8:00 AM (Sunday)': ['BRTC (Single Decker)'],
      '5:30 PM (Thursday)': ['BRTC (Single Decker)'],
    },
    fromUniversity: {
      '4:00 PM (Thursday)': ['BRTC (Single Decker)'],
    },
  },
};

// ---------- Mobile List Component ----------
const MobileScheduleList: React.FC<{ route: string; data: Schedule }> = ({ route, data }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4" /> University ➜ {route}
      </h3>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {Object.entries(data.fromUniversity).map(([time, buses]) => (
          <div key={time} className="flex justify-between items-start">
            <span className="font-medium text-gray-800 min-w-[80px]">{time}</span>
            <span className="text-sm text-gray-700 flex-1 ml-4">{buses.join(', ')}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4" /> {route} ➜ University
      </h3>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {Object.entries(data.fromCity).map(([time, buses]) => (
          <div key={time} className="flex justify-between items-start">
            <span className="font-medium text-gray-800 min-w-[80px]">{time}</span>
            <span className="text-sm text-gray-700 flex-1 ml-4">{buses.join(', ')}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ---------- Desktop Table Component ----------
const DesktopScheduleTable: React.FC<{
  route: string;
  data: Schedule;
  fullView?: boolean;
}> = ({ route, data, fullView = false }) => {
  const uniTimes = Object.keys(data.fromUniversity);
  const cityTimes = Object.keys(data.fromCity);
  const maxRows = Math.max(uniTimes.length, cityTimes.length);

  const rows = Array.from({ length: maxRows }, (_, i) => {
    const uniTime = uniTimes[i] || '';
    const cityTime = cityTimes[i] || '';
    return {
      uniTime,
      uniBuses: data.fromUniversity[uniTime] || [],
      cityTime,
      cityBuses: data.fromCity[cityTime] || [],
    };
  });

  return (
    <div
      className={`overflow-x-auto ${
        fullView
          ? 'border border-gray-200 rounded-lg'
          : 'max-h-[300px] lg:max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg'
      }`}
    >
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr className="bg-red-600 text-white sticky top-0 shadow-md">
            <th colSpan={3} className="py-3 px-4 text-center border-r border-red-700">
              <MapPin className="inline w-4 h-4 mr-1" /> University ➜ {route}
            </th>
            <th colSpan={3} className="py-3 px-4 text-center">
              <MapPin className="inline w-4 h-4 mr-1" /> {route} ➜ University
            </th>
          </tr>
          <tr className="bg-red-50 text-gray-700 text-sm border-b border-gray-200">
            <th className="py-2 px-4 border-r border-gray-200">Time</th>
            <th className="py-2 px-4 border-r border-gray-200">Bus Name</th>
            <th className="py-2 px-4 border-r border-gray-200">Notes</th>
            <th className="py-2 px-4 border-r border-gray-200">Time</th>
            <th className="py-2 px-4 border-r border-gray-200">Bus Name</th>
            <th className="py-2 px-4">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50 transition`}
            >
              <td className="py-3 px-4 font-medium text-gray-800 border-r border-gray-100">
                {row.uniTime}
              </td>
              <td className="py-3 px-4 text-gray-700 text-sm border-r border-gray-100">
                {row.uniBuses.length > 0 ? row.uniBuses[0] : ''}
              </td>
              <td className="py-3 px-4 text-gray-500 text-xs border-r border-gray-100">
                {row.uniBuses.length > 1 ? `(${row.uniBuses.slice(1).join(', ')})` : ''}
              </td>
              <td className="py-3 px-4 font-medium text-gray-800 border-r border-gray-100">
                {row.cityTime}
              </td>
              <td className="py-3 px-4 text-gray-700 text-sm border-r border-gray-100">
                {row.cityBuses.length > 0 ? row.cityBuses[0] : ''}
              </td>
              <td className="py-3 px-4 text-gray-500 text-xs">
                {row.cityBuses.length > 1 ? `(${row.cityBuses.slice(1).join(', ')})` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ---------- Schedule Display Component ----------
const ScheduleDisplay: React.FC<{
  route: string;
  data: Schedule;
  fullView: boolean;
}> = ({ route, data, fullView }) => (
  <>
    {/* Mobile View */}
    <div className="block sm:hidden">
      <MobileScheduleList route={route} data={data} />
    </div>

    {/* Desktop View */}
    <div className="hidden sm:block">
      <DesktopScheduleTable route={route} data={data} fullView={fullView} />
    </div>
  </>
);

// ---------- Main Page ----------
export default function BusSchedulePage() {
  const routeNames = Object.keys(schedules);
  const [selectedRoute, setSelectedRoute] = useState<string>(routeNames[0]);
  const [fullView, setFullView] = useState<boolean>(false);

  const activeRoute = schedules[selectedRoute];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 sm:pt-32 pb-6 px-4 sm:py-12 sm:px-6 flex flex-col items-center">
      <div className="max-w-6xl w-full">
        <h1 className="text-2xl sm:text-4xl font-bold text-red-600 text-center mb-2">
          UBTS Bus Schedule
        </h1>
        <p className="text-gray-600 text-center mb-6 sm:mb-10 text-sm sm:text-base">
          View departure and arrival times for all routes between city locations and the university.
        </p>

        <RouteSelector
          routes={routeNames}
          selectedRoute={selectedRoute}
          onSelect={setSelectedRoute}
        />

        {activeRoute ? (
          <div className="mb-8 sm:mb-16 bg-white rounded-2xl sm:rounded-3xl shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 border-b pb-2 sm:pb-4">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2 sm:mb-0">
                <MapPin className="text-red-600 w-5 h-5 sm:w-6 sm:h-6" /> {selectedRoute} Route
              </h2>
              <button
                onClick={() => setFullView(!fullView)}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition text-xs sm:text-sm font-medium self-start sm:self-auto"
              >
                {fullView ? (
                  <>
                    <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> Show Compact
                  </>
                ) : (
                  <>
                    <Expand className="w-3 h-3 sm:w-4 sm:h-4" /> Show Full Schedule
                  </>
                )}
              </button>
            </div>
            <ScheduleDisplay route={selectedRoute} data={activeRoute} fullView={fullView} />
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10 sm:mt-20">
            <p className="text-base sm:text-lg">
              🚍 Please select a route above to view its schedule.
            </p>
          </div>
        )}

        <div className="text-center mt-6 sm:mt-10 text-gray-500 text-xs sm:text-sm flex flex-col items-center">
          <Clock className="text-red-600 mb-1" size={16} />
          <p>
            Last updated: {new Date().toLocaleDateString()} | Data sourced from UBTS official
            schedule
          </p>
        </div>
      </div>
    </div>
  );
}
