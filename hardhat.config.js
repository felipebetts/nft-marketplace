require("@nomiclabs/hardhat-waffle");
const fs = require('fs')

const { resolve } = require("path");
const { config: dotenvConfig } = require("dotenv")

dotenvConfig({ path: resolve(__dirname, "./.env") });

const privateKey = process.env.PVT_KEY.toString()

const projectId = 'ff0f19c811cd4b72bbcd6b1047501630'


module.exports = {
  networks: {
    // configurando as redes blockchain a serem utilizadas
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts: [privateKey]
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
      accounts: [privateKey]
    },
  },
  solidity: "0.8.4",
};
