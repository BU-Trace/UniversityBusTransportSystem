'use client';

import React, { useEffect, useState } from 'react';
import InputField from '@/components/shared/InputField';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Home, Loader2, ShieldCheck, User, Briefcase, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ClientITInfo } from '@/type/User';
import { registerUser, verifyEmail } from '@/services/auth-client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// --- ROLES CONFIGURATION (Student & Staff Only) ---
const roles = [
  { label: 'Student', value: 'student' as const, icon: User },
  { label: 'Staff', value: 'staff' as const, icon: Briefcase },
];

type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  rollNumber: string;
  designation: string;
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
  // --- STATE ---
  const [formData, setFormData] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    rollNumber: '',
    designation: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clientInfo, setClientInfo] = useState<ClientITInfo>(buildInitialClientInfo);
  const [activeTab, setActiveTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification States
  const [otpToken, setOtpToken] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // UI Flow State: 'form' -> 'verify'
  const [registrationStep, setRegistrationStep] = useState<'form' | 'verify'>('form');

  const router = useRouter();

  // --- USE EFFECT: FETCH USER AGENT & IP ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userAgent = window.navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(userAgent);

    setClientInfo((prev) => ({
      ...prev,
      device: isMobile ? 'mobile' : 'pc',
      browser: (
        userAgent.match(/(firefox|msie|chrome|safari|trident)/i)?.[0] || 'unknown'
      )?.toLowerCase(),
      ipAddress: prev.ipAddress,
      pcName: window.location.hostname,
      os: window.navigator.platform,
      userAgent,
    }));

    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ip) setClientInfo((prev) => ({ ...prev, ipAddress: data.ip }));
      })
      .catch(() => {
        setClientInfo((prev) => ({ ...prev, ipAddress: prev.ipAddress || 'unknown' }));
      });
  }, []);

  const activeRole = roles[activeTab].value;

  // --- HANDLERS ---

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

    if (activeRole === 'staff') {
      if (!formData.department.trim()) validationErrors.department = 'Department is required';
      if (!formData.designation.trim()) validationErrors.designation = 'Designation is required';
    }

    return validationErrors;
  };

  // STEP 1: CREATE ACCOUNT (User Unverified)
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
      // 1. Prepare Role Specific Data
      let roleSpecificInfo = {};
      if (activeRole === 'student') {
        roleSpecificInfo = {
          department: formData.department,
          rollNumber: formData.rollNumber,
        };
      } else if (activeRole === 'staff') {
        roleSpecificInfo = {
          department: formData.department,
          designation: formData.designation,
        };
      }

      // 2. Call Register API
      // Note: Backend should create user with `isApproved: false` and send OTP via email
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: activeRole,
        clientInfo: roleSpecificInfo,
        clientITInfo: clientInfo,
      });

      // 3. Update UI to Verification Step
      setVerificationEmail(formData.email.trim().toLowerCase());
      setRegistrationStep('verify');
      toast.success('Account created! Please check your email for the OTP.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: VERIFY EMAIL (User becomes Verified/Approved)
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationEmail) {
      setErrors({ verify: 'Session expired. Please register again.' });
      return;
    }
    if (!otpToken.trim()) {
      setErrors({ verify: 'Enter the 6-digit verification code.' });
      return;
    }

    setIsVerifying(true);
    setErrors((prev) => ({ ...prev, verify: '' }));

    try {
      // Call Verify API
      await verifyEmail({ email: verificationEmail, otpToken });

      toast.success('Verification successful! You can now sign in.');
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setErrors({ verify: message });
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderForm = () => (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4"
    >
      <div className="col-span-full md:col-span-1">
        <InputField
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
      </div>
      <div className="col-span-full md:col-span-1">
        <InputField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
      </div>

      {activeRole === 'student' && (
        <>
          <InputField
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            placeholder="e.g. CSE"
          />
          <InputField
            label="Roll Number"
            name="rollNumber"
            value={formData.rollNumber}
            onChange={handleChange}
            error={errors.rollNumber}
          />
        </>
      )}

      {activeRole === 'staff' && (
        <>
          <InputField
            label="Department/Office"
            name="department"
            value={formData.department}
            onChange={handleChange}
            error={errors.department}
            placeholder="e.g. Admin"
          />
          <InputField
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            error={errors.designation}
            placeholder="e.g. Lecturer"
          />
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

      {errors.form && (
        <div className="col-span-full p-3 bg-red-50 border border-red-100 rounded-lg text-center text-red-600 text-sm">
          {errors.form}
        </div>
      )}

      <div className="col-span-full mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 rounded-xl font-bold text-white tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E31E24] hover:bg-red-700 hover:-translate-y-0.5 active:scale-95'}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </form>
  );

  const renderVerificationView = () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in duration-300">
      <div className="bg-red-50 p-4 rounded-full mb-6">
        <ShieldCheck className="text-[#E31E24] w-12 h-12" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
      <p className="text-center text-gray-500 mb-8 max-w-sm">
        We verified your details. Please enter the code sent to <br />
        <span className="font-bold text-gray-800">{verificationEmail}</span>.
      </p>

      <form onSubmit={handleVerify} className="w-full max-w-sm flex flex-col gap-4">
        <InputField
          label="Verification Code"
          name="otpToken"
          value={otpToken}
          onChange={(e) => {
            setOtpToken(e.target.value);
            setErrors((prev) => ({ ...prev, verify: '' }));
          }}
          placeholder="6-Digit Code"
          error={errors.verify}
        />

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
        >
          {isVerifying ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Login'}
        </button>
      </form>

      <button
        onClick={() => setRegistrationStep('form')}
        className="mt-6 flex items-center text-sm text-gray-500 hover:text-[#E31E24] transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Registration
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-white relative overflow-hidden">
      {/* Scrollbar CSS */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #fff;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #d1d5db;
        }
      `}</style>

      {/* Main Layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row w-full lg:h-screen"
      >
        {/* MOBILE BANNER */}
        <div className="lg:hidden h-56 relative overflow-hidden shrink-0 w-full">
          <div className="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center text-center p-4">
            <h3 className="text-3xl font-black text-white drop-shadow-md mb-1">BUTrace</h3>
            <p className="text-white/90 text-sm font-medium drop-shadow-sm">Create your account</p>
          </div>
          <Image
            width={600}
            height={300}
            src="/static/loginpagebanner.png"
            alt="Mobile Banner"
            className="w-full h-full object-cover"
          />
        </div>

        {/* LEFT SIDE: FORM or VERIFY VIEW */}
        <div className="w-full lg:w-[40%] xl:w-[35%] h-auto lg:h-full flex flex-col relative bg-white">
          <div className="w-full h-full lg:overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col justify-start lg:justify-center">
            {registrationStep === 'form' ? (
              <>
                <div className="mb-6 text-center pt-2">
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2 hidden lg:block">
                    Register
                  </h2>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 lg:hidden">Sign Up</h2>
                  <div className="h-1.5 w-12 bg-[#E31E24] mx-auto rounded-full hidden lg:block" />
                  <p className="text-gray-500 text-xs mt-3 font-medium">
                    Select your role to begin
                  </p>
                </div>

                <Tabs selectedIndex={activeTab} onSelect={setActiveTab} className="w-full">
                  <TabList className="flex p-1 gap-2 bg-gray-100 rounded-xl mb-8 border border-gray-200">
                    {roles.map((tab, index) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === index;
                      return (
                        <Tab
                          key={tab.value}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-300 outline-none ${isActive ? 'bg-white text-[#E31E24] shadow-md scale-[1.02]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                          selectedClassName=""
                        >
                          <Icon size={16} /> {tab.label}
                        </Tab>
                      );
                    })}
                  </TabList>
                  {roles.map((role) => (
                    <TabPanel key={role.value}>{renderForm()}</TabPanel>
                  ))}
                </Tabs>

                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-gray-500 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#E31E24] font-bold hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              // Verification View (Step 2)
              renderVerificationView()
            )}
          </div>
        </div>

        {/* RIGHT SIDE: IMAGE */}
        <div className="hidden lg:block w-full lg:w-[60%] xl:w-[65%] h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
          <Image
            width={1920}
            height={1080}
            src="/static/loginpagebanner.png"
            alt="Registration Banner"
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute bottom-16 left-16 z-20 max-w-xl">
            <h3 className="text-5xl font-black text-white mb-4 drop-shadow-lg leading-tight">
              Join <span className="text-[#E31E24]">BUTrace</span>
            </h3>
            <p className="text-white/90 font-medium text-xl drop-shadow-md leading-relaxed">
              Your gateway to seamless university transportation. Register today to access real-time
              schedules and route updates.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Home Button */}
      <Link
        href="/"
        className="fixed top-4 right-4 lg:top-8 lg:right-8 p-3 lg:p-4 bg-white/90 backdrop-blur text-[#E31E24] border border-red-100 rounded-full shadow-lg hover:bg-[#E31E24] hover:text-white transition-all duration-300 transform hover:scale-110 z-50 group"
      >
        <Home size={20} className="lg:w-6 lg:h-6 group-hover:animate-pulse" />
      </Link>
    </div>
  );
};

export default RegisterPageComponent;
