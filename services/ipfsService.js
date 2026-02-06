import { PinataSDK } from "pinata";
import dotenv from 'dotenv';

dotenv.config();

/**
 * IPFS Service using Pinata SDK
 * Handles uploading order details to IPFS and retrieving the hash
 */
class IPFSService {
    constructor() {
        // Initialize Pinata SDK with JWT token
        this.pinata = new PinataSDK({
            pinataJwt: process.env.PINATA_JWT
        });
        
        this.initialized = false;
    }

    /**
     * Initialize and test the Pinata connection
     */
    async initialize() {
        try {
            await this.pinata.testAuthentication();
            this.initialized = true;
            console.log('✓ Pinata SDK initialized successfully');
            return true;
        } catch (error) {
            console.error('✗ Failed to initialize Pinata SDK:', error.message);
            throw new Error('Pinata authentication failed. Check your PINATA_JWT environment variable.');
        }
    }

    /**
     * Upload order details to IPFS
     * @param {Object} orderData - Order details to upload
     * @param {string} orderData.customerId - Customer identifier
     * @param {string} orderData.vendorId - Vendor identifier
     * @param {string} orderData.productDetails - Product description
     * @param {number} orderData.quantity - Order quantity
     * @param {number} orderData.price - Order price
     * @param {string} orderData.deliveryAddress - Delivery address
     * @param {number} orderData.timestamp - Order timestamp
     * @returns {Promise<string>} IPFS hash (CID)
     */
    async uploadOrderDetails(orderData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Validate order data
            this.validateOrderData(orderData);

            // Add metadata for better organization
            const metadata = {
                name: `Order_${orderData.customerId}_${Date.now()}`,
                keyvalues: {
                    customer: orderData.customerId,
                    vendor: orderData.vendorId,
                    timestamp: orderData.timestamp?.toString() || Date.now().toString()
                }
            };

            // Upload JSON to IPFS
            const result = await this.pinata.upload.json(orderData, {
                metadata: metadata
            });
            
            // New Pinata SDK returns { cid, ... }
            const ipfsHash = result.cid;
            console.log(`✓ Order details uploaded to IPFS: ${ipfsHash}`);
            
            return ipfsHash;
        } catch (error) {
            console.error('✗ Failed to upload to IPFS:', error.message);
            throw new Error(`IPFS upload failed: ${error.message}`);
        }
    }

    /**
     * Retrieve order details from IPFS
     * @param {string} ipfsHash - IPFS hash (CID) to retrieve
     * @returns {Promise<Object>} Order data
     */
    async getOrderDetails(ipfsHash) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            // Use the public gateway to fetch data
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`✓ Retrieved order details from IPFS: ${ipfsHash}`);
            return data;
        } catch (error) {
            console.error('✗ Failed to retrieve from IPFS:', error.message);
            throw new Error(`IPFS retrieval failed: ${error.message}`);
        }
    }

    /**
     * Validate order data structure
     * @param {Object} orderData - Order data to validate
     * @throws {Error} If validation fails
     */
    validateOrderData(orderData) {
        if (!orderData || typeof orderData !== 'object') {
            throw new Error('Order data must be a valid object');
        }

        const requiredFields = ['customerId', 'vendorId', 'productDetails'];
        const missingFields = requiredFields.filter(field => !orderData[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
    }

    /**
     * Upload multiple orders in batch
     * @param {Array<Object>} ordersArray - Array of order objects
     * @returns {Promise<Array<string>>} Array of IPFS hashes
     */
    async uploadBatch(ordersArray) {
        if (!Array.isArray(ordersArray)) {
            throw new Error('Input must be an array of orders');
        }

        const results = [];
        for (const order of ordersArray) {
            const hash = await this.uploadOrderDetails(order);
            results.push(hash);
        }

        return results;
    }

    /**
     * Get gateway URL for an IPFS hash
     * @param {string} ipfsHash - IPFS hash (CID)
     * @returns {string} Gateway URL
     */
    getGatewayUrl(ipfsHash) {
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    }
}

// Export singleton instance
export default new IPFSService();
