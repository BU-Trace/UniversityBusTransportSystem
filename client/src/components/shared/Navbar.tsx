'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useIntro } from '@/context/IntroContext';
import { Menu, X, LayoutDashboard, LogOut, Home, Info, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NextImage from '../common/NextImage';
import logoImage from '../../../public/static/logo.png';
import Image from 'next/image';
import NotificationBell from '../NotificationBell';
import { useUser } from '@/context/UserContext';

export default function Navbar() {
  const { isIntroActive } = useIntro();
  const { data: session, status } = useSession();
  const { user: ctxUser } = useUser();
  const pathName = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);

  useEffect(() => {
    console.log('Session Status:', status);
    console.log('Session Data:', session);
  }, [session, status]);

  if (isIntroActive) return null;

  const handleLogout = async () => {
    localStorage.removeItem('token');
    await signOut({ callbackUrl: '/' });
  };

  const getDashboardLink = () => {
    const role = session?.user?.role;
    if (role === 'driver') return '/driver-dashboard';
    return '/dashboard';
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const getUserInitial = () => {
    return session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U';
  };

  const getLinkClasses = (href: string): string => {
    const isActive = pathName === href;
    const isHomeActive = href === '/' && pathName === '/';

    return isActive || isHomeActive
      ? 'text-brick-500 font-bold transition border-b-2 border-brick-500'
      : 'text-gray-300 hover:text-brick-400 font-medium transition';
  };

  const getMobileLinkClasses = (href: string): string => {
    const isActive = pathName === href;
    const isHomeActive = href === '/' && pathName === '/';

    return isActive || isHomeActive
      ? 'text-brick-500 font-bold border-l-4 border-brick-500 pl-3 py-2 bg-white/5'
      : 'text-gray-300 hover:text-brick-400 hover:bg-white/5 py-2 pl-3';
  };

  return (
    <header className="w-full bg-linear-to-b from-gray-900 to-gray-800 border-b border-white/10 fixed left-0 right-0 top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 lg:px-4 h-16">
        {/* ================= LOGO SECTION ================= */}
        <Link href="/" className="flex items-center   group">
          <NextImage width={40} height={40} alt="Logo" image={logoImage} />
          <h1 className="text-xl text-white font-extrabold tracking-tighter italic">
            BU<span className="text-brick-600">TRACE</span>
          </h1>
        </Link>

        {/* ================= DESKTOP MENU ================= */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={getLinkClasses('/')}>
              <span className="flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                Home
              </span>
            </Link>

            <Link href="/about" className={getLinkClasses('/about')}>
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                About
              </span>
            </Link>
            <Link href="/contact" className={getLinkClasses('/contact')}>
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                Contact Us
              </span>
            </Link>

            {/* ================= AUTH SECTION (UPDATED) ================= */}
            {status === 'loading' ? (
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            ) : !session?.user ? (
              <Link
                href="/login"
                className="px-4 py-2 bg-brick-600 text-white rounded-full hover:bg-brick-700 transition font-bold"
              >
                Log In
              </Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center justify-center focus:outline-none transition-transform active:scale-95">
                  {session.user.image ||
                  session.user.photoUrl ||
                  session.user.profileImage ||
                  ctxUser?.profileImage ? (
                    <Image
                      width={40}
                      height={40}
                      src={
                        (session.user.image ||
                          session.user.photoUrl ||
                          session.user.profileImage ||
                          ctxUser?.profileImage) as string
                      }
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-white/20 hover:border-brick-500 transition"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-brick-600 flex items-center justify-center text-white text-lg font-bold border-2 border-white/10 hover:bg-brick-700 transition shadow-sm">
                      {getUserInitial()}
                    </div>
                  )}
                </button>

                {/* DROPDOWN MENU */}
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-white/10 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transform group-hover:translate-y-0 translate-y-2 transition-all duration-200 ease-in-out z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-900/50 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                  </div>
                  <div className="py-1">
                    {(session.user.role === 'driver' ||
                      session.user.role === 'admin' ||
                      session.user.role === 'superadmin') && (
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-brick-400 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-brick-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <button className="md:hidden flex items-center text-brick-500" onClick={toggleMenu}>
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* ================= MOBILE SLIDE MENU ================= */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-linear-to-b from-gray-900 to-gray-800 shadow-xl p-6 flex flex-col gap-3 z-50 md:hidden"
            >
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 text-brick-500 hover:text-brick-400"
              >
                <X size={26} />
              </button>

              <div className="mt-8 space-y-2">
                <Link href="/" onClick={toggleMenu} className={getMobileLinkClasses('/')}>
                  <span className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Home
                  </span>
                </Link>

                <Link href="/about" onClick={toggleMenu} className={getMobileLinkClasses('/about')}>
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    About
                  </span>
                </Link>
                <Link
                  href="/contact"
                  onClick={toggleMenu}
                  className={getMobileLinkClasses('/contact')}
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Us
                  </span>
                </Link>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                {!session?.user ? (
                  <Link
                    href="/login"
                    onClick={toggleMenu}
                    className="block text-center px-4 py-3 bg-brick-600 text-white rounded-xl hover:bg-brick-700 transition font-bold shadow-lg"
                  >
                    Log In
                  </Link>
                ) : (
                  <div>
                    <button
                      onClick={() => setMobileUserMenuOpen(!mobileUserMenuOpen)}
                      className="flex items-center justify-between w-full px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brick-600 text-white flex items-center justify-center font-bold text-sm">
                          {getUserInitial()}
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-gray-200 text-sm">
                            {session.user.name}
                          </span>
                          <span className="text-xs text-gray-400 truncate max-w-[150px]">
                            {session.user.email}
                          </span>
                        </div>
                      </div>
                      <X
                        className={`w-4 h-4 text-gray-500 transition-transform ${mobileUserMenuOpen ? 'rotate-90' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {mobileUserMenuOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-white/5 rounded-xl mt-2"
                        >
                          <div className="py-2">
                            {(session.user.role === 'driver' ||
                              session.user.role === 'admin' ||
                              session.user.role === 'superadmin') && (
                              <Link
                                href={getDashboardLink()}
                                onClick={toggleMenu}
                                className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:text-brick-400 transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4 mr-3" />
                                Dashboard
                              </Link>
                            )}
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2.5 text-sm text-gray-300 hover:text-brick-400 transition-colors text-left"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Log Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
