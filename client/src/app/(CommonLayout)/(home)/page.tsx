"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface RouteSchedule {
    route: string;
    toUniversity: string;
    fromUniversity: string;
    nextBus?: string; // ✅ Added this line
}

const schedules: RouteSchedule[] = [
    {
        route: "Ichladi Toll Plaza",
        toUniversity: "8:00 AM (Sunday)",
        fromUniversity: "5:30 PM (Thursday)",
    },
    {
        route: "Jhalokathi Sadar",
        toUniversity: "8:00 AM (Sunday)",
        fromUniversity: "5:30 PM (Thursday)",
    },
    {
        route: "Nothullabad",
        toUniversity: "7:00 AM (Sunday)",
        fromUniversity: "4:00 PM (Thursday)",
    },
    {
        route: "Notun Bazar",
        toUniversity: "7:30 AM (Sunday)",
        fromUniversity: "4:30 PM (Thursday)",
    },
    {
        route: "Barishal Club",
        toUniversity: "7:45 AM (Sunday)",
        fromUniversity: "4:30 PM (Thursday)",
    },
    {
        route: "Barishal Cantonment",
        toUniversity: "8:00 AM (Sunday)",
        fromUniversity: "5:30 PM (Thursday)",
    },
];

const parseTime = (timeStr: string) => {
    const [time, meridian] = timeStr.split(" ");
    const [hour, minute] = time.split(":").map(Number);
    let h = hour;
    if (meridian === "PM" && hour !== 12) h += 12;
    if (meridian === "AM" && hour === 12) h = 0;
    return h * 60 + (minute || 0);
};

const HomePage: React.FC = () => {
    const [nextBuses, setNextBuses] = useState<RouteSchedule[]>([]);

    useEffect(() => {
        const now = new Date();
        const day = now.getDay(); // 0=Sunday ... 6=Saturday
        const minutesNow = now.getHours() * 60 + now.getMinutes();

        const upcoming = schedules.map((s) => {
            const toTime = parseTime(s.toUniversity.split(" ")[0] + " " + s.toUniversity.split(" ")[1]);
            const fromTime = parseTime(s.fromUniversity.split(" ")[0] + " " + s.fromUniversity.split(" ")[1]);

            const nextBus =
                day === 0 && minutesNow < toTime
                    ? s.toUniversity
                    : day === 4 && minutesNow < fromTime
                        ? s.fromUniversity
                        : "No bus today";

            return { ...s, nextBus };
        });

        setNextBuses(upcoming);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Banner Section */}
            <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] mt-16 overflow-hidden">
                <Image
                    src="/static/loginpagebanner.png"
                    alt="Campus Banner"
                    width={1600}
                    height={600}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide">
                        At a Glance
                    </h3>
                </div>
            </div>

            {/* Dashboard Overview */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Total Trips */}
                    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-gray-500 text-sm mb-2">Total Trips Today</p>
                            <h2 className="text-3xl font-bold text-gray-900">1,234</h2>
                        </div>
                        <span className="text-blue-600 font-semibold mt-4">+12%</span>
                    </div>

                    {/* Passengers Today */}
                    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-gray-500 text-sm mb-2">Passengers Today</p>
                            <h2 className="text-3xl font-bold text-gray-900">5,678</h2>
                        </div>
                        <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full w-fit">
                            Active
                        </span>
                    </div>

                    {/* Active Buses */}
                    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-gray-500 text-sm mb-2">Active Buses</p>
                            <h2 className="text-3xl font-bold text-gray-900">3/4</h2>
                        </div>
                        <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full w-fit">
                            Online
                        </span>
                    </div>

                    {/* Total Stops */}
                    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-gray-500 text-sm mb-2">Total Stops</p>
                            <h2 className="text-3xl font-bold text-gray-900">13</h2>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full w-fit">
                            6 Routes
                        </span>
                    </div>
                </div>

                {/* Next Bus Reminder Table */}
                <div className="bg-white shadow-md rounded-3xl p-8 mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        🚌 Next Bus Reminder
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-red-600 text-white text-left text-sm">
                                    <th className="py-3 px-4 rounded-tl-lg">Route</th>
                                    <th className="py-3 px-4">Next Departure</th>
                                    <th className="py-3 px-4 rounded-tr-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nextBuses.map((bus, idx) => (
                                    <tr
                                        key={bus.route}
                                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            } hover:bg-red-50 transition`}
                                    >
                                        <td className="py-3 px-4 font-medium text-gray-800">
                                            {bus.route}
                                        </td>
                                        <td className="py-3 px-4 text-gray-700 text-sm">
                                            {bus.nextBus}
                                        </td>
                                        <td className="py-3 px-4">
                                            {bus.nextBus === "No bus today" ? (
                                                <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                                                    Inactive
                                                </span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                    Upcoming
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
