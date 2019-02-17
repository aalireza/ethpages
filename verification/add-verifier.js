const Web3 = require("web3");
const web3 = new Web3('http://localhost:8545');
const fs = require("fs");
const config = JSON.parse(fs.readFileSync('../frontend/dist/config.json'));
const contractAddress = config.contractAddress; 
const ownerAddress = config.ownerAddress;
const process = require('process');

const guestbookInfo = JSON.parse(fs.readFileSync('../contracts/Keybook.json'));
const contractInfo = guestbookInfo.contracts['Keybook.sol:Keybook'];
const abi = JSON.parse(contractInfo.abi);
const Keybook = new web3.eth.Contract(abi, contractAddress);

(async function() {
    var verifierAddress = process.argv[2];
    if(verifierAddress === undefined) {
        console.error('Bad usage');
        return;
    }

    await Keybook.methods.addVerifier(verifierAddress).send({
        from: ownerAddress
    });
})().catch(console.error.bind(console));
