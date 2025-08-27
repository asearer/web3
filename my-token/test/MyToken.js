// Import Chai assertion library
const { expect } = require("chai");
// Import Hardhat's ethers object for interacting with contracts and accounts
const { ethers } = require("hardhat");

describe("MyToken", function () {
  // Variables for contract instance and test accounts
  let token;
  let owner;
  let addr1;

  // This hook runs before each test
  // It deploys a fresh MyToken contract and resets accounts for isolation
  beforeEach(async function () {
    // Get a list of test accounts provided by Hardhat Network
    [owner, addr1] = await ethers.getSigners();

    // Get the contract factory for MyToken
    // The factory is an abstraction used to deploy new instances
    const MyToken = await ethers.getContractFactory("MyToken");

    // Deploy a new MyToken instance with 1,000,000 initial supply
    token = await MyToken.deploy(1_000_000);

    // Important: In Hardhat v2 + JS, deploy() already returns a deployed contract instance
    // We do NOT need to call `await token.deployed()` here
    // await token.deployTransaction.wait() could be used for full transaction confirmation on testnets
  });

  // Test 1: Check that the total supply is assigned to the owner
  it("Assigns total supply to owner", async function () {
    // Get the owner's balance
    const ownerBalance = await token.balanceOf(owner.address);
    // Compare the owner's balance to total supply
    expect(await token.totalSupply()).to.equal(ownerBalance);
  });

  // Test 2: Check that token transfers work
  it("Transfers tokens between accounts", async function () {
    // Transfer 1,000 tokens from owner to addr1
    await token.transfer(addr1.address, 1000);
    // addr1 should now have 1,000 tokens
    expect(await token.balanceOf(addr1.address)).to.equal(1000);
  });

  // Test 3: Ensure only owner can mint new tokens
  it("Allows owner to mint tokens", async function () {
    // Owner mints 5,000 tokens to addr1
    await token.mint(addr1.address, 5000);
    // addr1 should now have 5,000 tokens
    expect(await token.balanceOf(addr1.address)).to.equal(5000);
  });

  // Test 4: Ensure non-owner cannot mint
  it("Prevents non-owner from minting", async function () {
    // addr1 tries to mint 1,000 tokens (should revert)
    await expect(token.connect(addr1).mint(addr1.address, 1000)).to.be.reverted;
  });
});


