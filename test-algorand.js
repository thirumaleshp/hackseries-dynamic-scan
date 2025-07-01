// Test script to verify Algorand blockchain functionality
import { 
  connectWallet, 
  generateAlgorandTransaction,
  createBlockchainQR,
  createMultiSigQR,
  createAssetBackedQR,
  createTimeLockedQR,
  verifyBlockchainQR,
  getQRAnalytics,
  getBlockchainStats
} from '../src/services/algorand.js';

async function testAlgorandFeatures() {
  console.log('🧪 Testing Algorand Blockchain Features...');
  
  try {
    // Test 1: Wallet Connection
    console.log('\n1️⃣ Testing wallet connection...');
    const account = await connectWallet();
    console.log('✅ Wallet connected:', account);
    
    // Test 2: Basic QR Creation
    console.log('\n2️⃣ Testing basic QR creation...');
    const basicQR = await generateAlgorandTransaction({
      label: 'Test Product',
      description: 'Test QR code for verification',
      expiryDate: '2025-12-31T23:59:59Z',
      notifyOnScan: true
    });
    console.log('✅ Basic QR created:', basicQR);
    
    // Test 3: Blockchain QR Creation
    console.log('\n3️⃣ Testing blockchain QR creation...');
    const blockchainQR = await createBlockchainQR({
      label: 'Blockchain Certificate',
      description: 'Advanced blockchain-backed certificate',
      expiryDate: '2025-12-31T23:59:59Z',
      metadata: { category: 'certificate', type: 'premium' }
    });
    console.log('✅ Blockchain QR created:', blockchainQR);
    
    // Test 4: Multi-Signature QR
    console.log('\n4️⃣ Testing multi-signature QR...');
    const multiSigQR = await createMultiSigQR(
      {
        label: 'Executive Document',
        description: 'Requires multiple signatures',
        expiryDate: '2025-12-31T23:59:59Z'
      },
      2, // require 2 signatures
      [account, 'ADDR2_EXAMPLE', 'ADDR3_EXAMPLE'] // signatories
    );
    console.log('✅ Multi-sig QR created:', multiSigQR);
    
    // Test 5: Asset-Backed QR
    console.log('\n5️⃣ Testing asset-backed QR...');
    const assetQR = await createAssetBackedQR(
      123456, // asset ID
      {
        label: 'NFT Certificate',
        description: 'Proof of NFT ownership',
        metadata: { collection: 'test', rarity: 'rare' }
      }
    );
    console.log('✅ Asset-backed QR created:', assetQR);
    
    // Test 6: Time-Locked QR
    console.log('\n6️⃣ Testing time-locked QR...');
    const futureTimestamp = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const timeLockedQR = await createTimeLockedQR(
      {
        label: 'Future Document',
        description: 'Unlocks in 24 hours'
      },
      futureTimestamp
    );
    console.log('✅ Time-locked QR created:', timeLockedQR);
    
    // Test 7: QR Verification
    console.log('\n7️⃣ Testing QR verification...');
    const verification = await verifyBlockchainQR(blockchainQR.qrId);
    console.log('✅ QR verification result:', verification);
    
    // Test 8: Analytics
    console.log('\n8️⃣ Testing analytics...');
    const analytics = getQRAnalytics();
    console.log('✅ QR Analytics:', analytics);
    
    const stats = await getBlockchainStats();
    console.log('✅ Blockchain Stats:', stats);
    
    console.log('\n🎉 All Algorand blockchain features tested successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAlgorandFeatures();
