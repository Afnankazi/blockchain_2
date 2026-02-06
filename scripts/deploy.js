const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // TODO: Add your contract deployment logic here
  // Example:
  // const ContractFactory = await ethers.getContractFactory("YourContract");
  // const contract = await ContractFactory.deploy();
  // await contract.waitForDeployment();
  // console.log("Contract deployed to:", await contract.getAddress());
  
  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });