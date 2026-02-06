'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { PimlicoService } from '@/services/pimlicoService';
import { generateDeliveryHash } from '@/utils/blockchain';
import { Address } from 'viem';

interface UseSupplyChainReturn {
  createOrder: (vendor: Address, ipfsHash: string, secretKey: string) => Promise<string>;
  acceptOrder: (orderId: bigint) => Promise<string>;
  verifyDelivery: (orderId: bigint, secretKey: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function useSupplyChain(): UseSupplyChainReturn {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPimlicoService = () => {
    const apiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY || '';
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
    
    if (!apiKey || !contractAddress) {
      throw new Error('Missing Pimlico API key or contract address');
    }
    
    return new PimlicoService(apiKey, contractAddress);
  };

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
      const txHash = await pimlicoService.createOrderGasless(provider, {
        vendor,
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
    isLoading,
    error,
  };
}
