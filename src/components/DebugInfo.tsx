import { useState, useEffect } from 'react';

const DebugInfo = () => {
  const [algorandStatus, setAlgorandStatus] = useState('Checking...');
  const [environment, setEnvironment] = useState('Unknown');
  
  useEffect(() => {
    const checkAlgorand = async () => {
      try {
        // Import the service instance
        const { dynaQRService } = await import('../services/algorand');
        const status = await dynaQRService.getNetworkStatus();
        setAlgorandStatus(`${status.status} (Block: ${status.blockHeight}, ${status.responseTime}ms)`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setAlgorandStatus(`Error: ${errorMessage}`);
      }
    };

    // Detect environment
    const detectEnvironment = () => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setEnvironment('Development');
      } else if (window.location.hostname.includes('vercel.app')) {
        setEnvironment('Production (Vercel)');
      } else {
        setEnvironment('Production');
      }
    };
    
    checkAlgorand();
    detectEnvironment();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-sm max-w-xs">
      <h3 className="font-semibold mb-2">🔧 Debug Info</h3>
      <div className="space-y-1 text-xs">
        <div><strong>Environment:</strong> {environment}</div>
        <div><strong>Algorand:</strong> {algorandStatus}</div>
        <div><strong>React:</strong> <span className="text-green-600">Working ✅</span></div>
        <div><strong>Tailwind:</strong> <span className="text-blue-500">Working ✅</span></div>
        <div><strong>Domain:</strong> {window.location.hostname}</div>
      </div>
    </div>
  );
};

export default DebugInfo;
