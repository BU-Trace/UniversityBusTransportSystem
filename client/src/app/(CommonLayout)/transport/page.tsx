"use client";

import React from "react";
import Image from "next/image";
import { User, Phone, Bus, Clock, Calendar, Mail } from "lucide-react";

const CHIEF_INFO = {
  name: "Uzzal Hossain",
  title: "Manager (In-Charge), Office of the Registrar (Transport Pool)",
  message:
    "x", 
  phone: "0244821020-29", 
  email: "registrar@bu.ac.bd",
  imageSrc: "/static/chief_uzzal_hossain.png",
};

interface StaffInfo {
  name: string;
  duty: string;
  phone: string;
  yearsOfService: string;
  busesDriven: string[];
  imageSrc: string;
}

const DRIVER_STAFF_INFO: StaffInfo[] = [
  {
    name: "x",
    duty: "Senior Bus Driver",
    phone: "x",
    yearsOfService: "x",
    busesDriven: ["BRTC-04 (Joyonti)", "BRTC-05 (Chitra)"],
    imageSrc: "/static/driver_placeholder_1.png",
  },
  {
    name: "x",
    duty: "Bus Driver",
    phone: "x",
    yearsOfService: "x",
    busesDriven: ["BRTC-06 (Boikali/Kirtonkhola)"],
    imageSrc: "/static/driver_placeholder_2.png",
  },
  {
    name: "x",
    duty: "Bus Driver",
    phone: "x",
    yearsOfService: "x",
    busesDriven: ["BRTC-11 (Double Decker)", "BRTC-07"],
    imageSrc: "/static/driver_placeholder_3.png",
  },
  {
    name: "x",
    duty: "Assistant Driver",
    phone: "x",
    yearsOfService: "x",
    busesDriven: ["Andharmanik", "Sugondha"],
    imageSrc: "/static/driver_placeholder_4.png",
  },
  {
    name: "x",
    duty: "Bus Driver",
    phone: "x",
    yearsOfService: "x",
    busesDriven: ["Sondha", "Agunmukha"],
    imageSrc: "/static/driver_placeholder_5.png",
  },
  {
    name: "x",
    duty: "Mechanic & Driver",
    phone: "x",
    yearsOfService: "x",
    busesDriven: ["BRTC (Single Decker)"],
    imageSrc: "/static/driver_placeholder_6.png",
  },
  {
    name: "x",
    duty: "Bus Driver",
    phone: "x",
    yearsOfService: "x",
    busesDriven: ["Lata/Payra"],
    imageSrc: "/static/driver_placeholder_7.png",
  },
];

interface StaffCardProps {
    member: StaffInfo;
}

const StaffCard: React.FC<StaffCardProps> = ({ member }) => (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
        <div className="relative h-40 w-full bg-gray-100">
            <Image
                src={member.imageSrc}
                alt={member.name}
                fill
                sizes="(max-width: 600px) 100vw, 33vw"
                className="object-cover object-top"
            />
            <span className="absolute bottom-0 right-0 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-tl-lg">
                {member.duty}
            </span>
        </div>

        <div className="p-5">
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">{member.name}</h3>

            <div className="space-y-3 text-sm border-t pt-3 mt-3">
                {}
                <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-red-500" />
                    <span className="font-semibold">Service:</span>
                    <span className="ml-1 text-gray-900 font-bold">{member.yearsOfService}</span>
                </div>

                {}
                <div className="flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-2 text-red-500" />
                    <span className="font-semibold">Contact:</span>
                    <span className="ml-1 text-gray-900">{member.phone}</span>
                </div>

                {}
                <div className="text-gray-700 flex items-start mt-3">
                    <Bus className="w-4 h-4 mr-2 mt-1 text-red-500 flex-shrink-0" />
                    <span className="font-semibold flex-shrink-0">Buses:</span>
                    <span className="ml-1 text-gray-900 leading-tight">
                        {member.busesDriven.join(', ')}
                    </span>
                </div>
            </div>
        </div>
    </div>
);

export default function TransportPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            
            {}
            <div className="relative w-full h-[300px] mt-16 overflow-hidden shadow-lg">
                <Image
                    src="/static/loginpagebanner.png"
                    alt="University of Barishal Campus"
                    width={1600}
                    height={700}
                    className="w-full h-full object-cover transition-all duration-500"
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-5xl font-extrabold text-white uppercase tracking-wider text-center px-4">
                        Office of the Registrar (Transport Pool)
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">

                {}
                <section className="mb-16 p-8 bg-white shadow-xl rounded-2xl border-t-4 border-red-600">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                        Head of Transportation
                    </h2>
                    
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {}
                        <div className="relative w-40 h-40 flex-shrink-0 rounded-full overflow-hidden border-4 border-red-600 shadow-md bg-gray-100">
                            {}
                            <Image
                                src={CHIEF_INFO.imageSrc}
                                alt={CHIEF_INFO.name}
                                fill
                                sizes="160px"
                                className="object-cover object-top"
                            />
                        </div>

                        {}
                        <div>
                            <p className="text-2xl font-bold text-red-600">{CHIEF_INFO.name}</p>
                            <p className="text-lg text-gray-700 mb-4">{CHIEF_INFO.title}</p>
                            
                            {CHIEF_INFO.message !== 'x' && (
                                <blockquote className="italic text-gray-600 border-l-4 border-gray-300 pl-4 py-2 my-4">
                                    {CHIEF_INFO.message}
                                </blockquote>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm text-gray-700 font-medium">
                                <span className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1 text-red-500" /> Phone: {CHIEF_INFO.phone}
                                </span>
                                <span className="flex items-center">
                                    <Mail className="w-4 h-4 mr-1 text-red-500" /> Email: {CHIEF_INFO.email}
                                </span>
                            </div>
                            
                            {CHIEF_INFO.message === 'x' && (
                                <p className="mt-4 text-sm text-gray-500 italic">
                                    Chief's message unavailable (marked "x").
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {}
                <section>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
                        Our Dedicated Team Members (Drivers & Staff)
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {DRIVER_STAFF_INFO.map((member, index) => (
                            <StaffCard key={index} member={member} />
                        ))}
                    </div>
                    
                    <div className="mt-12 text-center text-sm text-gray-500 border-t pt-6">
                        <p>Note: Driver names, contact, and service history are placeholders ("x") awaiting internal data.</p>
                    </div>
                </section>
                
            </div>
        </div>
    );
}