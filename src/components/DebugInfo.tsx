import { useState, useEffect } from 'react';

const DebugInfo = () => {
  const [algorandStatus, setAlgorandStatus] = useState('Checking...');
  
  useEffect(() => {
    const checkAlgorand = async () => {
      try {
        // Dynamic import to avoid blocking
        const { getNetworkStatus } = await import('../services/algorand');
        const status = await getNetworkStatus();
        setAlgorandStatus(status.connected ? 'Connected' : 'Disconnected');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setAlgorandStatus(`Error: ${errorMessage}`);
      }
    };
    
    checkAlgorand();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-sm">
      <h3 className="font-semibold mb-2">Debug Info</h3>
      <div>Algorand Status: {algorandStatus}</div>
      <div>React: Working ✅</div>
      <div>Tailwind: <span className="text-blue-500">Working ✅</span></div>
    </div>
  );
};

export default DebugInfo;
