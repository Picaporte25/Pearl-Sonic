import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header({ user = null, credits = 0 }) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <header className="bg-[#2C2C2E]/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="window-buttons">
                <button className="window-button window-button-close" />
                <button className="window-button window-button-minimize" />
                <button className="window-button window-button-maximize" />
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="url(#gradient-logo)" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gradient-logo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FF5F57" />
                      <stop offset="50%" stopColor="#FEBC2E" />
                      <stop offset="100%" stopColor="#28C840" />
                    </linearGradient>
                  </defs>
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <span className="text-xl font-bold bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
                  Sound-Weaver
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          {user ? (
            <nav className="flex items-center space-x-6">
              <Link href="/generate">
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer font-medium">
                  Generate
                </span>
              </Link>
              <Link href="/history">
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer font-medium">
                  History
                </span>
              </Link>
              <Link href="/profile">
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer font-medium">
                  Profile
                </span>
              </Link>

              {/* Credits Display */}
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                </svg>
                <span className="font-semibold text-white">{credits}</span>
              </div>

              {/* Buy Credits Button */}
              <Link href="/checkout">
                <button className="btn-outline text-sm py-2 px-4">
                  + Credits
                </button>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Logout"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </nav>
          ) : (
            <nav className="flex items-center space-x-4">
              <Link href="/login">
                <span className="text-gray-400 hover:text-white transition-colors cursor-pointer font-medium">
                  Sign In
                </span>
              </Link>
              <Link href="/register">
                <button className="btn-primary text-sm py-2 px-4">
                  Sign Up
                </button>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
