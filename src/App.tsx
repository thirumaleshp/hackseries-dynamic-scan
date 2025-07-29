import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css'; // Import Tailwind CSS

// Temporarily comment out the problematic import
// import Generate from './pages/Generate';

// Dynamic QR Generator - Creates blockchain-powered dynamic QR codes
function DynamicQRGenerator() {
  const [formData, setFormData] = React.useState({
    eventName: '',
    eventId: '',
    initialUrl: '',
    description: '',
    expiryDate: '',
    accessType: 'public' // public, nft-gated, time-based
  });
  const [qrValue, setQrValue] = React.useState('');
  const [generated, setGenerated] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Generate unique Event ID if not provided
  const generateEventId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${formData.eventName.replace(/\s+/g, '-').toUpperCase().substring(0, 10)}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventName || !formData.initialUrl) {
      alert('Please fill in Event Name and Initial URL');
      return;
    }
    
    setLoading(true);
    
    try {
      // Generate Event ID if not provided
      const eventId = formData.eventId || generateEventId();
      
      // Create static resolver URL (this never changes!)
      const resolverUrl = `https://dynaqr.resolver.com/resolve?event=${eventId}`;
      
      // Simulate Algorand smart contract deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store event data (in real app, this would go to Algorand smart contract)
      const eventData = {
        eventId,
        eventName: formData.eventName,
        currentUrl: formData.initialUrl,
        description: formData.description,
        accessType: formData.accessType,
        createdAt: new Date().toISOString(),
        expiryDate: formData.expiryDate,
        resolverUrl,
        transactionId: `ALGO_${eventId}_${Date.now()}`,
        blockHeight: Math.floor(Math.random() * 1000000) + 500000
      };
      
      // Store in localStorage (demo purposes - real app uses Algorand)
      const existingEvents = JSON.parse(localStorage.getItem('dynamicQREvents') || '{}');
      existingEvents[eventId] = eventData;
      localStorage.setItem('dynamicQREvents', JSON.stringify(existingEvents));
      
      setQrValue(resolverUrl);
      setFormData(prev => ({ ...prev, eventId }));
      setGenerated(true);
      
    } catch (error) {
      alert('Failed to create dynamic QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    // We'll implement actual QR code download here
    alert('QR Code download feature coming soon!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🔗 Dynamic QR Generator</h1>
        <p className="text-lg text-gray-600">
          Create QR codes with <strong>static URLs</strong> that can redirect to <strong>dynamic destinations</strong> 
          powered by Algorand blockchain smart contracts.
        </p>
      </div>

      {!generated ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Event Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., AlgoHack 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.eventId}
                  onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Auto-generated if empty"
                />
                <p className="text-xs text-gray-500 mt-1">Unique identifier for your event</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Redirect URL *
                </label>
                <input
                  type="url"
                  value={formData.initialUrl}
                  onChange={(e) => setFormData({...formData, initialUrl: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-event-website.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Where the QR code will redirect initially</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Brief description of your event"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Type
                </label>
                <select
                  value={formData.accessType}
                  onChange={(e) => setFormData({...formData, accessType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="public">🌐 Public Access</option>
                  <option value="nft-gated">🎫 NFT Gated</option>
                  <option value="time-based">⏰ Time-Based</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating on Algorand...
                  </>
                ) : (
                  '🚀 Create Dynamic QR Code'
                )}
              </button>
            </form>
          </div>

          {/* Info Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">✨ How Dynamic QR Works</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Static QR URL</h4>
                  <p className="text-sm text-gray-600">QR contains resolver URL that never changes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Algorand Storage</h4>
                  <p className="text-sm text-gray-600">Event mapping stored on blockchain</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Dynamic Redirect</h4>
                  <p className="text-sm text-gray-600">Update destination anytime via blockchain</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Perfect For:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Event programs & schedules</li>
                <li>• Conference live streams</li>
                <li>• Marketing campaigns</li>
                <li>• Product documentation</li>
                <li>• Dynamic landing pages</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Code Display */}
          <div className="bg-white p-6 rounded-lg shadow-md border text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">🎉 Dynamic QR Created!</h2>
            
            <div className="mb-6">
              <div className="w-64 h-64 bg-gray-100 mx-auto flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-500">QR Code Preview</p>
                  <p className="text-xs text-gray-400 mt-1">{formData.eventName}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={downloadQR}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📥 Download QR Code
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(qrValue)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📋 Copy Resolver URL
              </button>
              <button
                onClick={() => setGenerated(false)}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ➕ Create Another
              </button>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Event Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Event Name</label>
                <p className="text-lg font-semibold text-gray-900">{formData.eventName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Event ID</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{formData.eventId}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Static Resolver URL</label>
                <p className="text-sm font-mono bg-blue-50 p-2 rounded text-blue-800 break-all">{qrValue}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Current Redirect</label>
                <p className="text-sm text-gray-700 break-all">{formData.initialUrl}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Access Type</label>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  {formData.accessType === 'public' ? '🌐 Public' : 
                   formData.accessType === 'nft-gated' ? '🎫 NFT Gated' : '⏰ Time-Based'}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Blockchain Status</label>
                <p className="text-sm text-green-600 font-semibold">✅ Stored on Algorand TestNet</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">⚡ Next Steps:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>1. Print/share your QR code</li>
                <li>2. Go to "Manage Events" to update redirect URL</li>
                <li>3. Monitor scans in Analytics</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard for Dynamic QR System
function TestDashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🔗 Dynamic QR Resolver</h1>
        <p className="text-lg text-gray-600">
          Create QR codes that <strong>never break</strong>. Static URLs, dynamic destinations, powered by Algorand blockchain.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Events</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-sm text-gray-500">Dynamic QR codes</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Scans</h3>
          <p className="text-3xl font-bold text-green-600">1,847</p>
          <p className="text-sm text-gray-500">Successful redirects</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">URL Updates</h3>
          <p className="text-3xl font-bold text-purple-600">34</p>
          <p className="text-sm text-gray-500">Blockchain transactions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Network Status</h3>
          <p className="text-xl font-bold text-green-600">✅ Online</p>
          <p className="text-sm text-gray-500">Algorand TestNet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">🚀 Welcome to DynaQR</h2>
          <p className="text-gray-600 mb-6">
            Create QR codes that redirect to different destinations without ever changing the printed code. 
            Perfect for events, marketing campaigns, and dynamic content.
          </p>
          <div className="space-y-3">
            <Link 
              to="/generate" 
              className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🎯 Create Your First Dynamic QR
            </Link>
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>How it works:</strong></p>
              <ul className="space-y-1">
                <li>• QR contains static resolver URL</li>
                <li>• Algorand smart contract stores current destination</li>
                <li>• Update destination anytime via blockchain</li>
                <li>• Printed QR codes never become obsolete</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Recent Events</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">AlgoHack 2025</p>
                <p className="text-sm text-gray-500">ALGOHACK-2025-xyz123</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Active</span>
                <p className="text-xs text-gray-500 mt-1">247 scans</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Web3 Conference</p>
                <p className="text-sm text-gray-500">WEB3CONF-2025-abc789</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Updated</span>
                <p className="text-xs text-gray-500 mt-1">189 scans</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Marketing Campaign</p>
                <p className="text-sm text-gray-500">MARKETING-2025-def456</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Expiring</span>
                <p className="text-xs text-gray-500 mt-1">92 scans</p>
              </div>
            </div>
          </div>
          
          <Link 
            to="/history" 
            className="block w-full text-center mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View All Events →
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">✨ Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-2xl">🔗</span>
            </div>
            <h4 className="font-semibold text-gray-800">Static QR URLs</h4>
            <p className="text-sm text-gray-600">Print once, use forever. QR codes never break.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-800">Instant Updates</h4>
            <p className="text-sm text-gray-600">Change destinations in real-time via Algorand.</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-2xl">🛡️</span>
            </div>
            <h4 className="font-semibold text-gray-800">Blockchain Security</h4>
            <p className="text-sm text-gray-600">Tamper-proof, transparent, and decentralized.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestScan() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 QR Code Resolver</h1>
        <p className="text-gray-600">
          Test the dynamic QR resolver system. Enter an event ID to see how the system resolves destinations.
        </p>
      </div>

      {/* Resolver Test Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔗 Test Resolver</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Event ID to resolve:
              </label>
              <input
                type="text"
                placeholder="e.g., ALGOHACK-2025-xyz123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              🔍 Resolve Destination
            </button>
            
            {/* Mock Resolution Result */}
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">✅ Resolution Successful</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Event:</strong> AlgoHack 2025 Hackathon</p>
                <p><strong>Current URL:</strong> 
                  <a href="#" className="text-blue-600 hover:text-blue-800 ml-1">
                    https://algohack2025.com/registration
                  </a>
                </p>
                <p><strong>Access Type:</strong> Public</p>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Last Updated:</strong> 2 minutes ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">📱 QR Scanner</h2>
          <div className="bg-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center mb-4">
            <div className="text-gray-500 mb-4">
              <div className="text-6xl mb-2">📷</div>
              <p>Camera view would appear here</p>
              <p className="text-sm">Scan DynaQR codes to test resolution</p>
            </div>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              📸 Start Camera
            </button>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Supports standard QR codes</p>
            <p>• Automatically detects DynaQR resolver URLs</p>
            <p>• Shows resolution status and destination</p>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">⚡ System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2">🟢</div>
            <h3 className="font-semibold text-gray-800">Resolver API</h3>
            <p className="text-sm text-green-600">Online • 99.9% uptime</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-semibold text-gray-800">Algorand Network</h3>
            <p className="text-sm text-green-600">Connected • TestNet</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-800">Response Time</h3>
            <p className="text-sm text-blue-600">~245ms average</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔄 How Dynamic Resolution Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-xl">📱</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">1. Scan QR</h3>
            <p className="text-xs text-gray-600">User scans printed QR code</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-xl">🔍</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">2. Resolver API</h3>
            <p className="text-xs text-gray-600">System queries event ID</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-xl">⛓️</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">3. Blockchain Lookup</h3>
            <p className="text-xs text-gray-600">Algorand smart contract queried</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
              <span className="text-xl">↗️</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">4. Redirect</h3>
            <p className="text-xs text-gray-600">User sent to current destination</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h3 className="font-semibold text-gray-700 mb-2">📋 Example Resolver URL</h3>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded border">
            https://dynaQR.resolve/ALGOHACK-2025-xyz123
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This static URL is what gets encoded in the QR code. The destination it resolves to can be updated anytime via the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}

function TestHistory() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Event Management</h1>
        <p className="text-gray-600">Manage all your dynamic QR events and track their performance.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Events</h3>
          <p className="text-2xl font-bold text-gray-900">27</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Active Now</h3>
          <p className="text-2xl font-bold text-green-600">12</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Scans</h3>
          <p className="text-2xl font-bold text-blue-600">2,194</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Avg. Scans/Event</h3>
          <p className="text-2xl font-bold text-purple-600">81</p>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">All Events</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scans</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">AlgoHack 2025 Hackathon</div>
                    <div className="text-sm text-gray-500">Created 2 days ago</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">ALGOHACK-2025-xyz123</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-blue-600 hover:text-blue-800">
                    <a href="#" className="truncate block max-w-xs">https://algohack2025.com/registration</a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Public</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">247</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Update</button>
                  <button className="text-gray-600 hover:text-gray-900">View QR</button>
                </td>
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Web3 Developer Conference</div>
                    <div className="text-sm text-gray-500">Created 5 days ago</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">WEB3CONF-2025-abc789</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-blue-600 hover:text-blue-800">
                    <a href="#" className="truncate block max-w-xs">https://web3dev2025.io/day2-schedule</a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Token Gated</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">189</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Updated</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Update</button>
                  <button className="text-gray-600 hover:text-gray-900">View QR</button>
                </td>
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Holiday Marketing Campaign</div>
                    <div className="text-sm text-gray-500">Created 1 week ago</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">MARKETING-2025-def456</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-blue-600 hover:text-blue-800">
                    <a href="#" className="truncate block max-w-xs">https://shop.example.com/holiday-sale</a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Public</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">92</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Expiring</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Extend</button>
                  <button className="text-gray-600 hover:text-gray-900">View QR</button>
                </td>
              </tr>
              
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Product Launch Event</div>
                    <div className="text-sm text-gray-500">Created 3 weeks ago</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">LAUNCH-2024-ghi789</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-400">
                    <span className="truncate block max-w-xs">Event ended</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Public</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">456</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Expired</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-gray-400 cursor-not-allowed mr-3">Update</button>
                  <button className="text-gray-600 hover:text-gray-900">Archive</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Scan Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Today</span>
              <span className="text-sm font-semibold">47 scans</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-sm font-semibold">312 scans</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-semibold">1,847 scans</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Peak Hour</span>
              <span className="text-sm font-semibold">2-3 PM (34 scans/hr)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚡ Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">AlgoHack 2025 URL updated</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">New event "DeFi Summit" created</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Marketing Campaign extended</p>
                <p className="text-xs text-gray-500">3 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">47 QR code scans in the last hour</p>
                <p className="text-xs text-gray-500">Ongoing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  console.log('App component rendering with enhanced UI...');
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">🔗 DynaQR</h1>
                <span className="ml-2 text-sm text-gray-500">Dynamic QR Resolver</span>
              </div>
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
                <Link to="/generate" className="text-gray-600 hover:text-gray-900 font-medium">Create QR</Link>
                <Link to="/scan" className="text-gray-600 hover:text-gray-900 font-medium">Test Scan</Link>
                <Link to="/history" className="text-gray-600 hover:text-gray-900 font-medium">Manage Events</Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="py-8">
          <Routes>
            <Route path="/" element={<TestDashboard />} />
            <Route path="/generate" element={<DynamicQRGenerator />} />
            <Route path="/scan" element={<TestScan />} />
            <Route path="/history" element={<TestHistory />} />
            <Route path="*" element={<div className="text-center py-12">Page not found</div>} />
          </Routes>
        </main>
        
        <Toaster 
          position="top-right"
          richColors
          expand
          closeButton
        />
      </div>
    </Router>
  );
}

export default App;