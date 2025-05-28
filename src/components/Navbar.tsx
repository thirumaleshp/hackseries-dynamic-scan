import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path d="M3 9l2.45-4.9A2 2 0 017.24 3h9.52a2 2 0 011.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">AlgoQR</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="relative rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Bell size={20} />
            <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-accent-500" />
          </button>
          <div className="h-8 w-8 overflow-hidden rounded-full bg-secondary-100">
            <User className="h-full w-full p-1 text-secondary-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;