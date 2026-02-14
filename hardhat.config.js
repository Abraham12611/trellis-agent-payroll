require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local Hardhat Network
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true
    },
    
    // Tempo Testnet (Moderato)
    moderato: {
      url: process.env.TEMPO_RPC_URL || "https://rpc.moderato.tempo.xyz",
      chainId: 42431,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto"
    },
    
    // Tempo Mainnet (when available)
    tempo: {
      url: process.env.TEMPO_MAINNET_RPC || "https://rpc.tempo.xyz",
      chainId: 42430,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  etherscan: {
    customChains: [
      {
        network: "moderato",
        chainId: 42431,
        urls: {
          apiURL: "https://api.explore.tempo.xyz/api",
          browserURL: "https://explore.tempo.xyz"
        }
      }
    ],
    apiKey: {
      moderato: process.env.TEMPO_API_KEY || "your-api-key"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
