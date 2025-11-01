"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

import { Bus, Users, MapPin, Clock, ArrowUpRight } from "lucide-react"; 

const LoadingScreen = () => (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center space-y-6">
      <div className="w-24 h-24 relative">
        <Image
          src="/static/logo.png"
          alt="Campus Connect Logo"
          fill
          className="object-contain animate-pulse"
          sizes="96px"
        />
      </div>
      <h1 className="text-4xl font-extrabold text-red-600 tracking-wider animate-bounce-slow">
        Campus Connect
      </h1>
      <p className="text-xl text-gray-700 mt-4 italic">
        "Welcome to the next level"
      </p>
      <div className="h-2 w-32 bg-red-200 rounded-full overflow-hidden mt-8">
          <div className="h-full bg-red-600 w-1/4 animate-loading-bar"></div>
      </div>
    </div>
);

interface RouteSchedule {
    route: string;
    toUniversity: string;
    fromUniversity: string;
    nextBus?: string;
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

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    footerText: React.ReactNode; 
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, footerText, color }) => (
    <div className={`bg-white shadow-xl rounded-2xl p-6 border-l-4 border-${color}-600 transform hover:scale-[1.02] transition-transform duration-300`}>
        <div className="flex items-center justify-between">
            <p className="text-gray-500 font-semibold text-sm uppercase">{title}</p>
            <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600`}>{icon}</div> 
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mt-2">{value}</h2>
        <div className={`font-medium text-sm mt-4 flex items-center text-${color}-600`}> 
            {footerText}
        </div>
    </div>
);

const HomePage: React.FC = () => {
    const [nextBuses, setNextBuses] = useState<RouteSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const now = new Date();
        const day = now.getDay();
        const minutesNow = now.getHours() * 60 + now.getMinutes();

        const upcoming = schedules.map((s) => {
            const timePartsTo = s.toUniversity.split(" ");
            const timePartsFrom = s.fromUniversity.split(" ");
            
            const toTime = parseTime(timePartsTo[0] + " " + timePartsTo[1]);
            const fromTime = parseTime(timePartsFrom[0] + " " + timePartsFrom[1]);

            const nextBus =
                day === 0 && minutesNow < toTime
                    ? s.toUniversity
                    : day === 4 && minutesNow < fromTime
                        ? s.fromUniversity
                        : "No bus today";

            return { ...s, nextBus };
        });

        const timer = setTimeout(() => {
            setNextBuses(upcoming);
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {}
            <div className="relative w-full h-[350px] md:h-[450px] lg:h-[500px] mt-16 overflow-hidden shadow-lg">
                <Image
                    src="/static/loginpagebanner.png"
                    alt="Campus Banner"
                    width={1600}
                    height={700}
                   
                    className="w-full h-full object-cover shadow-inner transition-all duration-500" 
                    priority
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
                    <h3 className="text-5xl md:text-6xl font-extrabold text-white text-center uppercase tracking-wider animate-fade-in">
                        Campus Connect
                    </h3>
                    <p className="mt-4 text-xl text-white font-medium italic">
                        Real-time transport information, at a glance.
                    </p>
                </div>
            </div>

            {}
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-12 -mt-16 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {}
                    <StatCard 
                        title="Total Trips Today"
                        value="1,234"
                        icon={<Bus className="w-5 h-5" />}
                        footerText={<><ArrowUpRight className="w-4 h-4 mr-1" /> +12% from Yesterday</>}
                        color="blue"
                    />

                    {}
                    <StatCard 
                        title="Total Passengers"
                        value="5,678"
                        icon={<Users className="w-5 h-5" />}
                        footerText={<span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">Active Routes</span>}
                        color="green"
                    />

                    {}
                    <StatCard 
                        title="Active Buses"
                        value="3/4"
                        icon={<Bus className="w-5 h-5" />}
                        footerText="Last updated 2 min ago"
                        color="red"
                    />

                    {}
                    <StatCard 
                        title="Total Stops"
                        value="13"
                        icon={<MapPin className="w-5 h-5" />}
                        footerText="Covering 6 Major Routes"
                        color="indigo"
                    />
                </div>

                {}
                <div className="bg-white shadow-2xl rounded-3xl p-8 mt-6 border-t-4 border-red-600">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center border-b pb-3">
                        ⏰ Live Next Bus Reminder
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-red-600 text-white text-left text-base uppercase tracking-wider">
                                    <th className="py-4 px-6 rounded-tl-xl">Route Location</th>
                                    <th className="py-4 px-6">Next Departure</th>
                                    <th className="py-4 px-6 rounded-tr-xl">Status / Direction</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nextBuses.map((bus, idx) => {
                                    const isActive = bus.nextBus !== "No bus today";
                                    const direction = bus.nextBus?.includes("University") ? "To Varsity" : "From Varsity";
                                    
                                    return (
                                        <tr
                                            key={bus.route}
                                            className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-red-50 transition border-b border-gray-100`}
                                        >
                                            <td className="py-4 px-6 font-semibold text-gray-800 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-red-500" /> {bus.route}
                                            </td>
                                            <td className="py-4 px-6 text-lg font-bold text-red-600">
                                                {bus.nextBus?.split(" ")[0] || "N/A"}
                                                <span className="text-sm font-medium text-gray-500 ml-2">
                                                    {bus.nextBus?.split(" ").slice(1).join(" ") || ""}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {isActive ? (
                                                    <span className="bg-green-100 text-green-700 text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                                                        {direction}
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                                                        {bus.nextBus}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Timings are calculated for today, {new Date().toDateString()}.
                    </p>

                </div>
            </div>
        </div>
    );
};

export default HomePage;