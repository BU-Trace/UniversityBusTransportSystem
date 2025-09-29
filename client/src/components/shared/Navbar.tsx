"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { logOutUser } from "@/services/AuthServices";

export default function Navbar() {
  const { user, setIsLoading } = useUser();
  const pathName = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logOutUser();
    setIsLoading(true);
    if (pathName && pathName.startsWith("/dashboard")) {
      router.push("/");
    }
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link href={"/"} className="flex items-center gap-2">
          {/*<img*/}
          {/*  src="/logo.png"*/}
          {/*  alt="Bus Schedule Logo"*/}
          {/*  className="h-10 w-10 object-contain"*/}
          {/*/>*/}
          <span className="text-xl font-bold text-gray-800">
            Campus Connect
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 mx-4 hidden sm:flex">
          <input
            type="text"
            placeholder="Search routes, buses..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>

        {/* Navigation links */}
        <nav className="flex items-center gap-3">
          <Link href="/routes" className="text-gray-700 hover:text-gray-800">
            Routes
          </Link>
          <Link href="/schedules" className="text-gray-700 hover:text-gray-800">
            Schedules
          </Link>


          {/* User actions */}
          {!user ? (
            <Link
              href="/login"
              className="px-2 py-1 text-white bg-black   hover:bg-gray-900 transition"
            >
              Log In
            </Link>
          ) : (
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                <span>{user.name}</span>
                {/*<img*/}
                {/*  src={user.profileImage || "/default-avatar.png"}*/}
                {/*  alt={user.name}*/}
                {/*  className="w-8 h-8 rounded-full object-cover"*/}
                {/*/>*/}
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden hidden group-hover:block">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile Search & Menu */}
      <div className="sm:hidden px-4 py-2">
        <input
          type="text"
          placeholder="Search routes, buses..."
          className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </header>
  );
}
