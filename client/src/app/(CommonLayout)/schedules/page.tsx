"use client";

import { Clock, MapPin } from "lucide-react";

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

export default function BusSchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex flex-col items-center">
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
          <div key={route} className="mb-16">
            {/* City ➜ University */}
            <section className="bg-white rounded-3xl shadow p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <MapPin className="text-red-600" /> {route} ➜ University
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="py-3 px-4 rounded-tl-lg">Time</th>
                      <th className="py-3 px-4">Bus Numbers / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.fromCity).map(([time, buses], idx) => (
                      <tr
                        key={time}
                        className={`${
                          idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-red-50 transition`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {time}
                        </td>
                        <td className="py-3 px-4 text-gray-700 text-sm">
                          {buses.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* University ➜ City */}
            <section className="bg-white rounded-3xl shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <MapPin className="text-red-600 rotate-180" /> University ➜{" "}
                {route}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-red-600 text-white">
                      <th className="py-3 px-4 rounded-tl-lg">Time</th>
                      <th className="py-3 px-4">Bus Numbers / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.fromUniversity).map(
                      ([time, buses], idx) => (
                        <tr
                          key={time}
                          className={`${
                            idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-red-50 transition`}
                        >
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {time}
                          </td>
                          <td className="py-3 px-4 text-gray-700 text-sm">
                            {buses.join(", ")}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
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
    </div>
  );
}
