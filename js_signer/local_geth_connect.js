const homedir = require('os').homedir();

var Web3 = require('web3');
var web3;
if(process.env.CHAIN == 'main'){
    web3 = new Web3(homedir+'/Library/Ethereum/geth.ipc', require('net'));
    console.log('Connected to main net daemon');
}else if (process.env.CHAIN == 'rinkeby'){
    web3 = new Web3(homedir+'/Library/Ethereum/rinkeby/geth.ipc', require('net'));
    console.log('Connected to test net daemon');
}else{
    console.log('Set env var CHAIN to either "main" or "rinkeby"');
    process.exit(1);
}


module.exports = {
    Web3: Web3,
    web3: web3
};
