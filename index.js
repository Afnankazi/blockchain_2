import ipfsService from './services/ipfsService.js';

/**
 * Example usage of the IPFS Service
 */
async function main() {
    try {
        // Initialize the service
        await ipfsService.initialize();

        // Example order data
        const orderData = {
            customerId: '0x1234567890abcdef1234567890abcdef12345678',
            vendorId: '0xabcdef1234567890abcdef1234567890abcdef12',
            productDetails: 'Premium Widget Set - Model XYZ-2000',
            quantity: 100,
            price: 5000, // in USD cents
            deliveryAddress: '123 Supply Chain Ave, Blockchain City, BC 12345',
            timestamp: Date.now(),
            additionalNotes: 'Handle with care - fragile items'
        };

        console.log('\n📦 Uploading order to IPFS...');
        console.log('Order Data:', JSON.stringify(orderData, null, 2));
        
        // Upload to IPFS
        const ipfsHash = await ipfsService.uploadOrderDetails(orderData);
        
        console.log('\n✅ Success!');
        console.log('IPFS Hash (CID):', ipfsHash);
        console.log('Gateway URL:', ipfsService.getGatewayUrl(ipfsHash));
        console.log('\n💡 Use this IPFS hash when creating an order on the Polygon smart contract');

        // Note: IPFS content may take a few seconds to propagate
        console.log('\n📝 To retrieve later, the data will be available at:');
        console.log(`   ${ipfsService.getGatewayUrl(ipfsHash)}`);
        console.log('\n⏳ IPFS content may take 10-30 seconds to propagate globally');

        return ipfsHash;
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
main()
    .then(() => {
        console.log('\n✓ Process completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });

export { ipfsService };
