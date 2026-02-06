'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { LogOut, Wallet, Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function LoginButton() {
  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const [copied, setCopied] = useState(false);

  // Get the embedded wallet address
  const walletAddress = wallets?.[0]?.address;

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Wait for Privy to be ready
  if (!ready) {
    return (
      <Button size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (authenticated) {
    return (
      <div className="flex items-center gap-3">
        {/* Show wallet address */}
        {walletAddress && (
          <button
            onClick={copyAddress}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full hover:bg-muted/70 transition-colors"
            title={`Click to copy: ${walletAddress}`}
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-mono">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        )}
        {/* Show email if available */}
        {user?.email?.address && (
          <span className="text-xs text-muted-foreground hidden sm:block">
            {user.email.address}
          </span>
        )}
        <Button
          onClick={logout}
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => login()} size="sm" className="gap-2">
      <Wallet className="h-4 w-4" />
      Connect
    </Button>
  );
}
