import algosdk from 'algosdk';

// Algorand network configuration
const ALGORAND_CONFIG = {
  server: 'https://testnet-api.algonode.cloud',
  port: '',
  token: '',
  network: 'testnet'
};

// Initialize Algorand client
export const algodClient = new algosdk.Algodv2(
  ALGORAND_CONFIG.token,
  ALGORAND_CONFIG.server,
  ALGORAND_CONFIG.port
);

export const indexerClient = new algosdk.Indexer(
  ALGORAND_CONFIG.token,
  'https://testnet-idx.algonode.cloud',
  ALGORAND_CONFIG.port
);

// Wallet connection interface
export interface WalletAccount {
  address: string;
  name?: string;
  provider?: 'pera' | 'myalgo';
  publicKey?: Uint8Array;
}

// Wallet connection result
export interface WalletConnectionResult {
  success: boolean;
  account?: WalletAccount;
  error?: string;
}

// Transaction signing result
export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class AlgorandWalletService {
  private connectedAccount: WalletAccount | null = null;
  private walletProvider: any = null;

  private async isOptedIn(address: string, appId: number): Promise<boolean> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      const localState = accountInfo['apps-local-state'] ?? [];
      return localState.some((entry: any) => entry.id === appId);
    } catch (error) {
      console.error('❌ Failed to check opt-in status:', error);
      return false;
    }
  }

  // Check if Pera Wallet is available
  private isPeraWalletAvailable(): boolean {
    return typeof window !== 'undefined' && (window as any).PeraWalletConnect;
  }

  // Check if MyAlgo is available
  private isMyAlgoAvailable(): boolean {
    return typeof window !== 'undefined' && (window as any).MyAlgoConnect;
  }

  // Connect to Pera Wallet
  async connectPeraWallet(): Promise<WalletConnectionResult> {
    try {
      if (!this.isPeraWalletAvailable()) {
        return {
          success: false,
          error: 'Pera Wallet is not installed. Please install it from https://perawallet.app/'
        };
      }

      const PeraWallet = (window as any).PeraWalletConnect;
      this.walletProvider = new PeraWallet({
        chainId: 416002, // Algorand TestNet
        network: 'testnet'
      });

      // Connect to wallet
      const accounts = await this.walletProvider.connect();
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        this.connectedAccount = {
          address: account,
          name: 'Pera Wallet Account',
          provider: 'pera'
        };

        console.log('🔗 Connected to Pera Wallet:', this.connectedAccount);
        return {
          success: true,
          account: this.connectedAccount
        };
      } else {
        return {
          success: false,
          error: 'No accounts found in Pera Wallet'
        };
      }
    } catch (error) {
      console.error('❌ Pera Wallet connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Pera Wallet'
      };
    }
  }

  // Connect to MyAlgo Wallet
  async connectMyAlgoWallet(): Promise<WalletConnectionResult> {
    try {
      if (!this.isMyAlgoAvailable()) {
        return {
          success: false,
          error: 'MyAlgo Wallet is not installed. Please install it from https://wallet.myalgo.com/'
        };
      }

      const MyAlgoConnect = (window as any).MyAlgoConnect;
      this.walletProvider = new MyAlgoConnect();

      // Connect to wallet
      const accounts = await this.walletProvider.connect();
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        this.connectedAccount = {
          address: account.address,
          name: account.name || 'MyAlgo Account',
          provider: 'myalgo',
          publicKey: account.publicKey
        };

        console.log('🔗 Connected to MyAlgo Wallet:', this.connectedAccount);
        return {
          success: true,
          account: this.connectedAccount
        };
      } else {
        return {
          success: false,
          error: 'No accounts found in MyAlgo Wallet'
        };
      }
    } catch (error) {
      console.error('❌ MyAlgo Wallet connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to MyAlgo Wallet'
      };
    }
  }

  // Connect to wallet (auto-detect or specify provider)
  async connectWallet(provider: 'pera' | 'myalgo' | 'auto' = 'auto'): Promise<WalletConnectionResult> {
    try {
      if (provider === 'auto') {
        // Try Pera Wallet first, then MyAlgo
        if (this.isPeraWalletAvailable()) {
          return await this.connectPeraWallet();
        } else if (this.isMyAlgoAvailable()) {
          return await this.connectMyAlgoWallet();
        } else {
          return {
            success: false,
            error: 'No supported wallets found. Please install Pera Wallet or MyAlgo Wallet.'
          };
        }
      } else if (provider === 'pera') {
        return await this.connectPeraWallet();
      } else if (provider === 'myalgo') {
        return await this.connectMyAlgoWallet();
      } else {
        return {
          success: false,
          error: 'Unsupported wallet provider'
        };
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    try {
      if (this.walletProvider && this.walletProvider.disconnect) {
        await this.walletProvider.disconnect();
      }
      this.connectedAccount = null;
      this.walletProvider = null;
      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error('❌ Wallet disconnection failed:', error);
    }
  }

  async ensureAppOptIn(appId: number, address?: string): Promise<boolean> {
    if (!appId || appId <= 0) {
      throw new Error('Invalid application ID');
    }

    const accountAddress = address || this.connectedAccount?.address;
    if (!accountAddress) {
      throw new Error('Wallet not connected');
    }

    const alreadyOptedIn = await this.isOptedIn(accountAddress, appId);
    if (alreadyOptedIn) {
      return false;
    }

    const suggestedParams = await algodClient.getTransactionParams().do();

    const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
      from: accountAddress,
      appIndex: appId,
      suggestedParams
    });

    const result = await this.signAndSendTransaction(optInTxn);
    if (!result.success) {
      throw new Error(result.error || 'Application opt-in failed');
    }

    console.log(`✅ ${accountAddress} opted-in to app ${appId}`);
    return true;
  }

  // Get connected account
  getConnectedAccount(): WalletAccount | null {
    return this.connectedAccount;
  }

  // Check if wallet is connected
  isConnected(): boolean {
    return this.connectedAccount !== null;
  }

  // Get account balance
  async getAccountBalance(address?: string): Promise<number> {
    try {
      const accountAddress = address || this.connectedAccount?.address;
      if (!accountAddress) {
        throw new Error('No account address provided');
      }

      const accountInfo = await algodClient.accountInformation(accountAddress).do();
      return accountInfo.amount;
    } catch (error) {
      console.error('❌ Balance check failed:', error);
      return 0;
    }
  }

  // Sign and send transaction
  async signAndSendTransaction(
    transaction: algosdk.Transaction | algosdk.Transaction[],
    options: { waitRounds?: number } = {}
  ): Promise<TransactionResult> {
    try {
      if (!this.connectedAccount || !this.walletProvider) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      const transactions = Array.isArray(transaction) ? transaction : [transaction];

      // Populate suggested params for each transaction
      const suggestedParams = await algodClient.getTransactionParams().do();
      transactions.forEach((txn) => {
        txn.firstRound = suggestedParams.firstRound;
        txn.lastRound = suggestedParams.lastRound;
        txn.genesisHash = suggestedParams.genesisHash;
        txn.genesisID = suggestedParams.genesisID;
        txn.fee = suggestedParams.fee;
        txn.flatFee = false;
      });

      if (transactions.length > 1) {
        algosdk.assignGroupID(transactions);
      }

      let signedTransactions: Uint8Array[] = [];

      if (this.connectedAccount.provider === 'pera') {
        const txnObjects = transactions.map((txn) => ({
          txn: txn.toByte(),
          signers: [this.connectedAccount!.address]
        }));

        const signed = await this.walletProvider.signTransaction(txnObjects);
        signedTransactions = signed.map((item: any) => item.blob as Uint8Array);
      } else if (this.connectedAccount.provider === 'myalgo') {
        const signed = await this.walletProvider.signTransaction(
          transactions.map((txn) => txn.toByte())
        );

        if (Array.isArray(signed)) {
          signedTransactions = signed.map((item: any) =>
            item.blob ? (item.blob as Uint8Array) : (item as Uint8Array)
          );
        } else {
          signedTransactions = [
            signed.blob ? (signed.blob as Uint8Array) : (signed as Uint8Array)
          ];
        }
      } else {
        return {
          success: false,
          error: 'Unsupported wallet provider for signing'
        };
      }

      const sendResult = await algodClient.sendRawTransaction(signedTransactions).do();

      await algosdk.waitForConfirmation(
        algodClient,
        sendResult.txId,
        options.waitRounds ?? 4
      );

      console.log('✅ Transaction confirmed:', sendResult.txId);
      return {
        success: true,
        transactionId: sendResult.txId
      };
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      };
    }
  }

  // Create asset (for NFT creation)
  async createAsset(assetParams: {
    name: string;
    unitName: string;
    total: number;
    decimals: number;
    url?: string;
    manager?: string;
    reserve?: string;
    freeze?: string;
    clawback?: string;
  }): Promise<TransactionResult> {
    try {
      if (!this.connectedAccount) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const transaction = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: this.connectedAccount.address,
        suggestedParams,
        total: assetParams.total,
        decimals: assetParams.decimals,
        assetName: assetParams.name,
        unitName: assetParams.unitName,
        assetURL: assetParams.url,
        manager: assetParams.manager || this.connectedAccount.address,
        reserve: assetParams.reserve || this.connectedAccount.address,
        freeze: assetParams.freeze || this.connectedAccount.address,
        clawback: assetParams.clawback || this.connectedAccount.address
      });

      return await this.signAndSendTransaction(transaction);
    } catch (error) {
      console.error('❌ Asset creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Asset creation failed'
      };
    }
  }

  // Transfer asset (for NFT minting)
  async transferAsset(assetId: number, to: string, amount: number): Promise<TransactionResult> {
    try {
      if (!this.connectedAccount) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const transaction = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: this.connectedAccount.address,
        to: to,
        suggestedParams,
        assetIndex: assetId,
        amount: amount
      });

      return await this.signAndSendTransaction(transaction);
    } catch (error) {
      console.error('❌ Asset transfer failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Asset transfer failed'
      };
    }
  }

  // Send ALGO payment
  async sendPayment(to: string, amount: number, note?: string): Promise<TransactionResult> {
    try {
      if (!this.connectedAccount) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      const suggestedParams = await algodClient.getTransactionParams().do();
      
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: this.connectedAccount.address,
        to: to,
        amount: amount,
        suggestedParams,
        note: note ? new TextEncoder().encode(note) : undefined
      });

      return await this.signAndSendTransaction(transaction);
    } catch (error) {
      console.error('❌ Payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  // Get network status
  async getNetworkStatus(): Promise<{
    status: string;
    blockHeight: number;
    responseTime: number;
  }> {
    try {
      const startTime = Date.now();
      const status = await algodClient.status().do();
      const responseTime = Date.now() - startTime;

      return {
        status: 'online',
        blockHeight: status['last-round'],
        responseTime
      };
    } catch (error) {
      console.error('❌ Network status check failed:', error);
      return {
        status: 'offline',
        blockHeight: 0,
        responseTime: 0
      };
    }
  }

  // Get available wallets
  getAvailableWallets(): string[] {
    const wallets: string[] = [];
    
    if (this.isPeraWalletAvailable()) {
      wallets.push('pera');
    }
    
    if (this.isMyAlgoAvailable()) {
      wallets.push('myalgo');
    }
    
    return wallets;
  }
}

// Export singleton instance
export const walletService = new AlgorandWalletService();

// Export types and functions
export type { WalletAccount, WalletConnectionResult, TransactionResult };
export const ensureAppOptIn = (appId: number, address?: string) =>
  walletService.ensureAppOptIn(appId, address);
export default walletService;

