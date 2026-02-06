import { keccak256, toHex } from 'viem';

/**
 * Generate a delivery hash from a secret key
 * @param secretKey - The secret key to hash
 * @returns The keccak256 hash of the secret key
 */
export function generateDeliveryHash(secretKey: string): `0x${string}` {
  return keccak256(toHex(secretKey));
}

/**
 * Format an address for display
 * @param address - Full address
 * @returns Shortened address (0x1234...5678)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get order status text
 * @param status - Status number (0, 1, or 2)
 */
export function getOrderStatusText(status: number): string {
  const statusMap: { [key: number]: string } = {
    0: 'Created',
    1: 'Accepted',
    2: 'Verified',
  };
  return statusMap[status] || 'Unknown';
}

/**
 * Get order status color
 * @param status - Status number (0, 1, or 2)
 */
export function getOrderStatusColor(status: number): string {
  const colorMap: { [key: number]: string } = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-green-100 text-green-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
