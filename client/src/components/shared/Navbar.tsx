"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { logOutUser } from "@/services/AuthServices";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, setIsLoading } = useUser();
  const pathName = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logOutUser();
    setIsLoading(true);
    if (pathName && pathName.startsWith("/dashboard")) {
      router.push("/");
    }
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="w-full bg-white border-b-2 border-red-600 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-red-600">
            Campus Connect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/routes"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Routes
          </Link>
          <Link
            href="/schedules"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Schedules
          </Link>
          <Link
            href="/about"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Contact Us
          </Link>

          {/* User actions */}
          {!user ? (
            <Link
              href="/login"
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
            >
              Log In
            </Link>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition">
                <span className="text-red-700 font-medium">{user.name}</span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible invisible transition">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center text-red-600"
          onClick={toggleMenu}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 flex flex-col space-y-1 px-4 py-3">
          <Link
            href="/routes"
            onClick={toggleMenu}
            className="text-gray-700 hover:text-red-600 py-2"
          >
            Routes
          </Link>
          <Link
            href="/schedules"
            onClick={toggleMenu}
            className="text-gray-700 hover:text-red-600 py-2"
          >
            Schedules
          </Link>
          <Link
            href="/about"
            onClick={toggleMenu}
            className="text-gray-700 hover:text-red-600 py-2"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            onClick={toggleMenu}
            className="text-gray-700 hover:text-red-600 py-2"
          >
            Contact Us
          </Link>

          {!user ? (
            <Link
              href="/login"
              onClick={toggleMenu}
              className="w-full text-center px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition mt-2"
            >
              Log In
            </Link>
          ) : (
            <>
              <Link
                href="/profile"
                onClick={toggleMenu}
                className="text-gray-700 hover:text-red-600 py-2"
              >
                Profile
              </Link>
              <Link
                href="/dashboard"
                onClick={toggleMenu}
                className="text-gray-700 hover:text-red-600 py-2"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  toggleMenu();
                  handleLogout();
                }}
                className="w-full text-left text-gray-700 hover:text-red-600 py-2"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
