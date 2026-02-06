'use client';

import { useState } from 'react';
import { useSupplyChain, Order } from '@/hooks/useSupplyChain';
import { formatAddress } from '@/utils/blockchain';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, FileText, Hash, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

interface AcceptOrderPanelProps {
  order: Order;
  onBack: () => void;
  onSuccess: (txHash: string) => void;
}

export default function AcceptOrderPanel({ order, onBack, onSuccess }: AcceptOrderPanelProps) {
  const { acceptOrder, isLoading } = useSupplyChain();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptOrder = async () => {
    setIsAccepting(true);
    try {
      const txHash = await acceptOrder(order.orderId);
      onSuccess(txHash);
    } catch (error) {
      console.error('Error accepting order:', error);
      alert(`Failed to accept order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAccepting(false);
    }
  };

  const ipfsUrl = order.ipfsHash.startsWith('ipfs://')
    ? `https://gateway.pinata.cloud/ipfs/${order.ipfsHash.replace('ipfs://', '')}`
    : `https://gateway.pinata.cloud/ipfs/${order.ipfsHash}`;

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
        <button
          onClick={onBack}
          className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h3 className="font-semibold">Order #{order.orderId.toString()}</h3>
          <p className="text-xs text-muted-foreground">Review and accept this order</p>
        </div>
      </div>

      {/* Order Details */}
      <div className="p-5 space-y-4">
        {/* Order ID */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
            <Hash className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Order ID</p>
            <p className="text-sm font-mono font-medium">{order.orderId.toString()}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="text-sm font-mono truncate">{order.customer}</p>
          </div>
        </div>

        {/* IPFS Hash */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
          <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">IPFS Hash</p>
            <a
              href={ipfsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-primary hover:underline truncate flex items-center gap-1"
            >
              {formatAddress(order.ipfsHash)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Accept Button */}
        <Button
          onClick={handleAcceptOrder}
          disabled={isLoading || isAccepting}
          className="w-full h-12 text-base gap-2 mt-2"
        >
          {isAccepting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Accepting Order...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Accept Order
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          This transaction is gasless • Powered by Pimlico
        </p>
      </div>
    </div>
  );
}
