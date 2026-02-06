'use client';

import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { PimlicoService } from '@/services/pimlicoService';
import { generateDeliveryHash } from '@/utils/blockchain';
import { Address } from 'viem';

export interface Order {
  orderId: bigint;
  customer: Address;
  vendor: Address;
  ipfsHash: string;
  status: number;
  deliveryHash: `0x${string}`;
}

interface UseSupplyChainReturn {
  createOrder: (vendor: Address, ipfsHash: string, secretKey: string) => Promise<string>;
  acceptOrder: (orderId: bigint) => Promise<string>;
  verifyDelivery: (orderId: bigint, secretKey: string) => Promise<string>;
  fetchVendorOrders: (vendorAddress: Address) => Promise<Order[]>;
  orders: Order[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
}

export function useSupplyChain(): UseSupplyChainReturn {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getPimlicoService = () => {
    const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY || '';
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
    
    if (!apiKey || !contractAddress) {
      throw new Error('Missing Pimlico API key or contract address');
    }
    
    return new PimlicoService(apiKey, contractAddress);
  };

  const fetchVendorOrders = useCallback(async (vendorAddress: Address): Promise<Order[]> => {
    setIsFetching(true);
    setError(null);

    try {
      const pimlicoService = getPimlicoService();
      
      // Convert vendor EOA to smart account address
      console.log('🔄 Computing vendor smart account address for fetching orders...');
      const vendorSmartAccountAddress = await pimlicoService.getSmartAccountAddress(vendorAddress);
      console.log('📍 Vendor EOA:', vendorAddress);
      console.log('📍 Vendor Smart Account:', vendorSmartAccountAddress);
      
      // Pass both EOA and smart account address to find orders created with either
      // This supports both legacy orders (created with EOA) and new orders (created with smart account)
      const fetchedOrders = await pimlicoService.getOrdersForVendor(vendorAddress, vendorSmartAccountAddress);
      setOrders(fetchedOrders);
      setIsFetching(false);
      return fetchedOrders;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsFetching(false);
      throw err;
    }
  }, []);

  const createOrder = async (
    vendor: Address,
    ipfsHash: string,
    secretKey: string
  ): Promise<string> => {
    if (!authenticated) {
      throw new Error('User not authenticated');
    }

    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();
      
      // Generate delivery hash from secret key
      const deliveryHash = generateDeliveryHash(secretKey);

      const pimlicoService = getPimlicoService();
      
      // CRITICAL: Convert vendor's EOA to their smart account address
      // The contract stores this as the vendor, so when the vendor calls acceptOrder
      // using their smart account, msg.sender will match order.vendor
      console.log('🔄 Computing vendor smart account address...');
      const vendorSmartAccountAddress = await pimlicoService.getSmartAccountAddress(vendor);
      console.log('📍 Vendor EOA (input):', vendor);
      console.log('📍 Vendor Smart Account (stored in contract):', vendorSmartAccountAddress);
      
      // Pass the vendor's SMART ACCOUNT address as the vendor
      // This ensures acceptOrder works when called from the vendor's smart account
      const txHash = await pimlicoService.createOrderGasless(provider, {
        vendor: vendorSmartAccountAddress,  // Use smart account address!
        ipfsHash,
        deliveryHash,
      });

      setIsLoading(false);
      return txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const acceptOrder = async (orderId: bigint): Promise<string> => {
    if (!authenticated) {
      throw new Error('User not authenticated');
    }

    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();

      const pimlicoService = getPimlicoService();
      const txHash = await pimlicoService.acceptOrderGasless(provider, orderId);

      setIsLoading(false);
      return txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const verifyDelivery = async (orderId: bigint, secretKey: string): Promise<string> => {
    if (!authenticated) {
      throw new Error('User not authenticated');
    }

    if (!wallets || wallets.length === 0) {
      throw new Error('No wallet available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthereumProvider();

      const pimlicoService = getPimlicoService();
      const txHash = await pimlicoService.verifyDeliveryGasless(
        provider,
        orderId,
        secretKey
      );

      setIsLoading(false);
      return txHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return {
    createOrder,
    acceptOrder,
    verifyDelivery,
    fetchVendorOrders,
    orders,
    isLoading,
    isFetching,
    error,
  };
}
