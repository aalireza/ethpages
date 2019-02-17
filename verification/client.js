const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws:127.0.0.1:8545")
);
const fs = require("fs");
const abi = JSON.parse(JSON.parse(fs.readFileSync('../contracts/Keybook.json'))['Keybook.sol:Keybook'].abi);
const userAddress = "0xd9f25ecb1220e24b3a4f444d9d6f87820850c071";

const Keybook = new web3.eth.Contract(abi, userAddress);

function makeUser(email, name, telegram, instance=Keybook, gas=6721975) {
  instance.methods
    .makeUser(email, name, telegram)
    .send({ from: userAddress, gas }, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
  });
}

function abstractVerifier(_Type, _sig, instance=Keybook, gas=6721975) {
  instance
    .methods[`verify${_Type}`](
      userAddress, _sig
    )
    .send({ from: userAddress, gas }, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
  });
}

const verifyTelegram = (_sig, instance=Keybook, gas=6721975) => abstractVerifier(
  "Telegram", _sig, instance, gas
);


const verifyEmail = (_sig, instance=Keybook, gas=6721975) => abstractVerifier(
  "Email", _sig, instance, gas
);
