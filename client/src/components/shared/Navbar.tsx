'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useIntro } from '@/context/IntroContext';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { isIntroActive } = useIntro();
  const { data: session, status } = useSession();
  const pathName = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (isIntroActive) return null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    if (pathName && pathName.startsWith('/dashboard')) {
      router.push('/');
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

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

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-red-600">Campus Connect</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/home" className={getLinkClasses('/home')}>Home</Link>
          <Link href="/routes" className={getLinkClasses('/routes')}>Routes</Link>
          <Link href="/schedules" className={getLinkClasses('/schedules')}>Schedules</Link>
          <Link href="/buses" className={getLinkClasses('/buses')}>Buses</Link>
          <Link href="/transport" className={getLinkClasses('/transport')}>Transportation Pool</Link>
          <Link href="/about" className={getLinkClasses('/about')}>About Us</Link>
          <Link href="/contact" className={getLinkClasses('/contact')}>Contact Us</Link>

          {/* Auth */}
          {status === 'loading' ? null : !session?.user ? (
            <Link href="/login" className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
              Log In
            </Link>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition">
                <span className="text-red-700 font-medium">{session?.user?.name}</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition">
                <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-red-50">
                  Profile
                </Link>
                <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-red-50">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50">
                  Log Out
                </button>
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
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${menuOpen ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
      >
        {/* Overlay */}
        <div
          onClick={toggleMenu}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        ></div>

        {/* Slide Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6 flex flex-col gap-3 transform transition-transform duration-500 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {/* Fixed Close Button inside menu */}
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 text-red-600 hover:text-red-700"
          >
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

          {/* Auth Section */}
          <div className="mt-4 pt-4 border-t">
            {status === 'loading' ? null : !session?.user ? (
              <Link
                href="/login"
                onClick={toggleMenu}
                className="block text-center px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
              >
                Log In
              </Link>
            ) : (
              <>
                <Link href="/profile" onClick={toggleMenu} className="block py-2 text-gray-700 hover:text-red-600">
                  Profile
                </Link>
                <Link href="/dashboard" onClick={toggleMenu} className="block py-2 text-gray-700 hover:text-red-600">
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    toggleMenu();
                    handleLogout();
                  }}
                  className="text-left py-2 text-gray-700 hover:text-red-600"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
