const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    goerli: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://goerli.infura.io/v3/a9d7617309ee4e9da3d42fbfad6eba52")
      },
      network_id: "5",
      networkCheckTimeout: 10000,
      timeoutBlocks: 200
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  compilers: {
    solc: {
      version: "^0.8.17"
    }
  }
};