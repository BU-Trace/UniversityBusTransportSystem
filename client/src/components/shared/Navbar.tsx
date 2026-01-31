'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useIntro } from '@/context/IntroContext';
import { Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import NextImage from '../common/NextImage';
import logoImage from '../../../public/static/logo.png';
import Image from 'next/image';

export default function Navbar() {
  const { isIntroActive } = useIntro();
  const { data: session, status } = useSession();
  const pathName = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Debugging: See if session is actually loading
  useEffect(() => {
    console.log("Session Status:", status);
    console.log("Session Data:", session);
  }, [session, status]);

  if (isIntroActive) return null;

  const handleLogout = async () => {
    // Clear local storage if you are using it manually
    localStorage.removeItem('token');
    await signOut({ callbackUrl: '/' });
  };

  const getDashboardLink = () => {
    // Optional: safe check if role exists
    const role = session?.user?.role;

    if (role === 'student') return '/student-dashboard';
    if (role === 'driver') return '/driver-dashboard';

    // Default for 'admin' (or if no role is found)
    return '/dashboard';
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Helper to get the first letter of the name
  const getUserInitial = () => {
    return session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U';
  };

  const getLinkClasses = (href: string): string => {
    const isActive = pathName === href;
    const isHomeActive = href === '/home' && pathName === '/';

    return isActive || isHomeActive
      ? 'text-red-600 font-bold transition border-b-2 border-red-600'
      : 'text-gray-700 hover:text-red-600 font-medium transition';
  };

  const getMobileLinkClasses = (href: string): string => {
    const isActive = pathName === href;
    const isHomeActive = href === '/home' && pathName === '/';

    return isActive || isHomeActive
      ? 'text-red-600 font-bold border-l-4 border-red-600 pl-3 py-2'
      : 'text-gray-700 hover:text-red-600 py-2 pl-3';
  };

  return (
    <header className="w-full bg-white border-b-2 border-red-600 fixed left-0 right-0 top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">

        {/* ================= LOGO SECTION ================= */}
        <Link href="/" className="flex items-center gap-2">
          {/* Fixed: Removed <span> wrapper and used {logoImage} variable correctly */}
          <NextImage width={60} height={60} alt='Logo' image={logoImage} />
        </Link>

        {/* ================= DESKTOP MENU ================= */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/home" className={getLinkClasses('/home')}>Home</Link>
          <Link href="/routes" className={getLinkClasses('/routes')}>Routes</Link>
          <Link href="/schedules" className={getLinkClasses('/schedules')}>Schedules</Link>
          <Link href="/buses" className={getLinkClasses('/buses')}>Buses</Link>
          <Link href="/transport" className={getLinkClasses('/transport')}>Pool</Link>
          <Link href="/about" className={getLinkClasses('/about')}>About</Link>
          <Link href="/contact" className={getLinkClasses('/contact')}>Contact</Link>

          {/* ================= AUTH SECTION (UPDATED) ================= */}
          {status === 'loading' ? (
            // Loading Skeleton
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          ) : !session?.user ? (
            // LOGGED OUT: Show Login Button
            <Link
              href="/login"
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
            >
              Log In
            </Link>
          ) : (
            // LOGGED IN: Show Round Icon with Initials
            <div className="relative group">
              <button className="flex items-center justify-center focus:outline-none transition-transform active:scale-95">
                {session.user.image ? (
                  // If user has an image, show it
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover border-2 border-red-100 hover:border-red-600 transition"
                  />
                ) : (
                  // If NO image, show Initials in Red Circle
                  <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white text-lg font-bold border-2 border-red-100 hover:bg-red-700 transition shadow-sm">
                    {getUserInitial()}
                  </div>
                )}
              </button>

              {/* DROPDOWN MENU (Shows on Hover) */}
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transform group-hover:translate-y-0 translate-y-2 transition-all duration-200 ease-in-out z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
                </div>
                <div className="py-1">
                  {session?.user?.role === 'student' && (
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  )}
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button className="md:hidden flex items-center text-red-600" onClick={toggleMenu}>
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* ================= MOBILE SLIDE MENU ================= */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${menuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div onClick={toggleMenu} className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"></div>
        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6 flex flex-col gap-3 transform transition-transform duration-500 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <button onClick={toggleMenu} className="absolute top-4 right-4 text-red-600 hover:text-red-700">
            <X size={26} />
          </button>

          {/* Links */}
          <Link href="/home" onClick={toggleMenu} className={getMobileLinkClasses('/home')}>Home</Link>
          <Link href="/routes" onClick={toggleMenu} className={getMobileLinkClasses('/routes')}>Routes</Link>
          <Link href="/schedules" onClick={toggleMenu} className={getMobileLinkClasses('/schedules')}>Schedules</Link>
          <Link href="/buses" onClick={toggleMenu} className={getMobileLinkClasses('/buses')}>Buses</Link>
          <Link href="/transport" onClick={toggleMenu} className={getMobileLinkClasses('/transport')}>Transportation Pool</Link>
          <Link href="/about" onClick={toggleMenu} className={getMobileLinkClasses('/about')}>About Us</Link>
          <Link href="/contact" onClick={toggleMenu} className={getMobileLinkClasses('/contact')}>Contact Us</Link>

          {/* Mobile Auth */}
          <div className="mt-4 pt-4 border-t">
            {status === 'loading' ? null : !session?.user ? (
              <Link href="/login" onClick={toggleMenu} className="block text-center px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
                Log In
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 mb-2 px-2">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                    {getUserInitial()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{session.user.name}</span>
                    <span className="text-xs text-gray-500">{session.user.email}</span>
                  </div>
                </div>
                {session?.user?.role === 'student' && (
                  <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                )}
                <Link
                  href={getDashboardLink()}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <button onClick={() => { toggleMenu(); handleLogout(); }} className="text-left py-2 text-gray-700 hover:text-red-600 w-full px-3">Log Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}