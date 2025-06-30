import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, QrCode, ScanLine, Clock, Blockchain } from 'lucide-react';
import { isWalletConnected, getConnectedAccount } from '../services/algorand';

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

  const connected = isWalletConnected();
  const account = getConnectedAccount();

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
              <Blockchain size={20} />
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
          <div className={`rounded-md p-3 ${connected ? 'bg-primary-50' : 'bg-warning-50'}`}>
            <div className="flex items-center">
              <Blockchain className={`mr-2 h-4 w-4 ${connected ? 'text-primary-500' : 'text-warning-500'}`} />
              <h4 className={`font-medium ${connected ? 'text-primary-800' : 'text-warning-800'}`}>
                {connected ? 'Blockchain Connected' : 'Wallet Required'}
              </h4>
            </div>
            <p className={`mt-1 text-xs ${connected ? 'text-primary-600' : 'text-warning-600'}`}>
              {connected ? 'Algorand TestNet' : 'Connect wallet to use blockchain features'}
            </p>
            {connected && account && (
              <p className="mt-1 text-xs text-primary-600 font-mono">
                {account.substring(0, 8)}...{account.substring(account.length - 4)}
              </p>
            )}
            <div className="mt-2 flex items-center text-xs">
              <div className={`mr-2 h-2 w-2 rounded-full ${connected ? 'bg-success-500' : 'bg-warning-500'}`}></div>
              <span className={connected ? 'text-success-500' : 'text-warning-500'}>
                {connected ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;