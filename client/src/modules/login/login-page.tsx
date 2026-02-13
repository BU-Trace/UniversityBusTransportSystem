// 'use client';

// import React, { useState } from 'react';
// import InputField from '@/components/shared/InputField';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Home, Loader2 } from 'lucide-react';
// import { signIn } from 'next-auth/react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { toast } from 'sonner';
// import { motion } from 'framer-motion';

// const LoginPageComponent = () => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setErrors((prev) => ({ ...prev, [e.target.name]: undefined, form: undefined }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const validationErrors: { email?: string; password?: string } = {};
//     if (!formData.email) {
//       validationErrors.email = 'Email is required';
//     }
//     if (!formData.password) {
//       validationErrors.password = 'Password is required';
//     }

//     if (Object.keys(validationErrors).length) {
//       setErrors(validationErrors);
//       return;
//     }

//     setIsSubmitting(true);
//     setErrors({});

//     const result = await signIn('credentials', {
//       email: formData.email,
//       password: formData.password,
//       redirect: false,
//       callbackUrl,
//     });

//     if (result?.error) {
//       const message = result.error || 'Unable to sign in.';
//       setErrors({ form: message });
//       toast.error(message);
//     } else {
//       toast.success('Signed in successfully');
//       router.push(result?.url || callbackUrl);
//     }

//     setIsSubmitting(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-200 overflow-hidden relative p-4">
//       { }
//       <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-200/20 rounded-full blur-3xl pointer-events-none" />
//       <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

//       { }
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden w-full  lg: max-w-[95%] xl:max-w-7xl h-[85vh] lg:h-[800px] z-10"
//       >
//         { }
//         <div className="w-full lg:w-[65%] relative h-1/3 lg:h-full group overflow-hidden">
//           { }
//           <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60 z-10 lg:hidden" />

//           <Image
//             width={1000}
//             height={1000}
//             src="/static/loginpagebanner.png"
//             alt="Login Banner"
//             priority
//             className="w-full h-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-105"
//           />

//           { }
//           <div className="absolute inset-0 z-20 lg:hidden flex items-end justify-center pb-8">
//             <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
//               Welcome Back
//             </h3>
//           </div>
//         </div>

//         { }
//         <div className="w-full lg:w-[35%] p-8 lg:p-12 flex flex-col justify-center h-full bg-white relative">
//           {/*Header*/}
//           <div className="mb-8 text-center">
//             <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">
//               Login
//             </h2>
//             <div className="h-1.5 w-12 bg-[#E31E24] mx-auto rounded-full" />
//             <p className="text-gray-500 text-sm mt-4 font-medium">
//               Enter your credentials to access your account
//             </p>
//           </div>

//           {/*Form*/}
//           <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full max-w-sm mx-auto">
//             <div className="space-y-4">
//               <InputField
//                 label="Email Address"
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 error={errors.email}
//               />

//               <InputField
//                 label="Password"
//                 type="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 error={errors.password}
//               />
//             </div>

//             { }
//             {errors.form && (
//               <motion.div
//                 initial={{ opacity: 0, height: 0 }}
//                 animate={{ opacity: 1, height: 'auto' }}
//                 className="p-3 bg-red-50 border border-red-100 rounded-lg"
//               >
//                 <p className="text-red-600 text-sm text-center font-medium">{errors.form}</p>
//               </motion.div>
//             )}

//             { }
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`
//                 w-full py-4 rounded-xl font-bold text-white tracking-wide shadow-lg flex items-center justify-center gap-2
//                 transition-all duration-300 transform
//                 ${isSubmitting
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-[#E31E24] hover:bg-red-700 hover:shadow-red-500/30 hover:-translate-y-0.5 active:scale-95'
//                 }
//               `}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="animate-spin" size={20} />
//                   <span>Signing In...</span>
//                 </>
//               ) : (
//                 'Sign In'
//               )}
//             </button>

//             { }
//             <div className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-100 mt-2">
//               <Link
//                 href="/forget-password"
//                 className="text-sm font-semibold text-gray-500 hover:text-[#E31E24] transition-colors"
//               >
//                 Forgot Password?
//               </Link>

//               <div className="text-sm text-gray-600">
//                 Don&apos;t have an account?{' '}
//                 <Link href="/register" className="text-[#E31E24] font-bold hover:underline ml-1">
//                   Register Now
//                 </Link>
//               </div>
//             </div>
//           </form>
//         </div>
//       </motion.div>

//       {/*HomeBtn*/}
//       <Link
//         href="/"
//         title="Back to Home"
//         className="fixed top-6 right-6 p-4 bg-white/90 backdrop-blur text-[#E31E24] border border-red-100 rounded-full shadow-lg hover:bg-[#E31E24] hover:text-white transition-all duration-300 transform hover:scale-110 z-50 group"
//       >
//         <Home size={24} className="group-hover:animate-pulse" />
//       </Link>
//     </div>
//   );
// };

// export default LoginPageComponent;

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

  // Admin dashboard
  if (path.startsWith('/dashboard')) return role === 'admin' || role === 'superadmin';

  if (path.startsWith('/driver-dashboard')) return role === 'driver';

  // Public / other routes: allow
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

  // If next-auth gives absolute URL, convert to pathname
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      return u.pathname + (u.search || '');
    }
  } catch {
    // ignore
  }

  // Ensure it starts with /
  if (!raw.startsWith('/')) return `/${raw}`;
  return raw;
}

const LoginPageComponent = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // keep your callbackUrl support, but we will enforce role access after login
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
        // keep it, but final navigation will be decided by role below
        callbackUrl: callbackUrl || '/dashboard',
      });

      if (result?.error) {
        const message = result.error || 'Unable to sign in.';
        setErrors({ form: message });
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      // Pull session after successful sign-in (important for role-based routing)
      const session = await getSession();
      const role = (session?.user as { role?: UserRole })?.role as UserRole | undefined;

      const safeDefault = defaultRouteForRole(role);

      // If callbackUrl exists AND role is allowed to access it, keep it.
      // Otherwise redirect to the role’s default dashboard.
      const nextPath =
        callbackUrl && isRoleAllowedForPath(role, callbackUrl) ? callbackUrl : safeDefault;

      toast.success('Signed in successfully');
      router.replace(nextPath);
    } catch (err: unknown) {
      let message = 'Sign in failed (network error).';
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as Record<string, unknown>).message === 'string'
      ) {
        message = (err as { message: string }).message;
      }
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-200 overflow-hidden relative">
      {/* blobs */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row bg-white/80 backdrop-blur-xl border-none rounded-none   shadow-none lg:shadow-2xl overflow-hidden w-full   h-screen z-10"
      >
        {/* Left banner */}
        <div className="w-full lg:w-[65%] relative h-1/3 lg:h-full group overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60 z-10 lg:hidden" />

          <Image
            width={1000}
            height={1000}
            src="/static/loginpagebanner.png"
            alt="Login Banner"
            priority
            className="w-full h-full object-cover transition-transform duration-[2s] ease-in-out group-hover:scale-105"
          />

          <div className="absolute inset-0 z-20 lg:hidden flex items-end justify-center pb-8">
            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              Welcome Back
            </h3>
          </div>
        </div>

        {/* Right glass box */}
        <div className="w-full lg:w-[35%] p-8 lg:p-12 flex flex-col justify-center h-full bg-white relative">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block mb-4">
              <Image src="/static/logo.png" alt="Logo" width={80} height={80} className="mx-auto" />
            </Link>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">
              Login
            </h2>
            <div className="h-1.5 w-12 bg-[#E31E24] mx-auto rounded-full" />
            <p className="text-gray-500 text-sm mt-4 font-medium">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full max-w-sm mx-auto">
            <div className="space-y-4">
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
            </div>

            {errors.form && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border border-red-100 rounded-lg"
              >
                <p className="text-red-600 text-sm text-center font-medium">{errors.form}</p>
              </motion.div>
            )}

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
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-100 mt-2">
              <Link
                href="/forget-password"
                className="text-sm font-semibold text-gray-500 hover:text-[#E31E24] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Home button */}
      <Link
        href="/"
        title="Back to Home"
        className="fixed top-6 right-6 p-4 bg-white/90 backdrop-blur text-[#E31E24] border border-red-100 rounded-full shadow-lg hover:bg-[#E31E24] hover:text-white transition-all duration-300 transform hover:scale-110 z-50 group"
      >
        <Home size={24} className="group-hover:animate-pulse" />
      </Link>
    </div>
  );
};

export default LoginPageComponent;
