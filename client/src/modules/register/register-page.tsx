'use client';

import React, { useEffect, useState } from 'react';
import InputField from '@/components/shared/InputField';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ClientITInfo } from '@/type/User';
import { registerUser, verifyEmail } from '@/services/auth-client';
import { useRouter } from 'next/navigation';

const roles = [
  { label: 'Student', value: 'student' as const },
  { label: 'Driver', value: 'driver' as const },
  { label: 'Admin', value: 'admin' as const },
];

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  rollNumber: string;
  licenseNumber: string;
};

const buildInitialClientInfo = (): ClientITInfo => ({
  device: 'pc',
  browser: 'unknown',
  ipAddress: 'unknown',
  pcName: '',
  os: '',
  userAgent: 'unknown',
});

const RegisterPageComponent = () => {
  const [formData, setFormData] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    rollNumber: '',
    licenseNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientInfo, setClientInfo] = useState<ClientITInfo>(buildInitialClientInfo);
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(userAgent);

    setClientInfo((prev) => ({
      ...prev,
      device: isMobile ? 'mobile' : 'pc',
      browser:
        (userAgent.match(/(firefox|msie|chrome|safari|trident)/i)?.[0] || 'unknown')?.toLowerCase(),
      ipAddress: prev.ipAddress,
      pcName: window.location.hostname,
      os: window.navigator.platform,
      userAgent,
    }));

    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ip) {
          setClientInfo((prev) => ({ ...prev, ipAddress: data.ip }));
        }
      })
      .catch(() => {
        setClientInfo((prev) => ({ ...prev, ipAddress: prev.ipAddress || 'unknown' }));
      });
  }, []);

  const activeRole = roles[activeTab].value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const validationErrors: Record<string, string> = {};

    if (!formData.name.trim()) validationErrors.name = 'Name is required';
    if (!formData.email.trim()) validationErrors.email = 'Email is required';
    if (formData.password.length < 6) validationErrors.password = 'Minimum 6 characters required';
    if (formData.password !== formData.confirmPassword)
      validationErrors.confirmPassword = 'Passwords do not match';

    if (activeRole === 'student') {
      if (!formData.department.trim()) validationErrors.department = 'Department is required';
      if (!formData.rollNumber.trim()) validationErrors.rollNumber = 'Roll number is required';
    }

    if (activeRole === 'driver' && !formData.licenseNumber.trim()) {
      validationErrors.licenseNumber = 'License number is required';
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: activeRole,
        clientInfo:
          activeRole === 'student'
            ? { department: formData.department, rollNumber: formData.rollNumber }
            : activeRole === 'driver'
              ? { licenseNumber: formData.licenseNumber }
              : undefined,
        clientITInfo: clientInfo,
      });

      setVerificationEmail(formData.email.trim().toLowerCase());
      toast.success('Registration successful. Check your email for the verification code.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationEmail) {
      setErrors({ verify: 'Register first to verify your email.' });
      return;
    }
    if (!otpToken.trim()) {
      setErrors({ verify: 'Enter the verification code.' });
      return;
    }

    setIsVerifying(true);
    setErrors((prev) => ({ ...prev, verify: '' }));

    try {
      await verifyEmail({ email: verificationEmail, otpToken });
      toast.success('Email verified! You can now sign in.');
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setErrors({ verify: message });
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
      <InputField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      {activeRole === 'student' ? (
        <>
          <InputField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
          />
          <InputField
            label="Roll Number"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            error={errors.rollNumber}
          />
        </>
      ) : activeRole === 'driver' ? (
        <>
          <InputField
            label="License Number"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            error={errors.licenseNumber}
          />
          <div className="hidden md:block" />
        </>
      ) : (
        <>
          <div className="hidden md:block" />
          <div className="hidden md:block" />
        </>
      )}

      <InputField
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />
      <InputField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      {errors.form ? <p className="text-red-600 text-sm col-span-full">{errors.form}</p> : null}

      <div className="col-span-full">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-md font-semibold transition-all mt-2"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden w-full h-full">
        {/* ---------- LEFT SECTION (FORM AREA) ---------- */}
        <div className="w-full lg:w-[30%] p-8 md:p-10 flex flex-col justify-center h-full overflow-y-auto">
          <h2 className="text-3xl font-bold text-black text-center uppercase tracking-wide">
            Register
          </h2>
          <div className="h-1 w-16 bg-red-500 mx-auto rounded-full"></div>
          <Tabs selectedIndex={activeTab} onSelect={setActiveTab}>
            {/* Tab Headers */}
            <TabList className="flex justify-between bg-white border border-gray-300 rounded-lg mb-6 overflow-hidden">
              {roles.map((tab) => (
                <Tab
                  key={tab.value}
                  className="flex-1 text-center py-3 font-semibold text-black cursor-pointer hover:bg-red-50 focus:outline-none border-r last:border-r-0 border-gray-300 transition-colors"
                  selectedClassName="bg-red-500 text-white"
                >
                  {tab.label}
                </Tab>
              ))}
            </TabList>

            {roles.map((role) => (
              <TabPanel key={role.value}>{renderForm()}</TabPanel>
            ))}
          </Tabs>

          <div className="mt-6 space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-red-700 font-semibold text-sm">Email Verification</h4>
              <p className="text-gray-700 text-xs mt-1">
                Enter the 6-digit code sent to{' '}
                <span className="font-semibold">{verificationEmail || 'your email address'}</span>.
              </p>
              <form onSubmit={handleVerify} className="mt-3 space-y-2">
                <InputField
                  label="Verification Code"
                  name="otpToken"
                  value={otpToken}
                  onChange={(e) => {
                    setOtpToken(e.target.value);
                    setErrors((prev) => ({ ...prev, verify: '' }));
                  }}
                  placeholder="Enter code"
                  error={errors.verify}
                />
                <button
                  type="submit"
                  disabled={isVerifying || !verificationEmail}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 rounded-md font-semibold transition-all"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </button>
              </form>
            </div>

            <p className="text-center text-gray-700 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-red-500 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
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
