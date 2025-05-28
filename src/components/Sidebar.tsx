import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, QrCode, ScanLine, Clock } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Generate QR', path: '/generate', icon: <QrCode size={20} /> },
    { name: 'Scan QR', path: '/scan', icon: <ScanLine size={20} /> },
    { name: 'History', path: '/history', icon: <Clock size={20} /> },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-500 text-white">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path d="M3 9l2.45-4.9A2 2 0 017.24 3h9.52a2 2 0 011.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">AlgoQR</span>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className={({ isActive }: { isActive: boolean }) =>
                isActive ? 'text-primary-500' : 'text-gray-500'
              }>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
          <div className="rounded-md bg-primary-50 p-3">
            <h4 className="font-medium text-primary-800">Connected to Algorand</h4>
            <p className="mt-1 text-xs text-primary-600">TestNet Network</p>
            <div className="mt-2 flex items-center text-xs">
              <div className="mr-2 h-2 w-2 rounded-full bg-success-500"></div>
              <span className="text-success-500">Active</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;