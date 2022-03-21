/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

const { API_URL, PRIVATE_KEY, POLYGONSCAN_API } = process.env;

module.exports = {
   solidity: {
     version: "0.8.9",
     settings: {
       optimizer: {
         enabled: true,
         runs: 200
       }
     }
   },
   defaultNetwork: "polygon_mumbai",
   networks: {
      hardhat: {},
      polygon_mumbai: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
   etherscan: {
     apiKey: {
       polygonMumbai: POLYGONSCAN_API
     }
   }
}