const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTRandomizer", function () {
  let nft, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFTRandomizer");
    nft = await NFT.deploy();
    await nft.waitForDeployment();
  });

  it("mints and exposes tokenURI", async function () {
    // pass a userSalt
    await nft.connect(addr1).mint(123);
    const uri = await nft.tokenURI(1);
    expect(uri).to.contain("data:application/json;base64,");
  });

  it("can preview traits and SVG before mint", async function () {
    // previewTraits requires (address, salt)
    const traits = await nft.previewTraits(addr1.address, 456);
    expect(traits.length).to.equal(3);

    const svg = await nft.previewSVG(addr1.address, 456);
    expect(svg).to.contain("data:image/svg+xml;base64,");
  });
});

