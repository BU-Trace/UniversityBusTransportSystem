"use client";

import React, { useState } from "react";
import InputField from "@/components/shared/InputField";
import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";

const LoginPageComponent = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in:", formData);
  };

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      {/* ---------- MAIN CONTAINER ---------- */}
      <div className="flex flex-col lg:flex-row bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden w-full h-full">

        {/* ---------- LEFT SECTION (IMAGE PANEL) ---------- */}
        <div className="w-full lg:w-[70%] relative h-full">
          <Image
            width={500}
            height={500}
            src="/static/loginpagebanner.png"
            alt="Login Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 lg:hidden flex items-center justify-center">
            <h3 className="text-2xl font-bold text-white">Welcome Back</h3>
          </div>
        </div>

        {/* ---------- RIGHT SECTION (FORM AREA) ---------- */}
        <div className="w-full lg:w-[30%] p-8 md:p-10 flex flex-col justify-center h-full">
          <h2 className="text-3xl font-bold text-black text-center uppercase tracking-wide">
            Login
          </h2>
          <div className="h-1 w-16 bg-red-500 mx-auto rounded-full"></div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4 w-full max-w-md mx-auto"
          >
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold transition-all"
            >
              Sign In
            </button>

            <div className="flex items-center justify-between text-sm mt-2">
              <Link href="forget-password" className="text-red-500 font-semibold hover:underline">
                Forgot Password?
              </Link>
              <Link href="/register" className="text-gray-700 hover:text-red-500 font-medium">
                Register Now
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/*home btn*/}
      <Link
        href="/"
        title="Go to Home"
        className="fixed bottom-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 z-50"
      >
        <Home size={24} />
      </Link>
    </div>
  );
};

export default LoginPageComponent;