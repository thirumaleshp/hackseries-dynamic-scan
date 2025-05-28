import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - fixed on desktop, overlay on mobile */}
      <div className="fixed z-40 md:relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 md:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="container mx-auto px-4 py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;