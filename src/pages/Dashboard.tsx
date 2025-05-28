import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ScanLine, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock data for dashboard stats and recent activity
  const stats = [
    { label: 'Total QR Codes', value: 24, icon: <QrCode className="text-primary-500" /> },
    { label: 'Total Scans', value: 142, icon: <ScanLine className="text-secondary-500" /> },
    { label: 'Pending Verifications', value: 3, icon: <AlertCircle className="text-warning-500" /> },
    { label: 'Verified Scans', value: 139, icon: <CheckCircle className="text-success-500" /> },
  ];

  const recentActivity = [
    { id: 1, type: 'scan', code: 'ALGO-QR-001', timestamp: '2 minutes ago', status: 'verified' },
    { id: 2, type: 'generation', code: 'ALGO-QR-024', timestamp: '10 minutes ago', status: 'pending' },
    { id: 3, type: 'scan', code: 'ALGO-QR-018', timestamp: '1 hour ago', status: 'verified' },
    { id: 4, type: 'scan', code: 'ALGO-QR-022', timestamp: '3 hours ago', status: 'verified' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-baseline justify-between">
        <h1>Dashboard</h1>
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-primary-500">Algorand TestNet</span> connected
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/generate"
          className="card flex items-center p-6 transition-all hover:border-primary-500 hover:bg-primary-50"
        >
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <QrCode className="h-6 w-6 text-primary-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">Generate QR Code</h3>
            <p className="text-sm text-gray-500">Create a new blockchain-verified QR code</p>
          </div>
          <ArrowRight className="h-5 w-5 text-primary-500" />
        </Link>

        <Link
          to="/scan"
          className="card flex items-center p-6 transition-all hover:border-secondary-500 hover:bg-secondary-50"
        >
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100">
            <ScanLine className="h-6 w-6 text-secondary-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">Scan QR Code</h3>
            <p className="text-sm text-gray-500">Verify a QR code on the blockchain</p>
          </div>
          <ArrowRight className="h-5 w-5 text-secondary-500" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="card overflow-hidden">
            <div className="p-6">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                {stat.icon}
              </div>
              <div className="mt-4 text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
            <div className="h-1 w-full bg-gray-100">
              <div
                className={`h-full ${
                  index === 0
                    ? 'bg-primary-500'
                    : index === 1
                    ? 'bg-secondary-500'
                    : index === 2
                    ? 'bg-warning-500'
                    : 'bg-success-500'
                }`}
                style={{ width: `${(stat.value / 200) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-medium">Recent Activity</h2>
          <Link to="/history" className="text-sm font-medium text-primary-500 hover:text-primary-600">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center p-4 hover:bg-gray-50">
              <div
                className={`mr-4 flex h-10 w-10 items-center justify-center rounded-full ${
                  activity.type === 'scan'
                    ? activity.status === 'verified'
                      ? 'bg-success-100 text-success-500'
                      : 'bg-warning-100 text-warning-500'
                    : 'bg-primary-100 text-primary-500'
                }`}
              >
                {activity.type === 'scan' ? (
                  activity.status === 'verified' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )
                ) : (
                  <QrCode size={20} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {activity.type === 'scan'
                    ? `QR Code ${activity.code} was scanned`
                    : `QR Code ${activity.code} was generated`}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  {activity.timestamp}
                </div>
              </div>
              {activity.status === 'verified' ? (
                <span className="badge-success">Verified</span>
              ) : (
                <span className="badge-warning">Pending</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;