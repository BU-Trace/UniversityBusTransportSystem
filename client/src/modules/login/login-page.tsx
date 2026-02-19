'use client';

import React, { useState } from 'react';
import InputField from '@/components/shared/InputField';
import Image from 'next/image';
import Link from 'next/link';
import { Home, Loader2 } from 'lucide-react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

type UserRole = 'driver' | 'admin' | 'superadmin';

function isRoleAllowedForPath(role: UserRole | undefined, path: string) {
  if (!role) return false;
  if (path.startsWith('/dashboard')) return role === 'admin' || role === 'superadmin';
  if (path.startsWith('/driver-dashboard')) return role === 'driver';
  return true;
}

function defaultRouteForRole(role: UserRole | undefined) {
  if (role === 'admin' || role === 'superadmin') return '/dashboard';
  if (role === 'driver') return '/driver-dashboard';
  return '/';
}

function normalizeCallbackUrl(callbackUrl: string | null) {
  const raw = (callbackUrl || '').trim();
  if (!raw) return null;

  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      return u.pathname + (u.search || '');
    }
  } catch {}

  if (!raw.startsWith('/')) return `/${raw}`;
  return raw;
}

const LoginPageComponent = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = normalizeCallbackUrl(searchParams.get('callbackUrl'));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined, form: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    const validationErrors: { email?: string; password?: string } = {};
    if (!email) validationErrors.email = 'Email is required';
    if (!password) validationErrors.password = 'Password is required';

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl || '/dashboard',
      });

      if (result?.error) {
        setErrors({ form: result.error });
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      const session = await getSession();
      const role = (session?.user as { role?: UserRole })?.role;
      const safeDefault = defaultRouteForRole(role);

      const nextPath =
        callbackUrl && isRoleAllowedForPath(role, callbackUrl)
          ? callbackUrl
          : safeDefault;

      toast.success('Signed in successfully');
      router.replace(nextPath);
    } catch {
      toast.error('Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      bg-gradient-to-br
      from-[#0f172a]
      via-[#111827]
      to-black
      px-4
      relative
    ">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          w-full
          max-w-6xl
          grid
          grid-cols-1
          lg:grid-cols-2
          bg-white/5
          backdrop-blur-xl
          border border-white/10
          rounded-3xl
          shadow-2xl
          overflow-hidden
        "
      >

        {/* LEFT IMAGE */}
        <div className="relative hidden lg:block">
          <Image
            src="/static/loginpagebanner.png"
            alt="Login Banner"
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <h3 className="text-4xl font-black text-white">
              Welcome Back
            </h3>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">

          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/static/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="mx-auto"
              />
            </Link>

            <h2 className="text-4xl font-black text-white uppercase tracking-tight">
              Login
            </h2>

            <div className="h-1.5 w-12 bg-brick-600 mx-auto rounded-full mt-3" />

            <p className="text-gray-400 text-sm mt-4">
              Enter your credentials to access your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-6 w-full max-w-sm mx-auto"
          >
          
            <InputField
              label="Email Address"
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

            {errors.form && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">
                  {errors.form}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-4 rounded-xl font-bold text-white
                transition-all duration-300
                ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-brick-600 hover:bg-brick-700 shadow-lg'
                }
              `}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex justify-center pt-4 border-t border-white/10">
              <Link
                href="/forget-password"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Forgot Password?
              </Link>
            </div>

          </form>
        </div>

      </motion.div>

      {/* Home Button */}
      <Link
        href="/"
        className="
          fixed top-6 right-6
          p-4
          bg-white/10
          backdrop-blur
          text-white
          rounded-full
          border border-white/10
          hover:bg-brick-600
          transition-all
        "
      >
        <Home size={24} />
      </Link>

    </div>
  );
};

export default LoginPageComponent;
