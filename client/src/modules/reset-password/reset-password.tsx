"use client";

import React, { useState, Suspense } from "react";
import InputField from "@/components/shared/InputField";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// ---- Component that actually uses useSearchParams ----
const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      alert("Please fill out all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!token) {
      alert("Invalid or missing token.");
      return;
    }

    console.log("Resetting password with token:", token);
    console.log("New Password:", formData.password);

    setSubmitted(true);
  };

  return (
    <div className="w-full lg:w-[30%] p-8 md:p-10 flex flex-col justify-center h-full">
      <h2 className="text-3xl font-bold text-black mb-2 text-center uppercase tracking-wide">
        Reset Password
      </h2>
      <div className="h-1 w-16 bg-red-500 mx-auto mb-6 rounded-full"></div>

      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 w-full max-w-md mx-auto"
        >
          <InputField
            label="New Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold transition-all"
          >
            Reset Password
          </button>

          <div className="text-center mt-4">
            <a
              href="/login"
              className="text-gray-700 hover:text-red-500 font-medium text-sm"
            >
              Back to Login
            </a>
          </div>
        </form>
      ) : (
        <div className="text-center mt-10">
          <h3 className="text-xl font-semibold text-black mb-4">
            Password Reset Successful 🎉
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            You can now sign in with your new password.
          </p>
          <a
            href="/login"
            className="inline-block bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-md font-semibold transition-all"
          >
            Back to Login
          </a>
        </div>
      )}
    </div>
  );
};

// ---- Outer Page Wrapper ----
const ResetPasswordPage = () => {
  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      <div className="flex flex-col lg:flex-row-reverse bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden w-full h-full">
        {/* LEFT SIDE IMAGE */}
        <div className="w-full lg:w-[70%] relative h-full">
          <Image
            width={500}
            height={500}
            src="/static/loginpagebanner.png"
            alt="Reset Password Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 lg:hidden flex items-center justify-center">
            <h3 className="text-2xl font-bold text-white">Reset Your Password</h3>
          </div>
        </div>

        {/* RIGHT SIDE FORM WRAPPED IN SUSPENSE */}
        <Suspense fallback={<div className="w-full lg:w-[30%] flex items-center justify-center"><p>Loading...</p></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
