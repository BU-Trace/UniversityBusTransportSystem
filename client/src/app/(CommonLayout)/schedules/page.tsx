"use client";

import { MapPin, Expand, Clock } from "lucide-react";
import React, { useState } from "react";

type Schedule = {
  fromCity: { [time: string]: string[] };
  fromUniversity: { [time: string]: string[] };
};

const schedules: Record<string, Schedule> = {
  "Barishal Club": {
    fromCity: {
      "7:30 AM": ["BRTC-06"],
      "8:30 AM": ["BRTC-04", "BRTC-05"],
      "9:15 AM": ["BRTC-06 (Boikali)"],
      "10:15 AM": ["BRTC-05 (Chitra)"],
      "11:15 AM": ["BRTC-04"],
      "12:00 PM": ["BRTC-05"],
      "1:00 PM": ["BRTC-06 (Kirtonkhola)"],
      "2:00 PM": ["BRTC-04 (Joyonti)"],
      "3:00 PM": ["BRTC-06 (Boikali)"],
      "3:40 PM": ["BRTC-04", "BRTC-05"],
      "4:40 PM": ["Chitra"],
      "8:30 PM": ["2 Buses (Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti)"],
      "9:30 PM": ["Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti"],
    },
    fromUniversity: {
      "8:30 AM": ["Boikali, BRTC-06"],
      "9:30 AM": ["Chitra, BRTC-05"],
      "10:30 AM": ["Kirtonkhola, BRTC-04"],
      "11:15 AM": ["BRTC-05"],
      "12:10 PM": ["BRTC-06"],
      "1:15 PM": ["Joyonti, BRTC-04"],
      "2:15 PM": ["Boikali, BRTC-06"],
      "3:10 PM": ["BRTC-04, BRTC-05"],
      "4:10 PM": ["Chitra, BRTC-05"],
      "5:10 PM": ["Chitra, BRTC-04, BRTC-05"],
      "6:45 PM": ["Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti"],
      "9:00 PM": ["Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti"],
    },
  },
  "Nothullabad": {
    fromCity: {
      "7:30 AM": ["BRTC-07"],
      "8:30 AM": ["BRTC-08, BRTC-11"],
      "9:15 AM": ["BRTC-09, BRTC-10"],
      "10:15 AM": ["BRTC-12, BRTC-13, BRTC-14"],
      "11:15 AM": ["BRTC-09, BRTC-11"],
      "12:00 PM": ["BRTC-08, BRTC-09"],
      "12:30 PM": ["BRTC-10, BRTC-12"],
      "1:00 PM": ["BRTC-07, BRTC-13"],
      "2:00 PM": ["BRTC-08, BRTC-09"],
      "3:00 PM": ["BRTC-10, BRTC-14"],
      "3:30 PM": ["BRTC-12"],
      "4:30 PM": ["BRTC-13"],
      "8:30 PM": ["BRTC-11 (Double Decker)"],
      "9:30 PM": ["BRTC-11 (Double Decker)"],
    },
    fromUniversity: {
      "8:30 AM": ["BRTC-07"],
      "9:30 AM": ["BRTC-08, BRTC-11"],
      "10:00 AM": ["BRTC-09, BRTC-10"],
      "11:15 AM": ["BRTC-12, BRTC-13"],
      "12:10 PM": ["BRTC-07, BRTC-11"],
      "1:15 PM": ["BRTC-08, BRTC-09"],
      "2:15 PM": ["BRTC-10, BRTC-12, BRTC-14"],
      "3:10 PM": ["BRTC-07, BRTC-13"],
      "4:15 PM": ["BRTC-08, BRTC-10"],
      "5:10 PM": ["BRTC-09, BRTC-12, BRTC-13, BRTC-14"],
      "6:45 PM": ["Lata/Kirtonkhola/Payra/Chitra/Boikali/Joyonti"],
      "9:00 PM": ["BRTC-11 (Double Decker)"],
      "10:00 PM": ["BRTC-11 (Double Decker)"],
    },
  },
  "Natun Bazar": {
    fromCity: {
      "7:30 AM": ["Andharmanik"],
      "8:30 AM": ["Sugondha"],
      "9:15 AM": ["Sondha"],
      "10:15 AM": ["Agunmukha, Andharmanik"],
      "11:15 AM": ["Sugondha"],
      "12:00 PM": ["Sondha"],
      "12:45 PM": ["Agunmukha"],
      "1:50 PM": ["Sugondha"],
      "2:45 PM": ["Andharmanik"],
      "3:40 PM": ["Sondha"],
      "4:40 PM": ["Sugondha"],
    },
    fromUniversity: {
      "7:45 AM": ["Sugondha"],
      "8:30 AM": ["Sondha"],
      "9:30 AM": ["Agunmukha"],
      "10:30 AM": ["Sugondha"],
      "11:15 AM": ["Sondha"],
      "12:10 PM": ["Agunmukha"],
      "1:15 PM": ["Sugondha"],
      "2:15 PM": ["Andharmanik"],
      "3:10 PM": ["Sondha"],
      "4:10 PM": ["Sugondha"],
      "5:10 PM": ["Sondha, Andharmanik"],
    },
  },
  "Barishal Cantonment": {
    fromCity: {
      "8:00 AM (Sunday)": ["BRTC (Single Decker)"],
      "5:30 PM (Thursday)": ["BRTC (Single Decker)"],
    },
    fromUniversity: {
      "7:00 AM (Sunday)": ["BRTC (Single Decker)"],
      "4:00 PM (Thursday)": ["BRTC (Single Decker)"],
    },
  },
  "Ichladi Toll Plaza": {
    fromCity: {
      "8:00 AM (Sunday)": ["BRTC (Single Decker)"],
      "5:30 PM (Thursday)": ["BRTC (Single Decker)"],
    },
    fromUniversity: {
      "4:00 PM (Thursday)": ["BRTC (Single Decker)"],
    },
  },
  "Jhalokathi Sadar": {
    fromCity: {
      "8:00 AM (Sunday)": ["BRTC (Single Decker)"],
      "5:30 PM (Thursday)": ["BRTC (Single Decker)"],
    },
    fromUniversity: {
      "4:00 PM (Thursday)": ["BRTC (Single Decker)"],
    },
  },
};

interface ScheduleTableProps {
  route: string;
  data: Schedule;
  isModal?: boolean;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ route, data, isModal = false }) => {
  const uniTimes = Object.keys(data.fromUniversity);
  const cityTimes = Object.keys(data.fromCity);
  const maxRows = Math.max(uniTimes.length, cityTimes.length);

  const rows = Array.from({ length: maxRows }, (_, i) => {
    const uniTime = uniTimes[i] || "";
    const cityTime = cityTimes[i] || "";
    return {
      uniTime,
      uniBuses: data.fromUniversity[uniTime] || [],
      cityTime,
      cityBuses: data.fromCity[cityTime] || [],
    };
  });

  return (

    <div className={`overflow-x-auto ${!isModal ? 'max-h-[300px] lg:max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg' : ''}`}>
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
              className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-red-50 transition`}
            >
              {}
              <td className="py-3 px-4 font-medium text-gray-800 border-r border-gray-100">{row.uniTime}</td>
              <td className="py-3 px-4 text-gray-700 text-sm border-r border-gray-100">{row.uniBuses.length > 0 ? row.uniBuses[0] : ''}</td>
              <td className="py-3 px-4 text-gray-500 text-xs border-r border-gray-100">{row.uniBuses.length > 1 ? `(${row.uniBuses.slice(1).join(', ')})` : ''}</td>
              
              {}
              <td className="py-3 px-4 font-medium text-gray-800 border-r border-gray-100">{row.cityTime}</td>
              <td className="py-3 px-4 text-gray-700 text-sm border-r border-gray-100">{row.cityBuses.length > 0 ? row.cityBuses[0] : ''}</td>
              <td className="py-3 px-4 text-gray-500 text-xs">{row.cityBuses.length > 1 ? `(${row.cityBuses.slice(1).join(', ')})` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ModalProps {
    route: string;
    data: Schedule;
    onClose: () => void;
}

const FullScheduleModal: React.FC<ModalProps> = ({ route, data, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            {}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col"> 
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-red-600">
                        Full Schedule: {route}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 transition p-2 text-3xl leading-none"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                {}
                <div className="p-6"> 
                    <ScheduleTable route={route} data={data} isModal={true} />
                </div>
                <div className="p-4 border-t sticky bottom-0 bg-white z-10 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function BusSchedulePage() {
    const [modalData, setModalData] = useState<{ route: string; data: Schedule } | null>(null);

    const openModal = (route: string, data: Schedule) => {
        setModalData({ route, data });
    };

    const closeModal = () => {
        setModalData(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 flex flex-col items-center">
            {}
            <br /><br />
            <div className="max-w-6xl w-full">
                <h1 className="text-4xl font-bold text-red-600 text-center mb-2">
                    UBTS Bus Schedule
                </h1>
                <p className="text-gray-600 text-center mb-10">
                    View departure and arrival times for all routes between city locations
                    and the university.
                </p>

                {Object.entries(schedules).map(([route, data]) => (
                    <div key={route} className="mb-16 bg-white rounded-3xl shadow p-6">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="text-red-600 w-6 h-6" /> {route} Route
                            </h2>
                            <button
                                onClick={() => openModal(route, data)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-full hover:bg-red-100 transition text-sm font-medium"
                            >
                                <Expand className="w-4 h-4" /> Show Full Schedule
                            </button>
                        </div>
                        
                        <ScheduleTable route={route} data={data} />

                    </div>
                ))}

                <div className="text-center mt-10 text-gray-500 text-sm flex flex-col items-center">
                    <Clock className="text-red-600 mb-1" size={18} />
                    <p>
                        Last updated: {new Date().toLocaleDateString()} | Data sourced from
                        UBTS official schedule
                    </p>
                </div>
            </div>

            {}
            {modalData && (
                <FullScheduleModal
                    route={modalData.route}
                    data={modalData.data}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}