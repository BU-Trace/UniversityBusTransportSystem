'use client';

import React, { useEffect, useState } from 'react';
import InputField from '@/components/shared/InputField';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Home, Loader2, ShieldCheck, User, Truck, Shield } from 'lucide-react'; // Added icons
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ClientITInfo } from '@/type/User';
import { registerUser, verifyEmail } from '@/services/auth-client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const roles = [
  { label: 'Student', value: 'student' as const, icon: User },
  { label: 'Driver', value: 'driver' as const, icon: Truck },
  { label: 'Admin', value: 'admin' as const, icon: Shield },
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="col-span-full md:col-span-1">
        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
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

      {errors.form ? (
         <div className="col-span-full p-3 bg-red-50 border border-red-100 rounded-lg">
             <p className="text-red-600 text-sm text-center font-medium">{errors.form}</p>
         </div>
      ) : null}

      <div className="col-span-full mt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full py-3.5 rounded-xl font-bold text-white tracking-wide shadow-lg flex items-center justify-center gap-2
            transition-all duration-300 transform
            ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#E31E24] hover:bg-red-700 hover:shadow-red-500/30 hover:-translate-y-0.5 active:scale-95'
            }
          `}
        >
          {isSubmitting ? (
             <>
               <Loader2 className="animate-spin" size={20} />
               <span>Creating Account...</span>
             </>
          ) : 'Create Account'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 overflow-hidden relative p-4">
      
      {}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

      {}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-[95%] xl:max-w-7xl h-[90vh] lg:h-[800px] z-10"
      >
        
        {}
        <div className="w-full lg:w-[40%] xl:w-[35%] p-6 md:p-10 flex flex-col justify-center h-full overflow-y-auto scrollbar-hide bg-white/50 relative">
          
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
              Register
            </h2>
            <div className="h-1.5 w-12 bg-[#E31E24] mx-auto rounded-full" />
            <p className="text-gray-500 text-xs mt-3 font-medium">Select your role to begin</p>
          </div>

          <Tabs selectedIndex={activeTab} onSelect={setActiveTab} className="w-full">
            {}
            <TabList className="flex p-1 gap-2 bg-gray-100/80 rounded-xl mb-8 border border-gray-200">
              {roles.map((tab, index) => {
                 const Icon = tab.icon;
                 const isActive = activeTab === index;
                 return (
                    <Tab
                        key={tab.value}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold cursor-pointer transition-all duration-300 outline-none
                            ${isActive 
                                ? 'bg-white text-[#E31E24] shadow-md scale-[1.02]' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }
                        `}
                        selectedClassName="" 
                    >
                        <Icon size={16} />
                        {tab.label}
                    </Tab>
                 )
              })}
            </TabList>

            {roles.map((role) => (
              <TabPanel key={role.value}>{renderForm()}</TabPanel>
            ))}
          </Tabs>

          {}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#E31E24]" size={18} />
                <h4 className="text-gray-900 font-bold text-sm">Email Verification</h4>
              </div>
              <p className="text-gray-500 text-xs mb-3 leading-relaxed">
                We'll send a 6-digit code to <span className="font-semibold text-gray-800">{verificationEmail || 'your email'}</span> after you submit.
              </p>
              
              <form onSubmit={handleVerify} className="flex gap-2">
                <div className="flex-1">
                   <InputField
                    label="Verification Code"
                    name="otpToken"
                    value={otpToken}
                    onChange={(e) => {
                        setOtpToken(e.target.value);
                        setErrors((prev) => ({ ...prev, verify: '' }));
                    }}
                    placeholder="Enter 6-digit code"
                    error={errors.verify}
                    />
                </div>
                <button
                  type="submit"
                  disabled={isVerifying || !verificationEmail}
                  className="h-[46px] px-4 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md self-start mt-[2px]"
                >
                  {isVerifying ? <Loader2 className="animate-spin" size={16} /> : 'Verify'}
                </button>
              </form>
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#E31E24] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {}
        <div className="hidden lg:block w-full lg:w-[60%] xl:w-[65%] relative h-full group overflow-hidden bg-gray-100">
           {}
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
           
          <Image
            width={1200}
            height={1200}
            src="/static/loginpagebanner.png"
            alt="Registration Banner"
            className="w-full h-full object-cover transition-transform duration-[3s] ease-in-out group-hover:scale-105"
            priority
          />
          
          <div className="absolute bottom-12 left-12 z-20 max-w-lg">
            <h3 className="text-4xl font-black text-white mb-2 drop-shadow-lg">Join Campus Connect</h3>
            <p className="text-white/80 font-medium text-lg drop-shadow-md">
                Streamline your university transport experience today.
            </p>
          </div>
        </div>

        {}
        <div className="lg:hidden h-48 relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-black/30 z-10 flex items-center justify-center">
                 <h3 className="text-2xl font-bold text-white drop-shadow-md">Create Account</h3>
             </div>
             <Image
                width={600}
                height={300}
                src="/static/loginpagebanner.png"
                alt="Mobile Banner"
                className="w-full h-full object-cover"
            />
        </div>

      </motion.div>

      {/*HomeBtn*/}
      <Link
        href="/"
        title="Go to Home"
        className="fixed top-6 right-6 p-4 bg-white/90 backdrop-blur text-[#E31E24] border border-red-100 rounded-full shadow-lg hover:bg-[#E31E24] hover:text-white transition-all duration-300 transform hover:scale-110 z-50 group"
      >
        <Home size={24} className="group-hover:animate-pulse" />
      </Link>
    </div>
  );
};

export default RegisterPageComponent;