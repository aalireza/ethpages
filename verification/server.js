const Web3 = require("web3");
const web3 = new Web3(
    new Web3.providers.WebsocketProvider("ws:localhost:8546", {
    headers: {
        Origin: "http://localhost"
    }
}));
const fs = require("fs");
var config = JSON.parse(fs.readFileSync('../frontend/dist/config.json'));
const contractAddress =  config.contractAddress;
const verifierAddress = config.verifierAddress;
const email = require("./helpers/email");
const telegram_bot = require("./helpers/telegram");

const guestbookInfo = JSON.parse(fs.readFileSync('../contracts/Keybook.json'));
const contractInfo = guestbookInfo.contracts['Keybook.sol:Keybook'];
const abi = JSON.parse(contractInfo.abi);
const Keybook = new web3.eth.Contract(abi, contractAddress);

Keybook.events.NewEmailVerificationRequest().on("data", async event => {
  let userAdd = event.returnValues.userAddress;
  let userEmail = event.returnValues.email;
  console.log('email', userAdd, userEmail);
  let message = web3.utils.soliditySha3(
    userAdd,
    web3.utils.toHex("email: "),
    web3.utils.toHex(userEmail)
  );
  if (email.validate_email(userEmail)) {
    email.send_mail(
      userEmail,
      'Verify your email at https://ethpages.com/#!/verify-email/' + encodeURIComponent(userAdd)
    );
  }
});

Keybook.events.NewTelegramVerificationRequest().on("data", async event => {
  let userAdd = event.returnValues.userAddress;
  let userEmail = event.returnValues.email;
  telegram_bot.once("message", async msg => {
    if (msg.text.toString().toLowerCase() == "verify") {
      let message = web3.utils.soliditySha3(
        userAdd,
        web3.utils.toHex("telegram: "),
        web3.utils.toHex(msg.chat.username.toString())
      );
      telegram_bot.sendMessage(msg.chat.id, 'Verify your email at https://ethpages.com/#!/verify-telegram/' + encodeURIComponent(userAdd));
    }
  });
});


