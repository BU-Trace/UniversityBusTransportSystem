'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

export default function BusDetailsPage() {
  const router = useRouter();

  const handleStatusClick = () => {
    router.push("/status"); 
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col md:flex-row items-stretch">
      {/* Left Red Section */}
      <div className="bg-red-800 text-white w-full md:w-1/3 p-10 flex flex-col justify-center shadow-2xl">
        <h2 className="text-2xl font-semibold mb-4">Name:</h2>
        <h1 className="text-4xl font-extrabold mb-8">John Doe</h1>

        <h2 className="text-2xl font-semibold mb-4">Bus:</h2>
        <h1 className="text-4xl font-extrabold mb-8">81</h1>

        <h2 className="text-2xl font-semibold mb-4">Registration:</h2>
        <h1 className="text-3xl font-bold mb-8 tracking-wider">UK07PA7498</h1>

        <h2 className="text-2xl font-semibold mb-4">Contact:</h2>
        <h1 className="text-3xl font-bold">9917360253</h1>
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-white p-10 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Bus Documents:</h2>
          <div className="w-5 h-5 bg-red-600 rounded-full"></div>
        </div>

        {/* Bus Document Image */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8 flex justify-center">
          <Image
            src="/f1.png"
            alt="Bus Document"
            width={500}
            height={300}
            className="rounded-md border shadow-md max-h-56 object-contain"
          />
        </div>

        {/* Map — Barishal, Bangladesh */}
        <div className="border rounded-lg overflow-hidden shadow">
          <iframe
            title="Bus Location - Barishal, Bangladesh"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.633146921759!2d90.34719377502718!3d22.701002379403474!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30aaba6e9cfb47f5%3A0xf48fa4de0337319c!2sBarishal%2C%20Bangladesh!5e0!3m2!1sen!2sbd!4v1730737330000!5m2!1sen!2sbd"
            width="100%"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Floating Status Update Button */}
      <button
  onClick={handleStatusClick}
  className="fixed top-6 right-6 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg font-semibold 
  hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95"
>
  Status Update
</button>

    </div>
  );
}
