"use client";

import Image from "next/image";
import { MapPin, Bus } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex flex-col items-center">
      <br /><br />
      <div className="max-w-7xl w-full">
        <h1 className="text-4xl font-bold text-red-600 text-center mb-3">
          UBTS Bus Routes
        </h1>
        <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
          Explore all UBTS bus routes operating between different city locations
          and the University of Barishal. Each route includes departure points,
          major stops, timing schedules and corresponding bus types.
        </p>

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <div
              key={route.name}
              className="bg-white rounded-3xl shadow hover:shadow-lg transition p-5 flex flex-col"
            >
              <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-4">
                <Image
                  src={route.map}
                  alt={route.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <MapPin className="text-red-600" size={20} />
                {route.name}
              </h2>

              <p className="text-gray-600 text-sm mb-4">{route.description}</p>

              <div className="mt-auto bg-gray-50 rounded-xl p-4 border">
                <div className="flex items-center gap-2 mb-2 text-gray-800 font-medium">
                  <Bus className="text-red-600" size={18} />
                  {route.busType}
                </div>
                <div className="text-sm text-gray-700">
                  <p>
                    <strong>To University:</strong> {route.schedule.toUniversity}
                  </p>
                  <p>
                    <strong>From University:</strong>{" "}
                    {route.schedule.fromUniversity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          Last updated on {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
