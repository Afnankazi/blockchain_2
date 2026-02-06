'use client';

import { useState } from 'react';
import { Address } from 'viem';
import ApproveOrderButton from './ApproveOrderButton';
import { formatAddress } from '@/utils/blockchain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, FileText, User } from 'lucide-react';

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
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
      {showApprove ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <button 
              onClick={() => setShowApprove(false)}
              className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h3 className="font-semibold">Confirm Order Details</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vendor</p>
                <p className="text-sm font-mono">{formatAddress(vendorAddress)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">IPFS Hash</p>
                <p className="text-sm font-mono truncate">{ipfsHash}</p>
              </div>
            </div>
          </div>

          <ApproveOrderButton
            vendorAddress={vendorAddress as Address}
            ipfsHash={ipfsHash}
            onSuccess={handleSuccess}
          />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="vendorAddress" className="text-sm font-medium">
              Vendor Address
            </Label>
            <Input
              id="vendorAddress"
              type="text"
              value={vendorAddress}
              onChange={(e) => setVendorAddress(e.target.value)}
              placeholder="0x..."
              className="h-11 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ipfsHash" className="text-sm font-medium">
              IPFS Hash
            </Label>
            <Input
              id="ipfsHash"
              type="text"
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              placeholder="QmXxx... or ipfs://QmXxx..."
              className="h-11 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
            />
          </div>

          <Button
            onClick={handlePrepareOrder}
            className="w-full h-11 mt-2"
            disabled={!vendorAddress || !ipfsHash}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
