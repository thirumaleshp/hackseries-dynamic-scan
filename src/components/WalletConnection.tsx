import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Wallet, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  connectWallet, 
  disconnectWallet, 
  getConnectedAccount, 
  isWalletConnected,
  getAccountBalance,
  getNetworkStatus
} from '../services/algorand';

const WalletConnection: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  useEffect(() => {
    checkConnection();
    checkNetworkStatus();
  }, []);

  const checkConnection = async () => {
    const isConnected = isWalletConnected();
    const connectedAccount = getConnectedAccount();
    
    setConnected(isConnected);
    setAccount(connectedAccount);
    
    if (isConnected && connectedAccount) {
      try {
        const accountBalance = await getAccountBalance(connectedAccount);
        setBalance(accountBalance);
      } catch (error) {
        console.error('Failed to get balance:', error);
      }
    }
  };

  const checkNetworkStatus = async () => {
    try {
      const status = await getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error('Failed to get network status:', error);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      setConnected(true);
      
      const accountBalance = await getAccountBalance(connectedAccount);
      setBalance(accountBalance);
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error(`Failed to connect wallet: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setConnected(false);
    setAccount(null);
    setBalance(0);
    toast.success('Wallet disconnected');
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!connected) {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-warning-500/10">
              <AlertCircle className="h-5 w-5 text-warning-500" />
            </div>
            <div>
              <h3 className="font-medium">Wallet Not Connected</h3>
              <p className="text-sm text-gray-500">Connect your Algorand wallet to continue</p>
            </div>
          </div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </span>
            ) : (
              <>
                <Wallet size={16} className="mr-2" />
                Connect Wallet
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-success-500/10">
            <CheckCircle className="h-5 w-5 text-success-500" />
          </div>
          <div>
            <h3 className="font-medium">Wallet Connected</h3>
            <p className="text-sm text-gray-500">
              {formatAddress(account!)} • {balance.toFixed(2)} ALGO
            </p>
            {networkStatus && (
              <p className="text-xs text-gray-400">
                {networkStatus.connected ? (
                  `${networkStatus.network} • Block ${networkStatus.lastRound}`
                ) : (
                  'Network disconnected'
                )}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="btn-outline"
        >
          <LogOut size={16} className="mr-2" />
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default WalletConnection;