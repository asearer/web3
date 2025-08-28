// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * On-chain randomized ERC721 with SVG + metadata entirely on-chain.
 * This is an educational implementation using block.prevrandao + userSalt.
 *
 * NOTE: For production randomness use Chainlink VRF (see TODO comments).
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract NFTRandomizer is ERC721, Ownable {
    using Strings for uint256;

    uint256 public nextId;
    string[] private COLORS = ["#ff4757", "#2ed573", "#1e90ff", "#ffa502", "#a55eea"];
    string[] private SHAPES = ["CIRCLE", "SQUARE", "TRIANGLE", "STAR", "HEXAGON"];

    uint256 public mintPrice = 0; // set >0 if you want paid mints
    bool public paused = false;

    constructor() ERC721("Random On-Chain NFT", "rNFT") Ownable(msg.sender) {}

    // -----------------------------
    // Mint (educational randomness)
    // -----------------------------
    function mint(uint256 userSalt) external payable {
        require(!paused, "Mint paused");
        if (mintPrice > 0) require(msg.value >= mintPrice, "Insufficient ETH");

        uint256 tokenId = ++nextId;

        // ************* RANDOMNESS (DEMO) *************
        // In practice use Chainlink VRF to avoid manipulation.
        bytes32 h = keccak256(
            abi.encodePacked(block.prevrandao, block.timestamp, msg.sender, userSalt, tokenId)
        );
        // *********************************************

        // We mint; traits are derived deterministically from tokenId (see _seedFor/traitsFromSeed)
        _safeMint(msg.sender, tokenId);
    }

    // -----------------------------
    // Deterministic trait derivation
    // -----------------------------
    function _seedFor(uint256 tokenId) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), tokenId));
    }

    function traitsFromSeed(bytes32 seed) public view returns (uint8 color, uint8 shape, uint8 rarity) {
        color = uint8(uint256(seed) % COLORS.length);
        shape = uint8((uint256(seed) >> 16) % SHAPES.length);
        rarity = uint8((uint256(seed) >> 32) % 100); // 0..99
    }

    // Preview BEFORE mint using minter + salt (pure deterministic)
    function previewTraits(address minter, uint256 userSalt)
        external
        pure
        returns (uint8 color, uint8 shape, uint8 rarity)
    {
        bytes32 seed = keccak256(abi.encodePacked(minter, userSalt));
        color = uint8(uint256(seed) % 5);
        shape = uint8((uint256(seed) >> 16) % 5);
        rarity = uint8((uint256(seed) >> 32) % 100);
    }

    // -----------------------------
    // Metadata & SVG (on-chain)
    // -----------------------------
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");

        bytes32 seed = _seedFor(tokenId);
        (uint8 colorIdx, uint8 shapeIdx, uint8 rarityRoll) = traitsFromSeed(seed);

        string memory name = string.concat("rNFT #", tokenId.toString());
        string memory description = "On-chain randomized NFT (educational demo).";
        string memory image = _svgDataUri(colorIdx, shapeIdx, rarityRoll);

        string memory json = Base64.encode(
            bytes(
                string.concat(
                    '{"name":"', name,
                    '","description":"', description,
                    '","attributes":[',
                        '{"trait_type":"Color","value":"', COLORS[colorIdx], '"},',
                        '{"trait_type":"Shape","value":"', SHAPES[shapeIdx], '"},',
                        '{"trait_type":"Rarity","value":"', Strings.toString(rarityRoll), '"}',
                    '],"image":"', image, '"}'
                )
            )
        );

        return string.concat("data:application/json;base64,", json);
    }

    function previewSVG(address minter, uint256 userSalt) external pure returns (string memory) {
        bytes32 seed = keccak256(abi.encodePacked(minter, userSalt));
        uint8 colorIdx = uint8(uint256(seed) % 5);
        uint8 shapeIdx = uint8((uint256(seed) >> 16) % 5);
        uint8 rarity = uint8((uint256(seed) >> 32) % 100);

        return _svgDataUriPreview(colorIdx, shapeIdx, rarity);
    }

    function _svgDataUri(uint8 colorIdx, uint8 shapeIdx, uint8 rarity) internal view returns (string memory) {
        string memory svg = _svgString(COLORS[colorIdx], SHAPES[shapeIdx], rarity);
        return string.concat("data:image/svg+xml;base64,", Base64.encode(bytes(svg)));
    }

    function _svgDataUriPreview(uint8 colorIdx, uint8 shapeIdx, uint8 rarity) internal pure returns (string memory) {
        string[5] memory c = ["#ff4757", "#2ed573", "#1e90ff", "#ffa502", "#a55eea"];
        string[5] memory s = ["CIRCLE","SQUARE","TRIANGLE","STAR","HEXAGON"];
        string memory svg = _svgString(c[colorIdx], s[shapeIdx], rarity);
        return string.concat("data:image/svg+xml;base64,", Base64.encode(bytes(svg)));
    }

    function _svgString(string memory colorHex, string memory shape, uint8 rarity) internal pure returns (string memory) {
        string memory base =
            '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">'
            '<rect width="100%" height="100%" fill="#111111"/>';
        string memory shapeEl;
        if (keccak256(bytes(shape)) == keccak256("CIRCLE")) {
            shapeEl = string.concat('<circle cx="256" cy="256" r="120" fill="', colorHex, '"/>');
        } else if (keccak256(bytes(shape)) == keccak256("SQUARE")) {
            shapeEl = string.concat('<rect x="156" y="156" width="200" height="200" fill="', colorHex, '"/>');
        } else if (keccak256(bytes(shape)) == keccak256("TRIANGLE")) {
            shapeEl = string.concat('<polygon points="256,120 376,376 136,376" fill="', colorHex, '"/>');
        } else if (keccak256(bytes(shape)) == keccak256("STAR")) {
            shapeEl =
                string.concat('<polygon points="256,120 286,216 386,216 306,276 336,372 256,312 176,372 206,276 126,216 226,216" fill="', colorHex, '"/>');
        } else {
            shapeEl =
                string.concat('<polygon points="256,120 346,180 346,300 256,360 166,300 166,180" fill="', colorHex, '"/>');
        }

        string memory label =
            string.concat('<text x="50%" y="480" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="24">Rarity: ', Strings.toString(rarity), '/100</text>');
        return string.concat(base, shapeEl, label, "</svg>");
    }

    // Admin
    function setMintPrice(uint256 newPrice) external onlyOwner { mintPrice = newPrice; }
    function setPaused(bool p) external onlyOwner { paused = p; }

    // TODO: Add Chainlink VRF for secure randomness
}
