/**
* @type import('hardhat/config').HardhatUserConfig
*/

import 'dotenv/config'
import '@typechain/hardhat';
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import glob from 'glob';
import path from "path";

const { API_URL, PRIVATE_KEY, PRIVATE_KEY2, PRIVATE_KEY3, POLYGONSCAN_API } = process.env;

if (!process.env.SKIP_LOAD) {
  glob.sync('./tasks/**/*.ts').forEach(function (file) {
    require(path.resolve(file));
  });
}

export const solidity = {
  version: '0.8.10',
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
      details: {
        yul: true,
      },
    }
  }
};
export const defaultNetwork = "polygon_mumbai";
export const networks = {
  hardhat: {},
  polygon_mumbai: {
    url: API_URL,
    accounts: [`0x${PRIVATE_KEY}`, `0x${PRIVATE_KEY2}`, `0x${PRIVATE_KEY3}`]
  }
};
export const spdxLicenseIdentifier = {
  overwrite: false,
  runOnCompile: false,
};
export const etherscan = {
  apiKey: {
    polygonMumbai: POLYGONSCAN_API
  }
};