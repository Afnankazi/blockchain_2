'use client';

import { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSupplyChain, Order } from '@/hooks/useSupplyChain';
import { formatAddress, getOrderStatusText } from '@/utils/blockchain';
import { Address } from 'viem';
import { Clock, CheckCircle2, Package, RefreshCw, ChevronRight, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderListProps {
  onSelectOrder: (order: Order) => void;
  selectedOrderId?: bigint;
}

export default function OrderList({ onSelectOrder, selectedOrderId }: OrderListProps) {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { fetchVendorOrders, orders, isFetching } = useSupplyChain();
  const [hasLoaded, setHasLoaded] = useState(false);

  const vendorAddress = wallets?.[0]?.address as Address | undefined;

  useEffect(() => {
    if (authenticated && vendorAddress && !hasLoaded) {
      fetchVendorOrders(vendorAddress).then(() => setHasLoaded(true));
    }
  }, [authenticated, vendorAddress, fetchVendorOrders, hasLoaded]);

  const handleRefresh = () => {
    if (vendorAddress) {
      fetchVendorOrders(vendorAddress);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 0);
  const acceptedOrders = orders.filter((o) => o.status === 1);
  const verifiedOrders = orders.filter((o) => o.status === 2);

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 1:
        return <Package className="h-4 w-4 text-blue-500" />;
      case 2:
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: number) => {
    const styles = {
      0: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      1: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      2: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
    return styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground';
  };

  if (!authenticated) {
    return null;
  }

  if (isFetching && !hasLoaded) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-8">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-8">
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No orders found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Orders assigned to your address will appear here
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="mt-4 gap-2"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const renderOrderItem = (order: Order) => {
    const isSelected = selectedOrderId === order.orderId;
    const isPending = order.status === 0;

    return (
      <button
        key={order.orderId.toString()}
        onClick={() => onSelectOrder(order)}
        disabled={!isPending}
        className={`w-full text-left p-4 rounded-xl border transition-all ${
          isSelected
            ? 'bg-primary/5 border-primary/30'
            : isPending
            ? 'bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border cursor-pointer'
            : 'bg-muted/20 border-border/30 opacity-60 cursor-default'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-9 w-9 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
              {getStatusIcon(order.status)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Order #{order.orderId.toString()}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                  {getOrderStatusText(order.status)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                From: {formatAddress(order.customer)}
              </p>
            </div>
          </div>
          {isPending && (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Your Orders</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pendingOrders.length} pending • {acceptedOrders.length} accepted • {verifiedOrders.length} verified
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 px-1">
            PENDING APPROVAL
          </p>
          <div className="space-y-2">
            {pendingOrders.map(renderOrderItem)}
          </div>
        </div>
      )}

      {/* Other Orders */}
      {(acceptedOrders.length > 0 || verifiedOrders.length > 0) && (
        <div className="p-4 pt-0">
          <p className="text-xs font-medium text-muted-foreground mb-3 px-1">
            PROCESSED
          </p>
          <div className="space-y-2">
            {acceptedOrders.map(renderOrderItem)}
            {verifiedOrders.map(renderOrderItem)}
          </div>
        </div>
      )}
    </div>
  );
}
