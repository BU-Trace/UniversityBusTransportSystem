"use client";

import React, { useState } from "react";
import InputField from "@/components/shared/InputField";
import Image from "next/image";
import Link from "next/link";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    setSent(true);
    console.log("Password reset link sent to:", email);
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
            alt="Forgot Password Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 lg:hidden flex items-center justify-center">
            <h3 className="text-2xl font-bold text-white">Reset Your Password</h3>
          </div>
        </div>

        {/* ---------- RIGHT SECTION (FORM AREA) ---------- */}
        <div className="w-full lg:w-[30%] p-8 md:p-10 flex flex-col justify-center h-full">
          <h2 className="text-3xl font-bold text-black mb-2 text-center uppercase tracking-wide">
            Forget Password
          </h2>
          <div className="h-1 w-16 bg-red-500 mx-auto mb-6 rounded-full"></div>

          {!sent ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col space-y-4 w-full max-w-md mx-auto"
            >
              <InputField
                label="Email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold transition-all"
              >
                Send Reset Link
              </button>

              <div className="text-center mt-4">
                <a
                  href="#"
                  className="text-gray-700 hover:text-red-500 font-medium text-sm"
                >
                  Back to Login
                </a>
              </div>
            </form>
          ) : (
            <div className="text-center mt-10">
              <h3 className="text-xl font-semibold text-black mb-4">
                Check your email
              </h3>
              <p className="text-gray-600 text-sm">
                We’ve sent a password reset link to <br />
                <span className="text-red-500 font-semibold">{email}</span>
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-md font-semibold transition-all"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
