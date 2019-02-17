var Web3 = require('web3');
var process = require('process');
var fs = require('fs');

function usage() {
    console.error('Usage: deploy FROM_ADDRESS [GETH_URL]');
    process.exit(1);
}

var from = process.argv[2];
if(from === undefined) {
    usage();
}

var url = process.argv[3] || 'http://localhost:8545';
var web3 = new Web3(url);

var guestbookInfo = JSON.parse(fs.readFileSync('Keybook.json'));
var contractInfo = guestbookInfo.contracts['Keybook.sol:Keybook'];

var abi = JSON.parse(contractInfo.abi);
var contract = new web3.eth.Contract(abi);

contract.deploy({
    data: '0x' + contractInfo['bin']
}).send({
    from: from,
    gas: 5e6,
    gasPrice: 1e9
}).on('transactionHash', function(transactionHash) {
    console.error('transactionHash:', transactionHash);
}).on('receipt', function(receipt) {
    console.error('receipt:', receipt);
}).on('confirmation', function(confirmationNumber, receipt) {
    console.error('confirmation:', confirmationNumber, receipt);
}).then(function() {
    console.log('done!');
}).catch(function(err) {
    console.error(err);
});
