import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <header className="bg-white border-b border-surface-200 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between h-16">
            {/* Logo and desktop navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-primary-600">CloneMe</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-surface-600 hover:text-surface-800 hover:border-surface-300">
                  🏠 Generator
                </Link>
                <Link href="/tones"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-surface-600 hover:text-surface-800 hover:border-surface-300">
                  🎨 Tones
                </Link>
                <Link href="/settings"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-surface-600 hover:text-surface-800 hover:border-surface-300">
                  ⚙️ Settings
                </Link>
              </div>
            </div>

            {/* User menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {!user ? (
                <Link href="/login" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  🔐 Login
                </Link>
              ) : (
                <div className="ml-3 relative flex items-center space-x-4">
                  <span className="text-sm font-medium text-surface-600">
                    👤 {user.email}
                  </span>
                  <button
                    onClick={() => signOut(auth)}
                    className="bg-surface-200 text-surface-800 hover:bg-surface-300"
                    aria-label="Sign out">
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-surface-400 hover:text-surface-500 hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded={mobileMenuOpen}
                aria-label="Open main menu"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-surface-600 hover:bg-surface-50 hover:border-surface-300 hover:text-surface-800">
              🏠 Generator
            </Link>
            <Link href="/tones"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-surface-600 hover:bg-surface-50 hover:border-surface-300 hover:text-surface-800">
              🎨 Tones
            </Link>
            <Link href="/settings"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-surface-600 hover:bg-surface-50 hover:border-surface-300 hover:text-surface-800">
              ⚙️ Settings
            </Link>
          </div>

          {/* Mobile login or user info */}
          <div className="pt-4 pb-3 border-t border-surface-200">
            {!user ? (
              <div className="flex items-center px-4">
                <Link href="/login" 
                  className="block text-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  🔐 Login
                </Link>
              </div>
            ) : (
              <div className="flex flex-col px-4 space-y-3">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-base font-medium text-surface-800">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => signOut(auth)}
                    className="bg-surface-200 text-surface-800 hover:bg-surface-300 w-full"
                    aria-label="Sign out">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-surface-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-surface-500">
            © {new Date().getFullYear()} CloneMe - AI Email Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}