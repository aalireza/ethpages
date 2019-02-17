module.exports = {
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    ganache_cli: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    rinkeby: {
      network_id: 4,
      host: '127.0.0.1',
      port: 8545
    }
  },

  compilers: {
    solc: {
      version: "0.5.4"
    }
  }
};
