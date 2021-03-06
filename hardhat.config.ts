import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// PRIVATE_KEY
const privateKey: string | undefined = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Please set your PRIVATE_KEY in a .env file");
}
const privateKeyProd: string | undefined = process.env.PRIVATE_KEY_PROD;
if (!privateKeyProd) {
  throw new Error("Please set your PRIVATE_KEY_PROD in a .env file");
}

// HD Wallet mnemonic
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}

// alchemy api key
const alchemy: string | undefined = process.env.ALCHEMY_ETH_API_KEY;
if (!alchemy) {
  throw new Error("Please set your ALCHEMY_ETH_API_KEY in a .env file");
}

const chainIds = {
  // mainnet
  mainnet: 1,
  polygon: 137,
  // testnet
  ropsten: 3,
  rinkeby: 4,
  ganache: 1337,
};

const hdAccounts = {
  count: 10,
  mnemonic,
  path: "m/44'/60'/0'/0",
};

const getChainConfig = (chain: keyof typeof chainIds) => {
  return chain === "ganache"
    ? {
        chainId: chainIds[chain],
        url: "HTTP://127.0.0.1:7545",
        accounts: [
          "0x40d426086e45595aaa3032bb9659f6fbd0e73a074dd2c8d63af3e8e4388bfdfe",
          "0x92044429edfc6f8578a1cec5682b35ee5ef7c98f86652dfb85075ddb0caccfec",
          "0x92044429edfc6f8578a1cec5682b35ee5ef7c98f86652dfb85075ddb0caccfec",
        ],
      }
    : chain === "polygon"
    ? {
        chainId: chainIds[chain],
        url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_API_KEY}`,
        accounts: [privateKeyProd],
      }
    : {
        chainId: chainIds[chain],
        url: `https://eth-${chain}.alchemyapi.io/v2/${alchemy}`,
        accounts: chain === "mainnet" ? [privateKeyProd] : [privateKey],
      };
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      accounts: hdAccounts,
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${alchemy}`,
        blockNumber: 11095000,
      },
    },
    ganache: getChainConfig("ganache"),
    mainnet: getChainConfig("mainnet"),
    polygon: getChainConfig("polygon"),
    ropsten: getChainConfig("ropsten"),
    rinkeby: getChainConfig("rinkeby"),
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./tests",
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
};

export default config;
