"use client";

import React from "react";
import Image from "next/image";

const HomePage: React.FC = () => {
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
                            3 Routes
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
