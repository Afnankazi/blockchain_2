'use client';

import LoginButton from '@/components/vender/LoginButton';
import OrderList from '@/components/vender/OrderList';
import AcceptOrderPanel from '@/components/vender/AcceptOrderPanel';
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Package, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { Order } from '@/hooks/useSupplyChain';

export default function Home() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [recentTxHash, setRecentTxHash] = useState<string>('');
  const { authenticated } = usePrivy();

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setRecentTxHash('');
  };

  const handleOrderAccepted = (txHash: string) => {
    setRecentTxHash(txHash);
    setSelectedOrder(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Vendor Portal
                </h1>
                <p className="text-xs text-muted-foreground">
                  Manage your supply chain orders
                </p>
              </div>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-xl mx-auto">
          {/* Status Badges */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Zap className="h-3.5 w-3.5 text-yellow-500" />
              <span>Zero Gas</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Package className="h-3.5 w-3.5 text-blue-500" />
              <span>IPFS Stored</span>
            </div>
          </div>

          {/* Success Message */}
          {recentTxHash && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-emerald-400 text-sm">Order Accepted Successfully</p>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${recentTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-emerald-400 transition-colors mt-1 inline-block font-mono"
                  >
                    {recentTxHash.substring(0, 16)}...{recentTxHash.substring(recentTxHash.length - 12)} ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          {authenticated ? (
            selectedOrder ? (
              <AcceptOrderPanel
                order={selectedOrder}
                onBack={() => setSelectedOrder(null)}
                onSuccess={handleOrderAccepted}
              />
            ) : (
              <OrderList
                onSelectOrder={handleOrderSelect}
                selectedOrderId={selectedOrder?.orderId}
              />
            )
          ) : (
            <div className="text-center py-16 px-8 border border-dashed border-muted-foreground/20 rounded-2xl bg-muted/20">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Connect to View Orders</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Sign in with your wallet to see orders assigned to your address
              </p>
              <LoginButton />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
