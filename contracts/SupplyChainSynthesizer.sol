// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SupplyChainSynthesizer
 * @dev Supply chain management contract for Polygon network
 */
contract SupplyChainSynthesizer {
    
    enum OrderStatus { Created, Accepted, Verified }
    
    struct Order {
        address customer;
        address vendor;
        string ipfsHash;
        OrderStatus status;
        bytes32 deliveryHash;
    }
    
    mapping(uint256 => Order) public orders;
    uint256 public orderCount;
    
    event OrderCreated(uint256 indexed orderId, address indexed customer, address indexed vendor, string ipfsHash);
    event OrderAccepted(uint256 indexed orderId, address indexed vendor);
    event OrderVerified(uint256 indexed orderId, address indexed customer);
    
    modifier onlyCustomer(uint256 _orderId) {
        require(msg.sender == orders[_orderId].customer, "Only customer can call this function");
        _;
    }
    
    modifier onlyVendor(uint256 _orderId) {
        require(msg.sender == orders[_orderId].vendor, "Only vendor can call this function");
        _;
    }
    
    /**
     * @dev Creates a new order
     * @param _vendor Address of the vendor
     * @param _ipfsHash IPFS hash containing order details
     * @param _deliveryHash Hash of the secret delivery key
     */
    function createOrder(
        address _vendor,
        string memory _ipfsHash,
        bytes32 _deliveryHash
    ) external returns (uint256) {
        require(_vendor != address(0), "Invalid vendor address");
        require(_vendor != msg.sender, "Customer and vendor cannot be the same");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_deliveryHash != bytes32(0), "Delivery hash cannot be empty");
        
        uint256 orderId = orderCount++;
        
        orders[orderId] = Order({
            customer: msg.sender,
            vendor: _vendor,
            ipfsHash: _ipfsHash,
            status: OrderStatus.Created,
            deliveryHash: _deliveryHash
        });
        
        emit OrderCreated(orderId, msg.sender, _vendor, _ipfsHash);
        
        return orderId;
    }
    
    /**
     * @dev Vendor accepts the order
     * @param _orderId ID of the order to accept
     */
    function acceptOrder(uint256 _orderId) external onlyVendor(_orderId) {
        require(orders[_orderId].status == OrderStatus.Created, "Order must be in Created status");
        
        orders[_orderId].status = OrderStatus.Accepted;
        
        emit OrderAccepted(_orderId, msg.sender);
    }
    
    /**
     * @dev Customer verifies delivery by providing the secret key
     * @param _orderId ID of the order to verify
     * @param _secretKey Secret key to match against deliveryHash
     */
    function verifyDelivery(uint256 _orderId, string memory _secretKey) external onlyCustomer(_orderId) {
        require(orders[_orderId].status == OrderStatus.Accepted, "Order must be in Accepted status");
        require(keccak256(abi.encodePacked(_secretKey)) == orders[_orderId].deliveryHash, "Invalid secret key");
        
        orders[_orderId].status = OrderStatus.Verified;
        
        emit OrderVerified(_orderId, msg.sender);
    }
    
    /**
     * @dev Get order details
     * @param _orderId ID of the order
     */
    function getOrder(uint256 _orderId) external view returns (
        address customer,
        address vendor,
        string memory ipfsHash,
        OrderStatus status,
        bytes32 deliveryHash
    ) {
        Order memory order = orders[_orderId];
        return (
            order.customer,
            order.vendor,
            order.ipfsHash,
            order.status,
            order.deliveryHash
        );
    }
    
    /**
     * @dev Get order status
     * @param _orderId ID of the order
     */
    function getOrderStatus(uint256 _orderId) external view returns (OrderStatus) {
        return orders[_orderId].status;
    }
}
