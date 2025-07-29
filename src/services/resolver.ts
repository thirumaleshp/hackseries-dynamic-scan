/**
 * DynaQR Resolver API Service
 * Handles QR code scanning and dynamic URL resolution
 */

import { dynaQRService, DynamicQREvent } from '../services/algorand';

// Resolver response interface
export interface ResolverResponse {
  success: boolean;
  eventId: string;
  redirectUrl?: string;
  eventName?: string;
  accessType?: string;
  error?: string;
  metadata?: {
    scanCount: number;
    lastScanned: string;
    owner: string;
    createdAt: string;
    active: boolean;
  };
}

// Access control result
export interface AccessControlResult {
  allowed: boolean;
  reason?: string;
  requiredNFT?: string;
  timeWindow?: {
    start: string;
    end: string;
  };
}

class DynaQRResolverService {
  private baseUrl = 'https://dynaqr.resolver.com';

  /**
   * Resolve an event ID to its current destination URL
   */
  async resolveEvent(eventId: string, userContext?: {
    address?: string;
    timestamp?: number;
    nftHoldings?: string[];
  }): Promise<ResolverResponse> {
    try {
      console.log(`🔍 Resolving event: ${eventId}`);

      // Get event data from Algorand blockchain
      const eventResult = await dynaQRService.getEvent(eventId);
      
      if (!eventResult.success) {
        return {
          success: false,
          eventId,
          error: eventResult.error || 'Event not found'
        };
      }

      const event: DynamicQREvent = eventResult.data;

      // Perform access control checks
      const accessResult = await this.checkAccess(event, userContext);
      if (!accessResult.allowed) {
        return {
          success: false,
          eventId,
          error: accessResult.reason || 'Access denied'
        };
      }

      // Increment scan count
      await dynaQRService.incrementScanCount(eventId);

      // Return successful resolution
      const response: ResolverResponse = {
        success: true,
        eventId,
        redirectUrl: event.currentUrl,
        eventName: event.eventName,
        accessType: event.accessType,
        metadata: {
          scanCount: event.scanCount + 1,
          lastScanned: new Date().toISOString(),
          owner: event.owner,
          createdAt: event.createdAt,
          active: event.active
        }
      };

      console.log('✅ Event resolved successfully:', response);
      return response;

    } catch (error) {
      console.error('❌ Resolution failed:', error);
      return {
        success: false,
        eventId,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if user has access to the event based on access control settings
   */
  private async checkAccess(
    event: DynamicQREvent, 
    userContext?: {
      address?: string;
      timestamp?: number;
      nftHoldings?: string[];
    }
  ): Promise<AccessControlResult> {
    try {
      // Public access - always allowed
      if (event.accessType === 'public') {
        return { allowed: true };
      }

      // Check if event has expired
      if (event.expiryDate && new Date(event.expiryDate) < new Date()) {
        return { 
          allowed: false, 
          reason: 'Event has expired' 
        };
      }

      // NFT-gated access
      if (event.accessType === 'nft-gated') {
        if (!userContext?.address) {
          return { 
            allowed: false, 
            reason: 'Wallet connection required for NFT-gated access' 
          };
        }

        // For demo purposes, simulate NFT verification
        // In production, this would check actual NFT holdings
        const hasRequiredNFT = userContext.nftHoldings?.includes('DYNAQR_NFT') || 
                              Math.random() > 0.3; // 70% chance of having NFT for demo

        if (!hasRequiredNFT) {
          return { 
            allowed: false, 
            reason: 'Required NFT not found in wallet',
            requiredNFT: 'DynaQR Access Token'
          };
        }

        return { allowed: true };
      }

      // Time-based access
      if (event.accessType === 'time-based') {
        const now = new Date();
        const currentHour = now.getHours();

        // For demo: restrict access to business hours (9 AM - 6 PM)
        if (currentHour < 9 || currentHour >= 18) {
          return { 
            allowed: false, 
            reason: 'Access only allowed during business hours (9 AM - 6 PM)',
            timeWindow: {
              start: '09:00',
              end: '18:00'
            }
          };
        }

        return { allowed: true };
      }

      return { allowed: true };

    } catch (error) {
      console.error('❌ Access control check failed:', error);
      return { 
        allowed: false, 
        reason: 'Access control verification failed' 
      };
    }
  }

  /**
   * Generate resolver URL for an event
   */
  generateResolverUrl(eventId: string): string {
    return `${this.baseUrl}/resolve?event=${eventId}`;
  }

  /**
   * Simulate QR code scanning (would integrate with camera API in production)
   */
  async simulateQRScan(qrData: string): Promise<{
    isValid: boolean;
    eventId?: string;
    resolverUrl?: string;
    error?: string;
  }> {
    try {
      // Check if QR data is a DynaQR resolver URL
      const urlMatch = qrData.match(/https:\/\/dynaqr\.resolver\.com\/resolve\?event=([^&]+)/);
      
      if (!urlMatch) {
        return {
          isValid: false,
          error: 'Not a valid DynaQR code'
        };
      }

      const eventId = urlMatch[1];
      return {
        isValid: true,
        eventId,
        resolverUrl: qrData
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to parse QR code'
      };
    }
  }

  /**
   * Get resolver analytics for an event
   */
  async getResolverAnalytics(eventId: string): Promise<{
    totalScans: number;
    successfulRedirects: number;
    failedAttempts: number;
    accessDenials: number;
    scansByHour: number[];
    topReferrers: string[];
    geographicData: { country: string; count: number }[];
  } | null> {
    try {
      const analytics = await dynaQRService.getEventAnalytics(eventId);
      if (!analytics) return null;

      // Simulate additional resolver-specific analytics
      const totalScans = analytics.totalScans;
      const successfulRedirects = Math.floor(totalScans * 0.85); // 85% success rate
      const failedAttempts = Math.floor(totalScans * 0.10); // 10% failures
      const accessDenials = totalScans - successfulRedirects - failedAttempts;

      return {
        totalScans,
        successfulRedirects,
        failedAttempts,
        accessDenials,
        scansByHour: analytics.dailyScans,
        topReferrers: ['Direct Scan', 'Event Website', 'Social Media', 'Email Campaign'],
        geographicData: [
          { country: 'USA', count: Math.floor(totalScans * 0.4) },
          { country: 'Canada', count: Math.floor(totalScans * 0.2) },
          { country: 'UK', count: Math.floor(totalScans * 0.15) },
          { country: 'Germany', count: Math.floor(totalScans * 0.1) },
          { country: 'Others', count: Math.floor(totalScans * 0.15) }
        ]
      };

    } catch (error) {
      console.error('❌ Failed to get resolver analytics:', error);
      return null;
    }
  }

  /**
   * Health check for resolver service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    services: {
      algorand: boolean;
      database: boolean;
      cache: boolean;
    };
  }> {
    const startTime = Date.now();

    try {
      // Check Algorand connectivity
      const networkStatus = await dynaQRService.getNetworkStatus();
      const algorandHealthy = networkStatus.status === 'online';

      const responseTime = Date.now() - startTime;

      return {
        status: algorandHealthy ? 'healthy' : 'degraded',
        responseTime,
        services: {
          algorand: algorandHealthy,
          database: true, // Simulated
          cache: true // Simulated
        }
      };

    } catch (error) {
      return {
        status: 'down',
        responseTime: Date.now() - startTime,
        services: {
          algorand: false,
          database: false,
          cache: false
        }
      };
    }
  }

  /**
   * Batch resolve multiple events (useful for preloading)
   */
  async batchResolve(eventIds: string[]): Promise<Map<string, ResolverResponse>> {
    const results = new Map<string, ResolverResponse>();

    const resolvePromises = eventIds.map(async (eventId) => {
      const result = await this.resolveEvent(eventId);
      results.set(eventId, result);
    });

    await Promise.all(resolvePromises);
    return results;
  }

  /**
   * Register a webhook for real-time scan notifications
   */
  async registerWebhook(eventId: string, webhookUrl: string): Promise<{
    success: boolean;
    webhookId?: string;
    error?: string;
  }> {
    try {
      // In production, this would register with a webhook service
      const webhookId = `webhook_${eventId}_${Date.now()}`;
      
      console.log(`📡 Webhook registered for event ${eventId}: ${webhookUrl}`);
      
      return {
        success: true,
        webhookId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const dynaQRResolver = new DynaQRResolverService();

// Convenience function for direct event resolution
export const resolveQREvent = (eventId: string, userContext?: any) => 
  dynaQRResolver.resolveEvent(eventId, userContext);

// Convenience function for QR scanning simulation
export const scanQRCode = (qrData: string) => 
  dynaQRResolver.simulateQRScan(qrData);

export default dynaQRResolver;
