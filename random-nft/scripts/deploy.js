const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const NFT = await hre.ethers.getContractFactory("NFTRandomizer");
  const nft = await NFT.deploy();
  await nft.deployed();

  console.log("NFTRandomizer deployed to:", nft.address);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
