
var { web3, Web3 } = require('./local_geth_connect');
var eth = web3.eth;



(async function(){
    try{
        console.log('getting accounts..');
        var accounts = await eth.getAccounts();
        var signer = accounts[0];

        console.log('signing with addr: '+signer);


        var userAddress = '0xca35b7d915458ef540ade6068dfe2f44e8fa733c';
        var email = 'kmbaragona@gmail.com';


        var dataToSign =  web3.utils.soliditySha3(userAddress, web3.utils.toHex("email: "), web3.utils.toHex(email));
        console.log('datatosign: '+dataToSign);

        var h = dataToSign;
        var sig = (await web3.eth.sign(h, signer));
        console.log('got signature:', sig);

        process.exit();

    }catch(e){
        console.log('caught error', e);
        process.exit();
    }

})();