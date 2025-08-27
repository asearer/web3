// SPDX-License-Identifier: MIT
// SPDX license identifier; required by Solidity compiler for open source licensing
pragma solidity ^0.8.28;
// Specifies the Solidity version; code will only compile with versions >=0.8.28 and <0.9.0

// Import OpenZeppelin's ERC20 implementation
// This gives us a standard, secure ERC20 token with all basic functionalities
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Import OpenZeppelin's Ownable contract
// This provides ownership control (onlyOwner modifier) to restrict access to certain functions
import "@openzeppelin/contracts/access/Ownable.sol";

// Define our token contract
// It inherits from ERC20 and Ownable
contract MyToken is ERC20, Ownable {

    // Constructor runs once when the contract is deployed
    // `initialSupply` is the number of tokens we want to create initially
    constructor(uint256 initialSupply) 
        ERC20("MyToken", "MTK") // Initialize the ERC20 with a name and symbol
        Ownable(msg.sender)     // Set the deployer as the owner of the contract
    {
        // Mint the initial supply to the deployer's address
        // `decimals()` returns the standard 18 decimals for ERC20 tokens
        // Multiplying by 10 ** decimals() ensures the correct token units
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // Public mint function to create new tokens
    // Only callable by the owner due to the `onlyOwner` modifier from Ownable
    function mint(address to, uint256 amount) public onlyOwner {
        // Mint `amount` tokens to the address `to`
        _mint(to, amount);
    }
}


