import {
  createPublicClient,
  http,
  Address,
  Hash,
  toHex,
} from 'viem';
import { polygonAmoy } from 'viem/chains';
import { createSmartAccountClient } from 'permissionless';
import { signerToSimpleSmartAccount } from 'permissionless/accounts';
import { createPimlicoPaymasterClient } from 'permissionless/clients/pimlico';

export interface CreateOrderParams {
  vendor: Address;
  ipfsHash: string;
  deliveryHash: `0x${string}`;
}

// Use EntryPoint v0.7
const ENTRYPOINT_ADDRESS_V07 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032' as const;

/**
 * Service for GASLESS transactions using Pimlico paymaster
 * Users pay ZERO gas fees - Pimlico sponsors everything!
 */
export class PimlicoService {
  private pimlicoApiKey: string;
  private contractAddress: Address;
  private supplyChainABI = [
    {
      inputs: [
        { internalType: 'address', name: '_vendor', type: 'address' },
        { internalType: 'string', name: '_ipfsHash', type: 'string' },
        { internalType: 'bytes32', name: '_deliveryHash', type: 'bytes32' },
      ],
      name: 'createOrder',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '_orderId', type: 'uint256' }],
      name: 'acceptOrder',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'uint256', name: '_orderId', type: 'uint256' },
        { internalType: 'string', name: '_secretKey', type: 'string' },
      ],
      name: 'verifyDelivery',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const;

  constructor(pimlicoApiKey: string, contractAddress: Address) {
    this.pimlicoApiKey = pimlicoApiKey;
    this.contractAddress = contractAddress;
  }

  /**
   * Compute the smart account address for an EOA
   * This is the counterfactual address that will be used when the EOA
   * creates/uses a smart account through Pimlico
   */
  async getSmartAccountAddress(eoaAddress: Address): Promise<Address> {
    const publicClient = createPublicClient({
      transport: http('https://rpc-amoy.polygon.technology'),
      chain: polygonAmoy,
    });

    // Create a mock signer just to compute the address
    const mockSigner = {
      signMessage: async () => '0x' as `0x${string}`,
      signTypedData: async () => '0x' as `0x${string}`,
      address: eoaAddress,
    } as any;

    const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
      signer: mockSigner,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    return simpleAccount.address;
  }

  /**
   * Create smart account with Pimlico paymaster sponsorship
   */
  private async createSmartAccount(provider: any) {
    const publicClient = createPublicClient({
      transport: http('https://rpc-amoy.polygon.technology'),
      chain: polygonAmoy,
    });

    const pimlicoUrl = `https://api.pimlico.io/v2/polygon-amoy/rpc?apikey=${this.pimlicoApiKey}`;

    // Create paymaster client
    const paymasterClient = createPimlicoPaymasterClient({
      transport: http(pimlicoUrl),
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    // Ensure we have the user address
    let userAddress = provider.selectedAddress;
    if (!userAddress) {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        userAddress = accounts[0];
      } catch (e) {
        console.error("Failed to get accounts via eth_accounts", e);
      }
    }

    if (!userAddress) {
      throw new Error("Owner account not found: Could not resolve wallet address");
    }

    // Get signer from Privy provider
    const customSigner = {
      signMessage: async ({ message }: any) => {
        let msg = message;
        // Handle { raw: ... } object format from viem
        if (typeof message === 'object' && message && message.raw) {
          msg = message.raw;
        }
        
        // Convert byte array to hex string
        if (typeof msg !== 'string') {
          msg = toHex(msg);
        }

        const signature = await provider.request({
          method: 'personal_sign',
          params: [msg, userAddress],
        });
        return signature;
      },
      signTypedData: async (typedData: any) => {
        const signature = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [userAddress, JSON.stringify(typedData)],
        });
        return signature;
      },
      address: userAddress as Address,
    } as any;

    // Create simple smart account
    const simpleAccount = await signerToSimpleSmartAccount(publicClient, {
      signer: customSigner,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    });

    // Create smart account client with Pimlico paymaster
    const smartAccountClient = createSmartAccountClient({
      account: simpleAccount,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      chain: polygonAmoy,
      bundlerTransport: http(pimlicoUrl),
      middleware: {
        sponsorUserOperation: paymasterClient.sponsorUserOperation,
      },
    });

    return smartAccountClient;
  }

  /**
   * Create an order with GASLESS transaction
   * Pimlico pays ALL gas fees - user pays NOTHING!
   * 
   * IMPORTANT: The vendor address passed here should be the vendor's SMART ACCOUNT address
   * so that when the vendor calls acceptOrder using their smart account, msg.sender matches.
   */
  async createOrderGasless(
    provider: any,
    params: CreateOrderParams
  ): Promise<Hash> {
    try {
      console.log('🔄 Creating smart account with Pimlico paymaster...');
      
      const smartAccountClient = await this.createSmartAccount(provider);

      console.log('📝 Sending GASLESS transaction...');
      console.log('Smart Account:', smartAccountClient.account.address);
      console.log('Vendor:', params.vendor);
      console.log('IPFS Hash:', params.ipfsHash);
      console.log('💸 Gas fees: SPONSORED by Pimlico!');

      const txHash = await smartAccountClient.writeContract({
        address: this.contractAddress,
        abi: this.supplyChainABI,
        functionName: 'createOrder',
        args: [params.vendor, params.ipfsHash, params.deliveryHash],
      });

      console.log('✅ Gasless transaction successful:', txHash);
      console.log('💰 User paid: $0.00 (Pimlico covered gas)');
      return txHash;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Accept an order (gasless)
   */
  async acceptOrderGasless(provider: any, orderId: bigint): Promise<Hash> {
    try {
      const smartAccountClient = await this.createSmartAccount(provider);

      const txHash = await smartAccountClient.writeContract({
        address: this.contractAddress,
        abi: this.supplyChainABI,
        functionName: 'acceptOrder',
        args: [orderId],
      });

      console.log('✅ Order accepted (gasless):', txHash);
      return txHash;
    } catch (error) {
      console.error('❌ Error accepting order:', error);
      throw new Error(`Failed to accept order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify delivery (gasless)
   */
  async verifyDeliveryGasless(
    provider: any,
    orderId: bigint,
    secretKey: string
  ): Promise<Hash> {
    try {
      const smartAccountClient = await this.createSmartAccount(provider);

      const txHash = await smartAccountClient.writeContract({
        address: this.contractAddress,
        abi: this.supplyChainABI,
        functionName: 'verifyDelivery',
        args: [orderId, secretKey],
      });

      console.log('✅ Delivery verified (gasless):', txHash);
      return txHash;
    } catch (error) {
      console.error('❌ Error verifying delivery:', error);
      throw new Error(`Failed to verify delivery: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read order details from contract
   */
  async getOrder(orderId: bigint) {
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http('https://rpc-amoy.polygon.technology'),
    });

    const result = await publicClient.readContract({
      address: this.contractAddress,
      abi: [
        {
          inputs: [{ internalType: 'uint256', name: '_orderId', type: 'uint256' }],
          name: 'getOrder',
          outputs: [
            { internalType: 'address', name: 'customer', type: 'address' },
            { internalType: 'address', name: 'vendor', type: 'address' },
            { internalType: 'string', name: 'ipfsHash', type: 'string' },
            { internalType: 'enum SupplyChainSynthesizer.OrderStatus', name: 'status', type: 'uint8' },
            { internalType: 'bytes32', name: 'deliveryHash', type: 'bytes32' },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ] as const,
      functionName: 'getOrder',
      args: [orderId],
    });

    return {
      customer: result[0],
      vendor: result[1],
      ipfsHash: result[2],
      status: result[3],
      deliveryHash: result[4],
    };
  }

  /**
   * Get total order count from contract
   */
  async getOrderCount(): Promise<bigint> {
    const publicClient = createPublicClient({
      chain: polygonAmoy,
      transport: http('https://rpc-amoy.polygon.technology'),
    });

    const result = await publicClient.readContract({
      address: this.contractAddress,
      abi: [
        {
          inputs: [],
          name: 'orderCount',
          outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ] as const,
      functionName: 'orderCount',
    });

    return result;
  }

  /**
   * Get all orders for a specific vendor
   * Checks both EOA and smart account addresses to support all orders
   */
  async getOrdersForVendor(vendorAddress: Address, vendorSmartAccountAddress?: Address) {
    const orderCount = await this.getOrderCount();
    const orders: Array<{
      orderId: bigint;
      customer: Address;
      vendor: Address;
      ipfsHash: string;
      status: number;
      deliveryHash: `0x${string}`;
    }> = [];

    // Addresses to check - include both EOA and smart account
    const addressesToCheck = [vendorAddress.toLowerCase()];
    if (vendorSmartAccountAddress) {
      addressesToCheck.push(vendorSmartAccountAddress.toLowerCase());
    }

    for (let i = BigInt(0); i < orderCount; i = i + BigInt(1)) {
      try {
        const order = await this.getOrder(i);
        // Check if the order's vendor matches either the EOA or smart account address
        if (addressesToCheck.includes(order.vendor.toLowerCase())) {
          orders.push({
            orderId: i,
            customer: order.customer,
            vendor: order.vendor,
            ipfsHash: order.ipfsHash,
            status: order.status,
            deliveryHash: order.deliveryHash,
          });
        }
      } catch (e) {
        console.error(`Error fetching order ${i}:`, e);
      }
    }

    return orders;
  }
}
