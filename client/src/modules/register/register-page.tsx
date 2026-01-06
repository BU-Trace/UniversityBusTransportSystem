'use client';

import React, { useState } from 'react';
import InputField from '@/components/shared/InputField';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const RegisterPageComponent = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    registrationNumber: '',
    contact: '',
    password: '',
    confirmPassword: '',
    department: '',
    licenseNumber: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (role: string) => (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Registering:', { role, ...formData });
  };

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden w-full h-full">
        {/* ---------- LEFT SECTION (FORM AREA) ---------- */}
        <div className="w-full lg:w-[30%] p-8 md:p-10 flex flex-col justify-center h-full overflow-y-auto">
          <h2 className="text-3xl font-bold text-black   text-center uppercase tracking-wide">
            Register
          </h2>
          <div className="h-1 w-16 bg-red-500 mx-auto   rounded-full"></div>
          <Tabs>
            {/* Tab Headers */}
            <TabList className="flex justify-between bg-white border border-gray-300 rounded-lg mb-8 overflow-hidden">
              {['Student', 'Driver', 'Teacher'].map((tab) => (
                <Tab
                  key={tab}
                  className="flex-1 text-center py-3 font-semibold text-black cursor-pointer hover:bg-red-50 focus:outline-none border-r last:border-r-0 border-gray-300 transition-colors"
                  selectedClassName="bg-red-500 text-white"
                >
                  {tab}
                </Tab>
              ))}
            </TabList>

            {/* ---------- STUDENT FORM ---------- */}
            <TabPanel>
              <form
                onSubmit={handleSubmit('Student')}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <InputField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <InputField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
                <InputField
                  label="Registration Number"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                />
                <InputField
                  label="Password"
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

                <div className="col-span-full">
                  <button
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold transition-all mt-2"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </TabPanel>

            {/* ---------- DRIVER FORM ---------- */}
            <TabPanel>
              <form
                onSubmit={handleSubmit('Driver')}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <InputField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <InputField
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                />
                <InputField
                  label="Contact No."
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                />
                <InputField
                  label="Password"
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

                <div className="col-span-full">
                  <button
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold transition-all mt-2"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </TabPanel>

            {/* ---------- TEACHER FORM ---------- */}
            <TabPanel>
              <form
                onSubmit={handleSubmit('Teacher')}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <InputField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <InputField
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
                <InputField
                  label="Contact No."
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                />
                <InputField
                  label="Password"
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

                <div className="col-span-full">
                  <button
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md font-semibold transition-all mt-2"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </TabPanel>
          </Tabs>

          <p className="text-center text-gray-700 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-red-500 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* ---------- RIGHT SECTION (IMAGE PANEL) ---------- */}
        <div className="w-full lg:w-[70%] relative h-full">
          <Image
            width={500}
            height={500}
            src="/static/loginpagebanner.png"
            alt="Registration Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 lg:hidden flex items-center justify-center">
            <h3 className="text-2xl font-bold text-white">Welcome to Registration</h3>
          </div>
        </div>
      </div>

      {/*home btn*/}
      <Link
        href="/"
        title="Go to Home"
        className="fixed top-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 z-50"
      >
        <Home size={24} />
      </Link>
    </div>
  );
};

export default RegisterPageComponent;
