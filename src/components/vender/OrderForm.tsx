'use client';

import { useState } from 'react';
import { Address } from 'viem';
import ApproveOrderButton from './ApproveOrderButton';
import { formatAddress } from '@/utils/blockchain';

interface OrderFormProps {
  onOrderCreated?: (txHash: string) => void;
}

export default function OrderForm({ onOrderCreated }: OrderFormProps) {
  const [vendorAddress, setVendorAddress] = useState<string>('');
  const [ipfsHash, setIpfsHash] = useState<string>('');
  const [showApprove, setShowApprove] = useState(false);

  const handlePrepareOrder = () => {
    if (!vendorAddress || !ipfsHash) {
      alert('Please fill in all fields');
      return;
    }

    // Validate address format
    if (!vendorAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid vendor address format');
      return;
    }

    setShowApprove(true);
  };

  const handleSuccess = (txHash: string) => {
    if (onOrderCreated) {
      onOrderCreated(txHash);
    }
    
    // Reset form
    setVendorAddress('');
    setIpfsHash('');
    setShowApprove(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Order</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="vendorAddress" className="block text-sm font-medium text-gray-700 mb-2">
            Vendor Address
          </label>
          <input
            id="vendorAddress"
            type="text"
            value={vendorAddress}
            onChange={(e) => setVendorAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={showApprove}
          />
        </div>

        <div>
          <label htmlFor="ipfsHash" className="block text-sm font-medium text-gray-700 mb-2">
            IPFS Hash (Order Details)
          </label>
          <input
            id="ipfsHash"
            type="text"
            value={ipfsHash}
            onChange={(e) => setIpfsHash(e.target.value)}
            placeholder="QmXxx... or ipfs://QmXxx..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={showApprove}
          />
          <p className="mt-1 text-xs text-gray-500">
            Upload order details to IPFS first and paste the hash here
          </p>
        </div>

        {showApprove ? (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Order Summary</h3>
              <div className="text-sm space-y-1 text-blue-800">
                <p>
                  <span className="font-medium">Vendor:</span> {formatAddress(vendorAddress)}
                </p>
                <p>
                  <span className="font-medium">IPFS:</span> {ipfsHash.substring(0, 20)}...
                </p>
              </div>
            </div>

            <ApproveOrderButton
              vendorAddress={vendorAddress as Address}
              ipfsHash={ipfsHash}
              onSuccess={handleSuccess}
            />

            <button
              onClick={() => setShowApprove(false)}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Edit
            </button>
          </div>
        ) : (
          <button
            onClick={handlePrepareOrder}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Continue to Approval
          </button>
        )}
      </div>
    </div>
  );
}
