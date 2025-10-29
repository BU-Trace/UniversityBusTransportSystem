"use client";

import { Clock, MapPin } from "lucide-react";

const routes = [
  "Barishal Club",
  "Nathullabad",
  "Notun Bazar",
  "Barishal Cantonment",
  "Jhalokathi",
  "Voirob",
];

const generateTimes = (start: number, end: number) => {
  const times: string[] = [];
  for (let t = start; t <= end; t++) {
    const hour = Math.floor(t);
    const minutes = t % 1 === 0.5 ? "30" : "00";
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    times.push(`${displayHour}:${minutes} ${ampm}`);
  }
  return times;
};

const toUniversityTimes = generateTimes(7.5, 17.5);

const fromUniversityTimes = generateTimes(7, 17);

export default function BusSchedulePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex flex-col items-center">
      <div className="max-w-6xl w-full"><br /><br />
        <h1 className="text-4xl font-bold text-red-600 text-center mb-2">
          UBTS Bus Schedule
        </h1>
        <p className="text-gray-600 text-center mb-10">
          View departure and arrival times for all routes between city locations
          and the university.
        </p>

        <section className="bg-white rounded-3xl shadow p-6 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
            <MapPin className="text-red-600" /> City ➜ University
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="py-3 px-4 rounded-tl-lg">Route</th>
                  {toUniversityTimes.map((time) => (
                    <th key={time} className="py-3 px-4 font-medium text-sm">
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((route, idx) => (
                  <tr
                    key={route}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-red-50 transition`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {route}
                    </td>
                    {toUniversityTimes.map((_, i) => (
                      <td key={i} className="py-3 px-4 text-gray-700 text-sm">
                        🚌
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mb-6">
            <MapPin className="text-red-600 rotate-180" /> University ➜ City
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-600 text-white">
                  <th className="py-3 px-4 rounded-tl-lg">Destination</th>
                  {fromUniversityTimes.map((time) => (
                    <th key={time} className="py-3 px-4 font-medium text-sm">
                      {time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {routes.map((route, idx) => (
                  <tr
                    key={route}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-red-50 transition`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {route}
                    </td>
                    {fromUniversityTimes.map((_, i) => (
                      <td key={i} className="py-3 px-4 text-gray-700 text-sm">
                        🚌
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="text-center mt-10 text-gray-500 text-sm flex flex-col items-center">
          <Clock className="text-red-600 mb-1" size={18} />
          <p>
            Bus intervals: every 1 hour | Last update:{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
