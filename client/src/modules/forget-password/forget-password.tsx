'use client';

import React, { useState } from 'react';
import InputField from '@/components/shared/InputField';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Loader2, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset } from '@/services/auth-client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await requestPasswordReset(email);
      setSent(true);
      toast.success(response.message || 'Reset instructions sent.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to process request';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-[95%] xl:max-w-7xl h-[85vh] lg:h-[800px] z-10"
      >
        {}
        <div className="w-full lg:w-[65%] relative h-1/3 lg:h-full group overflow-hidden">
          {}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-10 lg:hidden" />

          <Image
            width={1000}
            height={1000}
            src="/static/loginpagebanner.png"
            alt="Forgot Password Banner"
            className="w-full h-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-105"
            priority
          />

          <div className="absolute inset-0 z-20 lg:hidden flex items-end justify-center pb-8">
            <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
              Account Recovery
            </h3>
          </div>
        </div>

        {}
        <div className="w-full lg:w-[35%] p-8 lg:p-12 flex flex-col justify-center h-full bg-white relative">
          {!sent ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4 text-[#E31E24]">
                  <Mail size={32} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
                  Forget Password
                </h2>
                <div className="h-1.5 w-12 bg-[#E31E24] mx-auto rounded-full" />
                <p className="text-gray-500 text-sm mt-4 font-medium leading-relaxed">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col space-y-6 w-full max-w-sm mx-auto"
              >
                <div>
                  <InputField
                    label="Email Address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    error={error || undefined}
                    placeholder="name@university.edu.bd"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                            w-full py-4 rounded-xl font-bold text-white tracking-wide shadow-lg flex items-center justify-center gap-2
                            transition-all duration-300 transform
                            ${
                              isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#E31E24] hover:bg-red-700 hover:shadow-red-500/30 hover:-translate-y-0.5 active:scale-95'
                            }
                        `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center mt-4">
                  <Link
                    href="/login"
                    className="text-sm font-bold text-gray-500 hover:text-[#E31E24] transition-colors"
                  >
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
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-sm">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                Check your email
              </h3>
              <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                We’ve sent a password reset link to <br />
                <span className="font-bold text-[#E31E24] text-lg">{email}</span>
              </p>

              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full bg-[#E31E24] hover:bg-red-700 text-white py-3 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Back to Login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {}
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

export default ForgetPassword;
