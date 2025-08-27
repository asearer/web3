// Import the `ethers` object from Hardhat, which provides utilities for interacting
// with Ethereum, deploying contracts, signing transactions, and more.
const { ethers } = require("hardhat");

async function main() {
  // Get the list of accounts/signers from the local Ethereum node (Hardhat network by default)
  // Here we use array destructuring to take the first account as the deployer
  const [deployer] = await ethers.getSigners();

  // Log the deployer's address to the console for reference
  console.log("Deploying contracts with account:", deployer.address);

  // Get the contract factory for "MyToken"
  // A contract factory in ethers.js is an abstraction used to deploy new smart contracts
  const MyToken = await ethers.getContractFactory("MyToken");

  // Deploy a new instance of MyToken with an initial supply of 1,000,000
  // The number 1_000_000 is just syntactic sugar for readability; it equals 1000000
  const token = await MyToken.deploy(1_000_000); 

  // Wait for the deployment transaction to be mined
  // This ensures the contract is fully deployed and we have an address
  await token.deployed();

  // Log the deployed contract address to the console
  console.log("MyToken deployed to:", token.address);
}

// Call the main function and handle any errors
// If an error occurs during deployment, it will be logged and the process exits with code 1
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


