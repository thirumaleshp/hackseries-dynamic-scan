import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { walletService, WalletAccount } from '../services/wallet-service';

interface WalletConnectionProps {
  onConnect?: (account: WalletAccount) => void;
  onDisconnect?: () => void;
  showBalance?: boolean;
  className?: string;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnect,
  onDisconnect,
  showBalance = true,
  className = ''
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  // Check connection status on mount
  useEffect(() => {
    const connectedAccount = walletService.getConnectedAccount();
    if (connectedAccount) {
      setIsConnected(true);
      setAccount(connectedAccount);
      if (showBalance) {
        loadBalance(connectedAccount.address);
      }
    }
    
    // Get available wallets
    setAvailableWallets(walletService.getAvailableWallets());
  }, [showBalance]);

  const loadBalance = async (address: string) => {
    try {
      const accountBalance = await walletService.getAccountBalance(address);
      setBalance(accountBalance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const connectWallet = async (provider: 'pera' | 'myalgo' = 'auto') => {
    try {
      setLoading(true);
      
      const result = await walletService.connectWallet(provider);
      
      if (result.success && result.account) {
        setIsConnected(true);
        setAccount(result.account);
        
        if (showBalance) {
          await loadBalance(result.account.address);
        }
        
        onConnect?.(result.account);
        toast.success(`🔗 Connected to ${result.account.provider} wallet!`);
      } else {
        toast.error(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletService.disconnectWallet();
      setIsConnected(false);
      setAccount(null);
      setBalance(0);
      onDisconnect?.();
      toast.success('🔌 Wallet disconnected');
    } catch (error) {
      console.error('Wallet disconnection error:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const formatBalance = (microAlgos: number): string => {
    const algos = microAlgos / 1000000;
    return algos.toFixed(4);
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (provider?: string): string => {
    switch (provider) {
      case 'pera':
        return '🔵';
      case 'myalgo':
        return '🟢';
      default:
        return '🔗';
    }
  };

  const getWalletName = (provider?: string): string => {
    switch (provider) {
      case 'pera':
        return 'Pera Wallet';
      case 'myalgo':
        return 'MyAlgo Wallet';
      default:
        return 'Algorand Wallet';
    }
  };

  if (isConnected && account) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-800">
                  {getWalletIcon(account.provider)} {getWalletName(account.provider)}
                </span>
                <span className="text-xs text-green-600">
                  {formatAddress(account.address)}
                </span>
              </div>
              {showBalance && (
                <div className="text-sm text-green-600">
                  Balance: {formatBalance(balance)} ALGO
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.open(`https://testnet.algoexplorer.io/address/${account.address}`, '_blank')}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
              title="View on AlgoExplorer"
            >
              <ExternalLink size={16} />
            </button>
            <button
              onClick={disconnectWallet}
              className="p-1 text-green-600 hover:text-green-800 transition-colors"
              title="Disconnect wallet"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-yellow-800">
              Wallet Not Connected
            </div>
            <div className="text-xs text-yellow-600">
              Connect your Algorand wallet to continue
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {availableWallets.length > 0 ? (
            availableWallets.map((wallet) => (
              <button
                key={wallet}
                onClick={() => connectWallet(wallet as 'pera' | 'myalgo')}
                disabled={loading}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
              >
                <Wallet size={14} />
                <span>{wallet === 'pera' ? 'Pera' : 'MyAlgo'}</span>
              </button>
            ))
          ) : (
            <div className="text-right">
              <div className="text-sm text-yellow-800 font-medium">No Wallets Found</div>
              <div className="text-xs text-yellow-600">
                Install{' '}
                <a
                  href="https://perawallet.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-800"
                >
                  Pera Wallet
                </a>{' '}
                or{' '}
                <a
                  href="https://wallet.myalgo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-800"
                >
                  MyAlgo Wallet
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {availableWallets.length === 0 && (
        <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
          <div className="text-sm text-yellow-800">
            <strong>To use this application:</strong>
          </div>
          <div className="text-xs text-yellow-700 mt-1 space-y-1">
            <div>1. Install Pera Wallet or MyAlgo Wallet</div>
            <div>2. Create/import a TestNet account</div>
            <div>3. Get TestNet ALGOs from the dispenser</div>
            <div>4. Refresh this page and connect your wallet</div>
          </div>
          <div className="flex space-x-2 mt-2">
            <a
              href="https://perawallet.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              Install Pera Wallet
            </a>
            <a
              href="https://testnet.algoexplorer.io/dispenser"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
            >
              Get TestNet ALGOs
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;