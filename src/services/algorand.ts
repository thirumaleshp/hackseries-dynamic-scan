// This is a simulated Algorand service for demonstration purposes
// In a real application, this would interact with the Algorand blockchain using algosdk

import algosdk from 'algosdk';

// Type definitions for QR code data
interface QRCodeData {
  label: string;
  description: string;
  expiryDate?: string;
  notifyOnScan: boolean;
}

interface VerificationResult {
  isValid: boolean;
  label?: string;
  description?: string;
  transactionId?: string;
  createdAt?: string;
}

// Initialize a simulated Algorand client
// In a real application, you would use actual Algorand network credentials
const initAlgorandClient = () => {
  // This is a placeholder for demonstration
  // In production, you would use:
  // const token = { 'X-API-Key': 'your-api-key-here' };
  // const server = 'https://testnet-algorand.api.purestake.io/ps2';
  // const port = '';
  // return new algosdk.Algodv2(token, server, port);
  
  console.log('Initializing simulated Algorand client');
  return 'simulated-client';
};

// Mock data store for demo purposes - using localStorage for persistence
const getQRCodeStore = (): Record<string, QRCodeData & { transactionId: string, createdAt: string }> => {
  try {
    const stored = localStorage.getItem('algoqr_store');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveQRCodeStore = (store: Record<string, QRCodeData & { transactionId: string, createdAt: string }>) => {
  try {
    localStorage.setItem('algoqr_store', JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save QR code store:', error);
  }
};

// Function to generate a QR code and store it on Algorand
export const generateAlgorandTransaction = async (data: QRCodeData) => {
  try {
    // Simulate blockchain transaction
    console.log('Generating Algorand transaction for QR code:', data);
    
    // Generate a unique ID for the QR code
    const qrId = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    // In a real implementation, this would create an Algorand transaction
    // Here we're just simulating it:
    
    // 1. Generate a random transaction ID to simulate blockchain TX
    const transactionId = `ALGO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // 2. Store the QR code data in our persistent store
    const store = getQRCodeStore();
    store[qrId] = {
      ...data,
      transactionId,
      createdAt: new Date().toISOString(),
    };
    saveQRCodeStore(store);
    
    // 3. Return a verification URL that includes the QR ID
    // This URL format will be recognized by the verification function
    const verificationUrl = `https://algoqr.verify/${qrId}`;
    
    console.log(`QR code generated with ID: ${qrId}`);
    console.log(`Transaction ID: ${transactionId}`);
    console.log(`Verification URL: ${verificationUrl}`);
    
    return {
      success: true,
      qrId,
      transactionId,
      verificationUrl,
    };
  } catch (error) {
    console.error('Error generating Algorand transaction:', error);
    throw new Error('Failed to generate QR code on blockchain');
  }
};

// Function to verify a QR code from the Algorand blockchain
export const verifyQrCode = async (qrCodeUrl: string): Promise<VerificationResult> => {
  try {
    console.log('Verifying QR code:', qrCodeUrl);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get the current QR code store
    const store = getQRCodeStore();
    
    // Extract the QR ID from the URL
    let qrId: string | undefined;
    
    // Handle different URL formats
    if (qrCodeUrl.includes('algoqr.verify/')) {
      qrId = qrCodeUrl.split('algoqr.verify/')[1];
    } else if (qrCodeUrl.startsWith('qr-')) {
      qrId = qrCodeUrl; // Direct QR ID
    } else {
      // Try to extract from other URL patterns
      const urlParts = qrCodeUrl.split('/');
      qrId = urlParts[urlParts.length - 1];
    }
    
    console.log('Extracted QR ID:', qrId);
    
    // Check if this QR code exists in our store
    if (qrId && store[qrId]) {
      const qrData = store[qrId];
      
      // Check if the QR code has expired
      if (qrData.expiryDate) {
        const expiryDate = new Date(qrData.expiryDate);
        const now = new Date();
        if (now > expiryDate) {
          console.log(`QR code ${qrId} has expired`);
          return {
            isValid: false,
            label: qrData.label,
            description: 'This QR code has expired',
          };
        }
      }
      
      console.log(`QR code ${qrId} verified successfully`);
      
      return {
        isValid: true,
        label: qrData.label,
        description: qrData.description,
        transactionId: qrData.transactionId,
        createdAt: qrData.createdAt,
      };
    }
    
    // For demonstration, validate some additional sample patterns
    if (qrCodeUrl.includes('product-') || qrCodeUrl.includes('event-') || qrCodeUrl.includes('demo')) {
      return {
        isValid: true,
        label: 'Demo Product',
        description: 'This is a demonstration QR code for testing purposes',
        transactionId: `ALGO-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        createdAt: new Date().toISOString(),
      };
    }
    
    console.log('QR code not found or invalid:', qrCodeUrl);
    return { 
      isValid: false,
      description: 'QR code not found in blockchain records'
    };
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return { 
      isValid: false,
      description: 'Error occurred during verification'
    };
  }
};

// Function to get all stored QR codes (for history/dashboard)
export const getAllQRCodes = () => {
  return getQRCodeStore();
};

// Function to clear all stored QR codes (for testing)
export const clearQRCodeStore = () => {
  localStorage.removeItem('algoqr_store');
  console.log('QR code store cleared');
};

// Export a function to listen for QR code scans (for notification purposes)
export const listenForQrScans = (callback: (scanData: any) => void) => {
  console.log('Setting up listener for QR code scans');
  
  // In a real application, this would set up a webhook or subscription
  // to listen for blockchain events related to your QR codes
  
  // For demonstration, we'll simulate a scan after a random interval
  const simulateScan = () => {
    const delay = Math.floor(Math.random() * 30000) + 5000; // Random delay between 5-35 seconds
    
    setTimeout(() => {
      // Generate fake scan data
      const scanData = {
        qrId: `qr-${Math.random().toString(36).substring(2, 8)}`,
        scannedAt: new Date().toISOString(),
        location: 'Unknown Location',
        deviceId: `device-${Math.random().toString(36).substring(2, 8)}`,
      };
      
      // Call the callback with the scan data
      callback(scanData);
      
      // Set up another simulated scan
      simulateScan();
    }, delay);
  };
  
  // Start the simulation
  simulateScan();
  
  // Return a function to clean up the listener
  return () => {
    console.log('Cleaning up QR scan listener');
    // In a real app, this would unsubscribe from the event
  };
};

// Initialize the client when the service is imported
initAlgorandClient();