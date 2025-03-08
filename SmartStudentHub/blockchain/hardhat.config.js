require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const SKALE_ENDPOINT = process.env.SKALE_ENDPOINT || "https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague";
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 1337,
    },
    skale: {
      url: SKALE_ENDPOINT,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
      timeout: 60000
    }
  },
};