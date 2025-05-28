import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center py-16 text-center">
      <div className="mb-8 text-9xl font-bold text-gray-200">404</div>
      <h1 className="mb-4 text-4xl font-bold">Page Not Found</h1>
      <p className="mb-8 max-w-md text-gray-600">
        The page you're looking for doesn't seem to exist. Please check the URL or go back to the
        dashboard.
      </p>
      <Link to="/" className="btn-primary">
        <Home size={16} className="mr-2" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;