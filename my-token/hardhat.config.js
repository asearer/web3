require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.28" }, // matches your contracts
      { version: "0.8.20" }  // optional, in case you use older contracts
    ],
  },
  networks: {
    hardhat: {},

    // Example: Sepolia Testnet
    sepolia: {
      url: process.env.ALCHEMY_API_KEY || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },

    // You can add other networks here (Polygon Mumbai, etc.)
  },
  paths: {
    sources: "./contracts",    // contracts folder
    tests: "./test",           // tests folder
    cache: "./cache",
    artifacts: "./artifacts",
  },
};


