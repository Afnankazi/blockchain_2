const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");
  
  // Deploy SupplyChainSynthesizer
  const SupplyChainSynthesizer = await ethers.getContractFactory("SupplyChainSynthesizer");
  const contract = await SupplyChainSynthesizer.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("SupplyChainSynthesizer deployed to:", contractAddress);
  console.log("");
  console.log("📋 Update your .env file with:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS="${contractAddress}"`);
  
  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });