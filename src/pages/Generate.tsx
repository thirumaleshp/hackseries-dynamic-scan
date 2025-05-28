import React, { useState } from 'react';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { Download, Check, Copy } from 'lucide-react';
import { generateAlgorandTransaction } from '../services/algorand';

const Generate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [qrValue, setQrValue] = useState('');
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
    setLoading(true);
    
    try {
      // This would normally call the Algorand service to create a transaction
      // For demo purposes, we'll simulate it
      const response = await generateAlgorandTransaction(formData);
      
      setQrValue(response.verificationUrl);
      setGenerated(true);
      toast.success('QR code generated successfully!');
    } catch (error) {
      toast.error('Failed to generate QR code. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code')?.outerHTML;
    if (svg) {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${formData.label.replace(/\s+/g, '-').toLowerCase()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded!');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrValue);
    toast.success('Verification URL copied to clipboard!');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1>Generate QR Code</h1>
        <p className="mt-2 text-gray-600">
          Create a new QR code that will be verified on the Algorand blockchain.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Form Section */}
        <div className="card p-6">
          <h2 className="mb-4">QR Code Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="label" className="mb-1 block text-sm font-medium text-gray-700">
                Label
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
              />
              <label htmlFor="notifyOnScan" className="ml-2 block text-sm text-gray-700">
                Notify me when this QR code is scanned
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.label}
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
                  Generating...
                </span>
              ) : (
                'Generate QR Code'
              )}
            </button>
          </form>
        </div>

        {/* QR Code Preview */}
        <div className="card flex flex-col items-center justify-center p-6">
          {generated ? (
            <div className="flex w-full flex-col items-center space-y-4">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <QRCode id="qr-code\" value={qrValue} size={200} />
              </div>
              
              <div className="w-full space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={qrValue}
                    readOnly
                    className="form-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-500"
                  >
                    <Copy size={16} />
                  </button>
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
                      // Simulate verification
                      toast.success('QR code verified on Algorand blockchain!');
                    }}
                    className="btn-primary flex-1"
                  >
                    <Check size={16} className="mr-2" />
                    Verify
                  </button>
                </div>
              </div>
              
              <div className="rounded-md bg-primary-50 p-3 text-center text-sm text-primary-800">
                <p>This QR code is secured by Algorand blockchain.</p>
                <p className="mt-1 text-xs">Transaction ID: ALGO-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <QRCode
                  value="https://placeholder.com"
                  size={64}
                  style={{ opacity: 0.3 }}
                />
              </div>
              <h3 className="text-lg font-medium">No QR Code Generated Yet</h3>
              <p className="text-sm text-gray-500">
                Fill out the form on the left and click "Generate QR Code" to create a new
                blockchain-verified QR code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;