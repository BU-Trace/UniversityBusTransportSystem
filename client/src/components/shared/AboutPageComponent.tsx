"use client";

import React from "react";
import Image from "next/image";

const AboutPageComponent = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            {/* hero */}
            <div className="w-full relative h-[300px] md:h-[400px] lg:h-[450px] mt-16">
                <Image
                    width={1600}
                    height={600}
                    src="/static/loginpagebanner.png"
                    alt="About Us Banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-white uppercase">
                        About Us
                    </h3>
                </div>
            </div>

            {/*about*/}
            <div className="max-w-6xl w-full px-6 md:px-12 lg:px-20 py-16">
                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    {/* Left Section */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Smarter University Transport with{" "}
                            <span className="text-red-600">UBTS</span>
                        </h1>
                        <p className="text-gray-600 mb-8">
                            UBTS is a smart web app designed to make university transport more efficient
                            and stress-free. It allows students and staff to check real-time bus schedules,
                            live tracking, and instant updates directly from their devices.
                        </p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium">
                            Explore Features
                        </button>
                    </div>

                    {/* Right Section*/}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-white shadow-md rounded-2xl p-6">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                Live Bus Tracking
                            </h3>
                            <p className="text-gray-600 text-sm">
                                View your bus’s location in real-time and plan your travel accordingly
                                with GPS-based tracking.
                            </p>
                        </div>
                        <div className="bg-white shadow-md rounded-2xl p-6">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                Dynamic Scheduling
                            </h3>
                            <p className="text-gray-600 text-sm">
                                UBTS updates schedules automatically based on route changes and
                                traffic conditions.
                            </p>
                        </div>
                        <div className="bg-white shadow-md rounded-2xl p-6">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                User Notifications
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Receive instant alerts for route delays, schedule changes, or bus arrivals.
                            </p>
                        </div>
                        <div className="bg-white shadow-md rounded-2xl p-6">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                Reliable Support
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Our support team ensures a smooth experience and quick assistance
                                whenever needed.
                            </p>
                        </div>
                    </div>
                </div>

                {/*Bottom*/}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white shadow-md rounded-2xl p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            Secure Login System
                        </h3>
                        <p className="text-gray-600 text-sm">
                            UBTS ensures secure authentication for students and staff with role-based access.
                        </p>
                    </div>
                    <div className="bg-white shadow-md rounded-2xl p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            Optimized for Performance
                        </h3>
                        <p className="text-gray-600 text-sm">
                            The system runs smoothly on all modern devices, keeping the user experience fast and seamless.
                        </p>
                    </div>
                    <div className="bg-white shadow-md rounded-2xl p-6">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            24/7 Accessibility
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Access bus details anytime, anywhere — ensuring reliable information at your fingertips.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPageComponent;
