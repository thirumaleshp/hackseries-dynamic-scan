import React, { useState } from 'react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { Download, Check, Copy, RefreshCw, Wallet } from 'lucide-react';
import { generateAlgorandTransaction, isWalletConnected } from '../services/algorand';
import WalletConnection from '../components/WalletConnection';

const Generate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const [appId, setAppId] = useState<number>(0);
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    expiryDate: '',
    notifyOnScan: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected()) {
      toast.error('Please connect your Algorand wallet first');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the Algorand service to create a blockchain transaction
      const response = await generateAlgorandTransaction(formData);
      
      setQrValue(response.verificationUrl);
      setTransactionId(response.transactionId);
      setBlockNumber(response.blockNumber);
      setAppId(response.appId);
      setGenerated(true);
      
      toast.success('QR code generated and stored on Algorand blockchain!');
    } catch (error) {
      toast.error(`Failed to generate QR code: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `qr-${formData.label.replace(/\s+/g, '-').toLowerCase()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
      
      toast.success('QR code downloaded!');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrValue);
    toast.success('Verification URL copied to clipboard!');
  };

  const resetForm = () => {
    setGenerated(false);
    setQrValue('');
    setTransactionId('');
    setBlockNumber(0);
    setAppId(0);
    setFormData({
      label: '',
      description: '',
      expiryDate: '',
      notifyOnScan: true,
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1>Generate QR Code</h1>
        <p className="mt-2 text-gray-600">
          Create a new QR code that will be verified on the Algorand blockchain.
        </p>
      </div>

      {/* Wallet Connection Status */}
      <WalletConnection />

      <div className="grid gap-8 md:grid-cols-2">
        {/* Form Section */}
        <div className="card p-6">
          <h2 className="mb-4">QR Code Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="label" className="mb-1 block text-sm font-medium text-gray-700">
                Label *
              </label>
              <input
                type="text"
                id="label"
                name="label"
                required
                value={formData.label}
                onChange={handleChange}
                className="form-input"
                placeholder="Product Name, Event Ticket, etc."
                disabled={generated}
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                placeholder="Additional details about this QR code..."
                disabled={generated}
              />
            </div>

            <div>
              <label htmlFor="expiryDate" className="mb-1 block text-sm font-medium text-gray-700">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="form-input"
                disabled={generated}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyOnScan"
                name="notifyOnScan"
                checked={formData.notifyOnScan}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                disabled={generated}
              />
              <label htmlFor="notifyOnScan" className="ml-2 block text-sm text-gray-700">
                Notify me when this QR code is scanned
              </label>
            </div>

            {!generated ? (
              <button
                type="submit"
                disabled={loading || !formData.label.trim() || !isWalletConnected()}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating on Blockchain...
                  </span>
                ) : !isWalletConnected() ? (
                  <>
                    <Wallet size={16} className="mr-2" />
                    Connect Wallet First
                  </>
                ) : (
                  'Generate QR Code'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline w-full"
              >
                <RefreshCw size={16} className="mr-2" />
                Generate Another
              </button>
            )}
          </form>
        </div>

        {/* QR Code Preview */}
        <div className="card flex flex-col items-center justify-center p-6">
          {generated ? (
            <div className="flex w-full flex-col items-center space-y-4">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <QRCode 
                  id="qr-code" 
                  value={qrValue} 
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <div className="w-full space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Verification URL
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={qrValue}
                      readOnly
                      className="form-input pr-10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-500"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="btn-outline flex-1"
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.success('QR code is ready for scanning!');
                    }}
                    className="btn-primary flex-1"
                  >
                    <Check size={16} className="mr-2" />
                    Ready
                  </button>
                </div>
              </div>
              
              <div className="w-full space-y-2">
                <div className="rounded-md bg-primary-50 p-3 text-center text-sm text-primary-800">
                  <p className="font-medium">✓ Secured by Algorand Blockchain</p>
                  <p className="mt-1 text-xs">Transaction: {transactionId}</p>
                  <p className="text-xs">Block: {blockNumber} • App ID: {appId}</p>
                </div>
                
                <div className="rounded-md bg-success-50 p-3 text-center text-xs text-success-800">
                  <p className="font-medium">Blockchain Verification Active</p>
                  <p className="mt-1">This QR code is now immutably stored on Algorand TestNet and ready for verification.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <div className="opacity-30">
                  <QRCode value="placeholder" size={64} />
                </div>
              </div>
              <h3 className="text-lg font-medium">No QR Code Generated Yet</h3>
              <p className="text-sm text-gray-500">
                {!isWalletConnected() 
                  ? 'Connect your Algorand wallet and fill out the form to create a blockchain-verified QR code.'
                  : 'Fill out the form on the left and click "Generate QR Code" to create a new blockchain-verified QR code.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;