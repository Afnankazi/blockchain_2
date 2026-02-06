'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSupplyChain } from '@/hooks/useSupplyChain';
import { Address } from 'viem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApproveOrderButtonProps {
    vendorAddress: Address;
    ipfsHash: string;
    onSuccess?: (txHash: string) => void;
    onError?: (error: Error) => void;
}

export default function ApproveOrderButton({
    vendorAddress,
    ipfsHash,
    onSuccess,
    onError,
}: ApproveOrderButtonProps) {
    const { authenticated, login } = usePrivy();
    const { createOrder, isLoading } = useSupplyChain();
    const [secretKey, setSecretKey] = useState('');
    const [showSecretInput, setShowSecretInput] = useState(false);

    const handleApproveOrder = async () => {
        if (!authenticated) {
            login();
            return;
        }

        if (!showSecretInput) {
            setShowSecretInput(true);
            return;
        }

        if (!secretKey) {
            alert('Please enter a secret delivery key');
            return;
        }

        try {
            console.log('📝 Creating order...');
            const txHash = await createOrder(vendorAddress, ipfsHash, secretKey);

            console.log('✅ Order created successfully!');
            console.log('Transaction Hash:', txHash);

            alert(`Order created successfully! 🎉\n\nTransaction: ${txHash}\n\nSave your secret key: ${secretKey}\n\nYou'll need this to verify delivery later.`);

            // Reset state
            setSecretKey('');
            setShowSecretInput(false);

            if (onSuccess) {
                onSuccess(txHash);
            }
        } catch (error) {
            console.error('❌ Error creating order:', error);
            alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);

            if (onError && error instanceof Error) {
                onError(error);
            }
        }
    };

    if (!authenticated) {
        return (
            <Button
                onClick={login}
                className="w-full"
            >
                Connect Wallet to Approve Order
            </Button>
        );
    }

    return (
        <div className="space-y-4">
            {showSecretInput && (
                <div className="space-y-2">
                    <Label htmlFor="secretKey">
                        Secret Delivery Key
                    </Label>
                    <Input
                        id="secretKey"
                        type="text"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="Enter a secret key for delivery verification"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                        ⚠️ Save this key! You'll need it to verify delivery later.
                    </p>
                </div>
            )}

            <Button
                onClick={handleApproveOrder}
                disabled={isLoading}
                className="w-full"
                variant={isLoading ? "secondary" : "default"}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        Processing...
                    </span>
                ) : showSecretInput ? (
                    '✅ Approve Order (No Gas Fee)'
                ) : (
                    '📝 Approve Order'
                )}
            </Button>

            {!isLoading && (
                <p className="text-xs text-center text-muted-foreground">
                    💸 Gas fees sponsored by Pimlico - You pay ZERO!
                </p>
            )}
        </div>
    );
}
