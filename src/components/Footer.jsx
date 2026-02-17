import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#111111]/80 backdrop-blur-xl border-t border-[#333333] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="window-buttons">
              <button className="window-button window-button-close" />
              <button className="window-button window-button-minimize" />
              <button className="window-button window-button-maximize" />
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="url(#gradient-footer)" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#06B6D4" />
                  </linearGradient>
                </defs>
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <span className="text-sm text-white font-medium ml-2">Pearl-Sonic</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex space-x-6 text-sm">
            <Link href="/about">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer font-medium">
                About
              </span>
            </Link>
            <Link href="/terms">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer font-medium">
                Terms
              </span>
            </Link>
            <Link href="/privacy">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer font-medium">
                Privacy
              </span>
            </Link>
            <Link href="/contact">
              <span className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer font-medium">
                Contact
              </span>
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Pearl-Sonic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
