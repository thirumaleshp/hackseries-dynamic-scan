import algosdk from 'algosdk';
import { walletService, TransactionResult } from './wallet-service';

// Algorand network configuration
const ALGORAND_CONFIG = {
  server: 'https://testnet-api.algonode.cloud',
  port: '',
  token: '',
  network: 'testnet'
};

// NFT Asset Configuration
const NFT_CONFIG = {
  decimals: 0, // NFTs are indivisible
  total: 1, // Only one NFT per event attendance
  defaultFrozen: false,
  manager: '', // Will be set to event creator
  reserve: '', // Will be set to event creator
  freeze: '', // Will be set to event creator
  clawback: '' // Will be set to event creator
};

// Initialize Algorand client
const algodClient = new algosdk.Algodv2(
  ALGORAND_CONFIG.token,
  ALGORAND_CONFIG.server,
  ALGORAND_CONFIG.port
);

// NFT Asset interface
export interface NFTAsset {
  assetId: number;
  name: string;
  unitName: string;
  url: string;
  metadataHash?: string;
  creator: string;
  total: number;
  decimals: number;
  defaultFrozen: boolean;
  manager: string;
  reserve: string;
  freeze: string;
  clawback: string;
  createdAt?: string;
  transactionId?: string;
}

// NFT Creation parameters
export interface NFTCreationParams {
  eventName: string;
  eventId: string;
  attendeeName: string;
  attendeeAddress: string;
  eventDate: string;
  eventLocation: string;
  ticketTier: string;
  imageUrl?: string;
  description?: string;
}

// NFT Service Result
export interface NFTServiceResult {
  success: boolean;
  assetId?: number;
  transactionId?: string;
  error?: string;
  data?: any;
}

class AlgorandNFTService {
  // No need for separate account management - use wallet service

  // Create NFT Asset
  async createNFTAsset(params: NFTCreationParams): Promise<NFTServiceResult> {
    try {
      if (!walletService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      // Generate unique asset name
      const assetName = `${params.eventName} - ${params.ticketTier} Ticket`;
      const unitName = `${params.eventId.slice(0, 8).toUpperCase()}`;
      
      // Create metadata URL (IPFS or centralized storage)
      const metadataUrl = await this.createMetadataUrl(params);
      
      // Use wallet service to create asset
      const result = await walletService.createAsset({
        name: assetName,
        unitName: unitName,
        total: NFT_CONFIG.total,
        decimals: NFT_CONFIG.decimals,
        url: metadataUrl,
        manager: walletService.getConnectedAccount()?.address,
        reserve: walletService.getConnectedAccount()?.address,
        freeze: walletService.getConnectedAccount()?.address,
        clawback: walletService.getConnectedAccount()?.address
      });

      if (result.success && result.transactionId) {
        // Get the asset ID from the transaction
        const confirmation = await algodClient.pendingTransactionInformation(result.transactionId).do();
        const assetId = confirmation['asset-index'];

        console.log(`✅ NFT Asset created successfully! Asset ID: ${assetId}`);

        return {
          success: true,
          assetId,
          transactionId: result.transactionId,
          data: {
            assetName,
            unitName,
            metadataUrl
          }
        };
      } else {
        throw new Error(result.error || 'Asset creation failed');
      }

    } catch (error) {
      console.error('❌ NFT Asset creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Mint NFT to attendee
  async mintNFTToAttendee(assetId: number, attendeeAddress: string): Promise<NFTServiceResult> {
    try {
      if (!walletService.isConnected()) {
        throw new Error('Wallet not connected');
      }

      // Use wallet service to transfer asset
      const result = await walletService.transferAsset(assetId, attendeeAddress, 1);

      if (result.success) {
        console.log(`✅ NFT minted successfully to ${attendeeAddress}!`);

        return {
          success: true,
          transactionId: result.transactionId,
          data: {
            assetId,
            recipient: attendeeAddress,
            amount: 1
          }
        };
      } else {
        throw new Error(result.error || 'NFT minting failed');
      }

    } catch (error) {
      console.error('❌ NFT minting failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get NFT Asset details
  async getNFTAsset(assetId: number): Promise<NFTServiceResult> {
    try {
      const assetInfo = await algodClient.getAssetByID(assetId).do();
      
      const nftAsset: NFTAsset = {
        assetId: assetInfo.index,
        name: assetInfo.params.name || '',
        unitName: assetInfo.params.unitName || '',
        url: assetInfo.params.url || '',
        metadataHash: assetInfo.params.metadataHash,
        creator: assetInfo.params.creator,
        total: assetInfo.params.total,
        decimals: assetInfo.params.decimals,
        defaultFrozen: assetInfo.params.defaultFrozen,
        manager: assetInfo.params.manager,
        reserve: assetInfo.params.reserve,
        freeze: assetInfo.params.freeze,
        clawback: assetInfo.params.clawback
      };

      return {
        success: true,
        data: nftAsset
      };

    } catch (error) {
      console.error('❌ Failed to get NFT asset:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get user's NFTs
  async getUserNFTs(userAddress: string): Promise<NFTServiceResult> {
    try {
      const accountInfo = await algodClient.accountInformation(userAddress).do();
      const userAssets = accountInfo.assets || [];

      const nftAssets: NFTAsset[] = [];
      
      for (const asset of userAssets) {
        if (asset.amount > 0) { // User owns this asset
          const assetInfo = await this.getNFTAsset(asset.assetId);
          if (assetInfo.success && assetInfo.data) {
            nftAssets.push(assetInfo.data as NFTAsset);
          }
        }
      }

      return {
        success: true,
        data: nftAssets
      };

    } catch (error) {
      console.error('❌ Failed to get user NFTs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Create metadata URL for NFT
  private async createMetadataUrl(params: NFTCreationParams): Promise<string> {
    try {
      // For demo purposes, create a simple metadata structure
      // In production, you'd upload this to IPFS or similar decentralized storage
      
      const metadata = {
        name: `${params.eventName} - ${params.ticketTier} Ticket`,
        description: `Proof of attendance for ${params.eventName} held on ${params.eventDate} at ${params.eventLocation}`,
        image: params.imageUrl || 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Event+Ticket',
        attributes: [
          {
            trait_type: 'Event',
            value: params.eventName
          },
          {
            trait_type: 'Event ID',
            value: params.eventId
          },
          {
            trait_type: 'Ticket Tier',
            value: params.ticketTier
          },
          {
            trait_type: 'Event Date',
            value: params.eventDate
          },
          {
            trait_type: 'Location',
            value: params.eventLocation
          },
          {
            trait_type: 'Attendee',
            value: params.attendeeName
          },
          {
            trait_type: 'Blockchain',
            value: 'Algorand'
          },
          {
            trait_type: 'Network',
            value: 'TestNet'
          }
        ],
        external_url: `https://testnet.algoexplorer.io/asset/${params.eventId}`,
        background_color: '6366f1',
        animation_url: ''
      };

      // For demo, return a data URL. In production, upload to IPFS
      const metadataString = JSON.stringify(metadata);
      const metadataBase64 = btoa(metadataString);
      
      return `data:application/json;base64,${metadataBase64}`;

    } catch (error) {
      console.error('❌ Failed to create metadata URL:', error);
      // Fallback to placeholder
      return 'https://via.placeholder.com/400x400/6366f1/ffffff?text=Event+Ticket';
    }
  }

  // Verify NFT ownership
  async verifyNFTOwnership(assetId: number, userAddress: string): Promise<boolean> {
    try {
      const accountInfo = await algodClient.accountInformation(userAddress).do();
      const userAssets = accountInfo.assets || [];
      
      const asset = userAssets.find(a => a.assetId === assetId);
      return asset ? asset.amount > 0 : false;

    } catch (error) {
      console.error('❌ Failed to verify NFT ownership:', error);
      return false;
    }
  }

  // Get NFT transaction history
  async getNFTTransactionHistory(assetId: number): Promise<NFTServiceResult> {
    try {
      // Get recent transactions for the asset
      const transactions = await algodClient.searchForTransactions()
        .assetID(assetId)
        .limit(20)
        .do();

      return {
        success: true,
        data: {
          assetId,
          transactions: transactions.transactions || []
        }
      };

    } catch (error) {
      console.error('❌ Failed to get NFT transaction history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Batch create NFTs for multiple attendees
  async batchCreateNFTs(attendees: NFTCreationParams[]): Promise<NFTServiceResult> {
    try {
      if (!this.connectedAccount) {
        throw new Error('No account connected');
      }

      const results = [];
      
      for (const attendee of attendees) {
        const result = await this.createNFTAsset(attendee);
        if (result.success) {
          results.push(result);
        }
      }

      return {
        success: true,
        data: {
          total: attendees.length,
          successful: results.length,
          failed: attendees.length - results.length,
          results
        }
      };

    } catch (error) {
      console.error('❌ Batch NFT creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const nftService = new AlgorandNFTService();

// Export types and functions
export type { NFTAsset, NFTCreationParams, NFTServiceResult };
export default nftService;
