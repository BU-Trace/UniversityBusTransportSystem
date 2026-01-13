'use client';

import React, { useState } from 'react';
import InputField from '@/components/shared/InputField';
import Image from 'next/image';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const LoginPageComponent = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined, form: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      validationErrors.email = 'Email is required';
    }
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      const message = result.error || 'Unable to sign in.';
      setErrors({ form: message });
      toast.error(message);
    } else {
      toast.success('Signed in successfully');
      router.push(result?.url || callbackUrl);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 md:p-8">
      {/* ---------- MAIN CONTAINER ---------- */}
      <div className="flex flex-col lg:flex-row bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden w-full max-w-6xl min-h-[80vh]">
        {/* ---------- LEFT SECTION (IMAGE PANEL) ---------- */}
        <div className="w-full lg:w-[70%] relative min-h-[240px]">
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
        <div className="w-full lg:w-[30%] p-8 md:p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-black text-center uppercase tracking-wide">
            Login
          </h2>
          <div className="h-1 w-16 bg-red-500 mx-auto rounded-full"></div>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full max-w-md mx-auto">
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            {errors.form ? <p className="text-red-600 text-sm">{errors.form}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-md font-semibold transition-all"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
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
        className="fixed top-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 z-50"
      >
        <Home size={24} />
      </Link>
    </div>
  );
};

export default LoginPageComponent;
