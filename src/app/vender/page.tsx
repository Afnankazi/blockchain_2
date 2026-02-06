'use client';

import LoginButton from '@/components/vender/LoginButton';
import OrderForm from '@/components/vender/OrderForm';
import { useState } from 'react';

export default function Home() {
  const [recentTxHash, setRecentTxHash] = useState<string>('');

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Supply Chain Synthesizer
              </h1>
              <p className="text-sm text-gray-600">
                Powered by Polygon Amoy Testnet, IPFS & Privy
              </p>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Gasless Supply Chain Management
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create, track, and verify supply chain orders on Polygon blockchain
            with zero gas fees. Powered by Privy authentication and Pimlico
            paymaster.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Secure Authentication</h3>
            <p className="text-gray-600 text-sm">
              Login with email, social, or wallet using Privy. Embedded wallets
              created automatically.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">💸</div>
            <h3 className="text-lg font-semibold mb-2">Zero Gas Fees</h3>
            <p className="text-gray-600 text-sm">
              All transactions are gasless thanks to Pimlico paymaster. Users
              pay nothing!
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="text-lg font-semibold mb-2">IPFS Storage</h3>
            <p className="text-gray-600 text-sm">
              Order details stored on IPFS for immutable, decentralized record
              keeping.
            </p>
          </div>
        </div>

        {/* Order Form */}
        <OrderForm onOrderCreated={setRecentTxHash} />

        {/* Recent Transaction */}
        {recentTxHash && (
          <div className="mt-8 max-w-2xl mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">
              ✅ Order Created Successfully!
            </h3>
            <p className="text-sm text-green-800">
              <span className="font-medium">Transaction Hash:</span>{' '}
              <a
                href={`https://amoy.polygonscan.com/tx/${recentTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-900"
              >
                {recentTxHash.substring(0, 10)}...
                {recentTxHash.substring(recentTxHash.length - 8)}
              </a>
            </p>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Upload to IPFS</h4>
                <p className="text-gray-600 text-sm">
                  Upload order details (JSON) to IPFS using the Pinata service.
                  Get the IPFS hash.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Connect Wallet</h4>
                <p className="text-gray-600 text-sm">
                  Login with Privy. An embedded wallet is created automatically
                  if you don't have one.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Approve Order</h4>
                <p className="text-gray-600 text-sm">
                  Click "Approve Order" to create the order on Polygon. Set a
                  secret key for delivery verification. No gas fees!
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Track & Verify</h4>
                <p className="text-gray-600 text-sm">
                  Vendor accepts the order. Customer verifies delivery using
                  their secret key. All on-chain!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            Built with ❤️ using Polygon Amoy Testnet, Privy & IPFS
          </p>
        </div>
      </footer>
    </main>
  );
}
