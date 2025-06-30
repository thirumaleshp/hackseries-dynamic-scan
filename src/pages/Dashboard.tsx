import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ScanLine, AlertCircle, CheckCircle, Clock, ArrowRight, Blockchain, Wallet } from 'lucide-react';
import { isWalletConnected, getConnectedAccount, getNetworkStatus, getAllQRCodes } from '../services/algorand';
import WalletConnection from '../components/WalletConnection';

const Dashboard: React.FC = () => {
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [qrCodes, setQrCodes] = useState<any>({});
  const [stats, setStats] = useState({
    totalQRCodes: 0,
    totalScans: 0,
    pendingVerifications: 0,
    verifiedScans: 0,
  });

  useEffect(() => {
    checkNetworkStatus();
    loadQRCodes();
  }, []);

  const checkNetworkStatus = async () => {
    try {
      const status = await getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error('Failed to get network status:', error);
    }
  };

  const loadQRCodes = () => {
    const codes = getAllQRCodes();
    setQrCodes(codes);
    
    // Calculate stats
    const totalCodes = Object.keys(codes).length;
    const totalScans = totalCodes * Math.floor(Math.random() * 10) + 5; // Simulated
    
    setStats({
      totalQRCodes: totalCodes,
      totalScans: totalScans,
      pendingVerifications: Math.floor(totalCodes * 0.1),
      verifiedScans: totalScans - Math.floor(totalCodes * 0.1),
    });
  };

  // Mock recent activity based on stored QR codes
  const recentActivity = Object.entries(qrCodes)
    .slice(-4)
    .map(([id, data]: [string, any], index) => ({
      id: index + 1,
      type: 'generation',
      code: id,
      label: data.label,
      timestamp: new Date(data.createdAt).toLocaleString(),
      status: 'verified',
      transactionId: data.transactionId,
    }))
    .reverse();

  const statsData = [
    { 
      label: 'Total QR Codes', 
      value: stats.totalQRCodes, 
      icon: <QrCode className="text-primary-500" />,
      color: 'primary'
    },
    { 
      label: 'Total Scans', 
      value: stats.totalScans, 
      icon: <ScanLine className="text-secondary-500" />,
      color: 'secondary'
    },
    { 
      label: 'Pending Verifications', 
      value: stats.pendingVerifications, 
      icon: <AlertCircle className="text-warning-500" />,
      color: 'warning'
    },
    { 
      label: 'Verified Scans', 
      value: stats.verifiedScans, 
      icon: <CheckCircle className="text-success-500" />,
      color: 'success'
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-baseline justify-between">
        <h1>Dashboard</h1>
        <div className="text-sm text-gray-500">
          {networkStatus?.connected ? (
            <span className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-success-500"></div>
              <span className="font-semibold text-primary-500">Algorand {networkStatus.network}</span> 
              <span className="ml-1">• Block {networkStatus.lastRound}</span>
            </span>
          ) : (
            <span className="flex items-center">
              <div className="mr-2 h-2 w-2 rounded-full bg-error-500"></div>
              <span className="text-error-500">Network Disconnected</span>
            </span>
          )}
        </div>
      </div>

      {/* Wallet Connection Status */}
      <WalletConnection />

      {/* Blockchain Status */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <Blockchain className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h3 className="font-medium">Blockchain Status</h3>
              <p className="text-sm text-gray-500">
                {networkStatus?.connected ? (
                  `Connected to Algorand ${networkStatus.network} • Latest block: ${networkStatus.lastRound}`
                ) : (
                  'Connecting to Algorand network...'
                )}
              </p>
            </div>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-medium ${
            networkStatus?.connected 
              ? 'bg-success-100 text-success-800' 
              : 'bg-warning-100 text-warning-800'
          }`}>
            {networkStatus?.connected ? 'Online' : 'Connecting'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/generate"
          className={`card flex items-center p-6 transition-all hover:border-primary-500 hover:bg-primary-50 ${
            !isWalletConnected() ? 'opacity-60' : ''
          }`}
        >
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <QrCode className="h-6 w-6 text-primary-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium">Generate QR Code</h3>
            <p className="text-sm text-gray-500">
              {isWalletConnected() 
                ? 'Create a new blockchain-verified QR code'
                : 'Connect wallet to create blockchain QR codes'
              }
            </p>
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
            <p className="text-sm text-gray-500">Verify a QR code on the Algorand blockchain</p>
          </div>
          <ArrowRight className="h-5 w-5 text-secondary-500" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
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
                  stat.color === 'primary'
                    ? 'bg-primary-500'
                    : stat.color === 'secondary'
                    ? 'bg-secondary-500'
                    : stat.color === 'warning'
                    ? 'bg-warning-500'
                    : 'bg-success-500'
                }`}
                style={{ width: `${Math.min((stat.value / 200) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-medium">Recent Blockchain Activity</h2>
          <Link to="/history" className="text-sm font-medium text-primary-500 hover:text-primary-600">
            View all
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 hover:bg-gray-50">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-500">
                  <QrCode size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    QR Code "{activity.label}" was created on blockchain
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-1" />
                    {activity.timestamp}
                    <span className="mx-2">•</span>
                    <span className="font-mono text-xs">{activity.transactionId}</span>
                  </div>
                </div>
                <span className="badge-success">Verified</span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <QrCode className="mx-auto mb-4 h-12 w-12 opacity-30" />
              <p>No blockchain activity yet</p>
              <p className="mt-1 text-sm">
                {isWalletConnected() 
                  ? 'Generate your first QR code to see activity here'
                  : 'Connect your wallet to start creating blockchain QR codes'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;