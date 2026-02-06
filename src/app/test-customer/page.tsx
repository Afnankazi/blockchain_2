'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSupplyChain } from '@/hooks/useSupplyChain';
import LoginButton from '@/components/vender/LoginButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, ShoppingCart, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

// Mock order data for testing
const MOCK_ORDER_DATA = {
  customerId: "0x1234567890abcdef1234567890abcdef12345678",
  vendorId: "0xabcdef1234567890abcdef1234567890abcdef12",
  productDetails: "Premium Widget Set - Model XYZ-2000",
  quantity: 100,
  price: 5000,
  deliveryAddress: "123 Supply Chain Ave, Blockchain City, BC 12345",
  timestamp: Date.now(),
  additionalNotes: "Handle with care - fragile items"
};

export default function TestCustomerPage() {
  const { authenticated } = usePrivy();
  const { createOrder, isLoading } = useSupplyChain();
  
  const [vendorAddress, setVendorAddress] = useState('');
  const [secretKey, setSecretKey] = useState('test-secret-123');
  const [txHash, setTxHash] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Simulated IPFS upload (in real app, this would upload to Pinata)
  const handleUploadToIPFS = async () => {
    setIsUploading(true);
    
    // Simulate IPFS upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock IPFS hash (in production, this would come from Pinata)
    const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setIpfsHash(mockIpfsHash);
    setIsUploading(false);
  };

  const handleCreateOrder = async () => {
    if (!vendorAddress || !ipfsHash || !secretKey) {
      alert('Please fill in all fields and upload to IPFS first');
      return;
    }

    if (!vendorAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid vendor address format');
      return;
    }

    setIsCreating(true);
    try {
      const hash = await createOrder(vendorAddress as `0x${string}`, ipfsHash, secretKey);
      setTxHash(hash);
      alert(`Order created! Save your secret key: ${secretKey}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Test Customer
                </h1>
                <p className="text-xs text-muted-foreground">
                  Create a test order for vendor
                </p>
              </div>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-xl mx-auto">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-400">
              <strong>Testing Mode:</strong> Use this page to create a test order. 
              The vendor can then see and accept it on the Vendor Portal.
            </p>
          </div>

          {authenticated ? (
            <div className="space-y-6">
              {/* Mock Order Preview */}
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Order Data (Mock)</h3>
                <pre className="text-xs bg-muted/50 p-4 rounded-xl overflow-auto">
                  {JSON.stringify(MOCK_ORDER_DATA, null, 2)}
                </pre>
              </div>

              {/* Upload to IPFS */}
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Step 1: Upload to IPFS</h3>
                
                {ipfsHash ? (
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-emerald-400">Uploaded to IPFS</p>
                      <p className="text-xs text-muted-foreground font-mono">{ipfsHash}</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleUploadToIPFS}
                    disabled={isUploading}
                    className="w-full"
                    variant="outline"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload Order Data to IPFS (Simulated)'
                    )}
                  </Button>
                )}
              </div>

              {/* Create Order Form */}
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Step 2: Create Order on Blockchain</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Vendor Address</Label>
                    <Input
                      value={vendorAddress}
                      onChange={(e) => setVendorAddress(e.target.value)}
                      placeholder="0x... (paste the vendor's wallet address)"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Copy the vendor's connected wallet address from the Vendor Portal
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Secret Delivery Key</Label>
                    <Input
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Enter a secret key"
                    />
                    <p className="text-xs text-muted-foreground">
                      Save this key! You'll need it to verify delivery later.
                    </p>
                  </div>

                  <Button
                    onClick={handleCreateOrder}
                    disabled={!ipfsHash || !vendorAddress || isCreating || isLoading}
                    className="w-full"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4 mr-2" />
                        Create Order (Gasless)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Success */}
              {txHash && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-400 text-sm">Order Created!</p>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-emerald-400 transition-colors mt-1 inline-flex items-center gap-1 font-mono"
                      >
                        View on PolygonScan <ExternalLink className="h-3 w-3" />
                      </a>
                      <p className="text-xs text-muted-foreground mt-2">
                        Now go to the <a href="/vender" className="text-primary underline">Vendor Portal</a> to accept this order.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 px-8 border border-dashed border-muted-foreground/20 rounded-2xl bg-muted/20">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Connect as Customer</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Sign in to create a test order on the blockchain
              </p>
              <LoginButton />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
