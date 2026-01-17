'use client';

import React, { useState, Suspense } from 'react';
import InputField from '@/components/shared/InputField';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'; 
import Link from 'next/link';
import { resetPassword } from '@/services/auth-client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill out all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (!token) {
      setError('Invalid or missing token.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await resetPassword(token, formData.password);
      setSubmitted(true);
      toast.success('Password reset successfully. You can now sign in.');
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reset password';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:w-[35%] p-8 lg:p-12 flex flex-col justify-center h-full bg-white relative">
      {!submitted ? (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4 text-[#E31E24]">
                <KeyRound size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
              Reset Password
            </h2>
            <div className="h-1.5 w-12 bg-[#E31E24] mx-auto rounded-full" />
            <p className="text-gray-500 text-sm mt-4 font-medium">
              Create a new strong password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-5 w-full max-w-sm mx-auto">
            <div className="space-y-4">
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
            </div>

            {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-red-50 border border-red-100 rounded-lg"
                >
                    <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-4 rounded-xl font-bold text-white tracking-wide shadow-lg flex items-center justify-center gap-2
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
                   <span>Resetting...</span>
                 </>
               ) : 'Reset Password'}
            </button>

            <div className="text-center mt-6">
              <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-[#E31E24] transition-colors">
                 ← Back to Login
              </Link>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center px-4"
        >
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
             <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Password Reset!</h3>
          <p className="text-gray-500 mb-8 font-medium">Your password has been successfully updated. You can now access your account.</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center bg-[#E31E24] hover:bg-red-700 text-white py-3 px-8 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-1"
          >
            Back to Login
          </a>
        </motion.div>
      )}
    </div>
  );
};

const ResetPasswordPage = () => {
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
         className="flex flex-col lg:flex-row-reverse bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-[95%] xl:max-w-7xl h-[85vh] lg:h-[800px] z-10"
      >
        {}
        <div className="w-full lg:w-[65%] relative h-1/3 lg:h-full group overflow-hidden">
           {}
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10 lg:hidden" />
           
           <Image
            width={1000}
            height={1000}
            src="/static/loginpagebanner.png"
            alt="Reset Password Banner"
            className="w-full h-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-105"
            priority
          />
          
          <div className="absolute inset-0 z-20 lg:hidden flex items-end justify-center pb-8">
            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Secure Your Account</h3>
          </div>
        </div>

        {}
        <Suspense
          fallback={
            <div className="w-full lg:w-[35%] flex flex-col items-center justify-center bg-white h-full">
               <Loader2 className="animate-spin text-[#E31E24]" size={40} />
               <p className="text-gray-400 font-medium mt-4 text-sm">Loading security check...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

      </motion.div>

      {/*HomeBtn */}
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

export default ResetPasswordPage;