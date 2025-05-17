import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import Button from "../ui/Button";
import ThemeSelector from "../ui/ThemeSelector";
// import PWAPrompt from "../PWAPrompt";

export default function MainLayout({ children }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-900 transition-colors duration-200">
      {/* <PWAPrompt /> */}
      <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 shadow-sm transition-colors duration-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <div className="flex justify-between h-16">
            {/* Logo and desktop navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-primary-600 dark:text-primary-400">CloneMe</Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-300 hover:border-surface-300 dark:hover:border-surface-600">
                  🏠 Generator
                </Link>
                <Link href="/voices"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-300 hover:border-surface-300 dark:hover:border-surface-600">
                  🎨 Voices
                </Link>
                <Link href="/settings"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-300 hover:border-surface-300 dark:hover:border-surface-600">
                  ⚙️ Settings
                </Link>
              </div>
            </div>

            {/* User menu and theme selector */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <ThemeSelector className="mr-4" />
              {!user ? (
                <Link href="/login" passHref>
                  <Button variant="primary" size="sm" icon={<span>🔐</span>}>
                    Login
                  </Button>
                </Link>
              ) : (
                <div className="ml-3 relative flex items-center space-x-4">
                  <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                    👤 {user.email}
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => signOut(auth)}
                    aria-label="Sign out"
                  >
                    Logout
                  </Button>
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
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-surface-600 hover:bg-surface-50 hover:border-surface-300 hover:text-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:border-surface-600 dark:hover:text-surface-300">
              🏠 Generator
            </Link>
            <Link href="/voices"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-surface-600 hover:bg-surface-50 hover:border-surface-300 hover:text-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:border-surface-600 dark:hover:text-surface-300">
              🎨 Voices
            </Link>
            <Link href="/settings"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-surface-600 hover:bg-surface-50 hover:border-surface-300 hover:text-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:border-surface-600 dark:hover:text-surface-300">
              ⚙️ Settings
            </Link>
          </div>

          {/* Theme selector for mobile */}
          <div className="pt-4 pb-3 border-t border-surface-200 dark:border-surface-700">
            <div className="px-4 mb-3">
              <p className="text-xs uppercase font-medium text-surface-500 dark:text-surface-400 mb-2">Theme</p>
              <ThemeSelector />
            </div>
          </div>
          
          {/* Mobile login or user info */}
          <div className="pt-4 pb-3 border-t border-surface-200 dark:border-surface-700">
            {!user ? (
              <div className="flex items-center px-4">
                <Link href="/login" className="block text-center w-full">
                  <Button className="w-full" variant="primary" icon={<span>🔐</span>}>
                    Login
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col px-4 space-y-3">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-base font-medium text-surface-800 dark:text-surface-200">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div>
                  <Button 
                    className="w-full" 
                    variant="secondary" 
                    onClick={() => signOut(auth)}
                    aria-label="Sign out"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-surface-500 dark:text-surface-400">
            © {new Date().getFullYear()} CloneMe - AI Email Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}