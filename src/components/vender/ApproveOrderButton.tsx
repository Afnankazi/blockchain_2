'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSupplyChain } from '@/hooks/useSupplyChain';
import { Address } from 'viem';

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
            <button
                onClick={login}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
                Connect Wallet to Approve Order
            </button>
        );
    }

    return (
        <div className="space-y-4">
            {showSecretInput && (
                <div className="space-y-2">
                    <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700">
                        Secret Delivery Key
                    </label>
                    <input
                        id="secretKey"
                        type="text"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="Enter a secret key for delivery verification"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                        ⚠️ Save this key! You'll need it to verify delivery later.
                    </p>
                </div>
            )}

            <button
                onClick={handleApproveOrder}
                disabled={isLoading}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Processing (Gasless)...
                    </span>
                ) : showSecretInput ? (
                    '✅ Approve Order (No Gas Fee)'
                ) : (
                    '📝 Approve Order'
                )}
            </button>

            {!isLoading && (
                <p className="text-xs text-center text-gray-500">
                    💸 Gas fees sponsored by Pimlico - You pay ZERO!
                </p>
            )}
        </div>
    );
}
