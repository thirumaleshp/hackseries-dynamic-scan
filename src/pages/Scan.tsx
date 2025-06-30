import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { ScanLine, X, CheckCircle, AlertCircle, RotateCw, Upload, Blockchain } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import jsQR from 'jsqr';
import { verifyQrCode } from '../services/algorand';

const Scan: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scanResult, setScanResult] = useState<null | {
    code: string;
    isValid: boolean;
    label?: string;
    description?: string;
    timestamp?: string;
    transactionId?: string;
    blockNumber?: number;
    expiryDate?: string;
  }>(null);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScanner = () => {
    if (scannerContainerRef.current) {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      
      scannerRef.current = new Html5QrcodeScanner(
        'qr-scanner',
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );
      
      scannerRef.current.render(
        async (decodedText) => {
          setScanning(false);
          await handleQrCodeResult(decodedText);
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
      
      setScanning(true);
    }
  };

  const handleQrCodeResult = async (decodedText: string) => {
    setVerifying(true);
    
    try {
      console.log('Verifying QR code on Algorand blockchain...');
      const result = await verifyQrCode(decodedText);
      
      setScanResult({
        code: decodedText,
        isValid: result.isValid,
        label: result.label,
        description: result.description,
        timestamp: new Date().toLocaleString(),
        transactionId: result.transactionId,
        blockNumber: result.blockNumber,
        expiryDate: result.expiryDate,
      });
      
      if (result.isValid) {
        toast.success('QR code verified successfully on Algorand blockchain!');
      } else {
        toast.error('Invalid or expired QR code!');
      }
    } catch (error) {
      console.error('Blockchain verification error:', error);
      toast.error('Failed to verify QR code on blockchain');
      setScanResult({
        code: decodedText,
        isValid: false,
        timestamp: new Date().toLocaleString(),
        description: 'Blockchain verification failed',
      });
    } finally {
      setVerifying(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setScanning(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    stopScanner();
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      if (e.target?.result) {
        try {
          setVerifying(true);
          const img = new Image();
          img.src = e.target.result as string;
          
          await new Promise((resolve) => {
            img.onload = resolve;
          });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          context?.drawImage(img, 0, 0);

          const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              await handleQrCodeResult(code.data);
            } else {
              toast.error('No QR code found in image');
            }
          }
        } catch (error) {
          console.error('Error processing image:', error);
          toast.error('Failed to process image');
        } finally {
          setVerifying(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      await handleFileUpload(imageFile);
    } else {
      toast.error('Please drop an image file');
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1>Scan QR Code</h1>
        <p className="mt-2 text-gray-600">
          Scan a QR code to verify its authenticity on the Algorand blockchain.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Scanner Section */}
        <div className="card overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-medium flex items-center">
              <Blockchain className="mr-2 h-5 w-5 text-primary-500" />
              Blockchain QR Scanner
            </h2>
          </div>
          
          <div className="p-6">
            {verifying ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <RotateCw className="h-8 w-8 animate-spin text-primary-500" />
                </div>
                <h3 className="text-lg font-medium">Verifying on Blockchain</h3>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Checking authenticity on Algorand TestNet...
                </p>
                <div className="mt-4 rounded-md bg-primary-50 p-3 text-center text-xs text-primary-800">
                  <p>🔗 Connecting to Algorand network</p>
                  <p>📋 Querying smart contract</p>
                  <p>✅ Validating transaction</p>
                </div>
              </div>
            ) : scanning ? (
              <div className="relative rounded-lg bg-gray-100 p-4">
                <button
                  type="button"
                  onClick={stopScanner}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                >
                  <X size={16} className="text-gray-600" />
                </button>
                <div className="relative overflow-hidden rounded-lg">
                  <div id="qr-scanner" ref={scannerContainerRef} className="scanner-animation"></div>
                </div>
              </div>
            ) : scanResult ? (
              <div className="flex flex-col items-center py-6">
                <div
                  className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                    scanResult.isValid ? 'bg-success-100' : 'bg-error-100'
                  }`}
                >
                  {scanResult.isValid ? (
                    <CheckCircle className="h-8 w-8 text-success-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-error-500" />
                  )}
                </div>
                <h3 className="text-lg font-medium">
                  {scanResult.isValid ? 'Blockchain Verified ✓' : 'Verification Failed ✗'}
                </h3>
                
                <div className="mt-6 w-full space-y-4">
                  {scanResult.isValid && (
                    <>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Label</label>
                        <p className="font-medium">{scanResult.label}</p>
                      </div>
                      
                      {scanResult.description && (
                        <div>
                          <label className="text-xs font-medium text-gray-500">Description</label>
                          <p className="text-sm">{scanResult.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-xs font-medium text-gray-500">Blockchain Transaction</label>
                        <p className="font-mono text-xs break-all">{scanResult.transactionId}</p>
                      </div>
                      
                      {scanResult.blockNumber && (
                        <div>
                          <label className="text-xs font-medium text-gray-500">Block Number</label>
                          <p className="text-sm">{scanResult.blockNumber}</p>
                        </div>
                      )}
                      
                      {scanResult.expiryDate && (
                        <div>
                          <label className="text-xs font-medium text-gray-500">Expires</label>
                          <p className="text-sm">{new Date(scanResult.expiryDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {!scanResult.isValid && scanResult.description && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Error</label>
                      <p className="text-sm text-error-500">{scanResult.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Scanned At</label>
                    <p className="text-sm">{scanResult.timestamp}</p>
                  </div>
                  
                  <div className={`rounded-md p-3 text-center text-sm ${
                    scanResult.isValid 
                      ? 'bg-success-50 text-success-800' 
                      : 'bg-error-50 text-error-800'
                  }`}>
                    {scanResult.isValid ? (
                      <p>✅ This QR code is authentic and verified on Algorand blockchain</p>
                    ) : (
                      <p>❌ This QR code could not be verified on the blockchain</p>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={resetScan}
                    className="btn-primary mt-4 w-full"
                  >
                    Scan Another Code
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                  isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100">
                  <ScanLine className="h-8 w-8 text-secondary-500" />
                </div>
                <h3 className="text-lg font-medium">Ready to Scan</h3>
                <p className="mt-2 text-center text-sm text-gray-500">
                  Use your camera to scan a QR code or upload an image
                </p>
                
                <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={startScanner}
                    className="btn-secondary flex-1"
                  >
                    <ScanLine size={16} className="mr-2" />
                    Start Camera
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-outline flex-1"
                  >
                    <Upload size={16} className="mr-2" />
                    Upload Image
                  </button>
                </div>
                
                <div className="mt-4 text-center text-xs text-gray-500">
                  or drag and drop an image containing a QR code
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="card overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-medium">Blockchain Verification Process</h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="flex p-4">
              <div className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                1
              </div>
              <div>
                <h3 className="font-medium">Scan QR Code</h3>
                <p className="text-sm text-gray-600">
                  Use your camera, upload an image, or drag and drop a QR code image.
                </p>
              </div>
            </div>
            
            <div className="flex p-4">
              <div className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                2
              </div>
              <div>
                <h3 className="font-medium">Connect to Algorand</h3>
                <p className="text-sm text-gray-600">
                  The system connects to Algorand TestNet to verify the QR code's authenticity.
                </p>
              </div>
            </div>
            
            <div className="flex p-4">
              <div className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                3
              </div>
              <div>
                <h3 className="font-medium">Query Smart Contract</h3>
                <p className="text-sm text-gray-600">
                  The verification data is retrieved from the deployed smart contract on the blockchain.
                </p>
              </div>
            </div>
            
            <div className="flex p-4">
              <div className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                4
              </div>
              <div>
                <h3 className="font-medium">Display Results</h3>
                <p className="text-sm text-gray-600">
                  View the verification result with blockchain transaction details and metadata.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4">
            <div className="rounded-md bg-primary-50 p-3 text-sm text-primary-800">
              <h4 className="font-medium">🔒 Blockchain Security</h4>
              <p className="mt-1 text-xs">
                All QR codes are cryptographically secured and immutably stored on the Algorand blockchain.
                This ensures tamper-proof verification and complete transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;