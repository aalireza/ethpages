const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.WebsocketProvider("ws:127.0.0.1:8545")
);
const schema = require("../build/contracts/Keybook.json");
// const address = "0x211f0eA6F65cE83c0a853E3C9E0ac9a69353ada7";
const address = "0x69311c22d026b1E28C032224A006461D632473A3";
// const ownderAddress = "0x775dD00D3CDE2645A6Dc93F7177A1163B0bFd064";
const ownerAddress = "0xaC672e40477811300619B4367E0191bC181e178f";
const userAddress = "0xd9f25ecb1220e24b3a4f444d9d6f87820850c071";
const ukey =
  "0xee9c327e68cbac8f7b744b279e379f0280234d5b3fd09998cd2a75ad1a987f6a";
const email = require("./helpers/email");
const telegram_bot = require("./helpers/telegram");
// const userAddress = "0x31119260c0Bd3a8Ad822878B687efc3AFB60B603";

const Keybook = new web3.eth.Contract(schema.abi, address);

Keybook.events.NewEmailVerificationRequest().on("data", async event => {
  console.log("within email verification data");
  let userAdd = event.returnValues.userAddress;
  let userEmail = event.returnValues.email;
  let message = web3.utils.soliditySha3(
    userAddress,
    web3.utils.toHex("email: "),
    web3.utils.toHex(userEmail)
  );
  let signature = await web3.eth.sign(message, ownerAddress);
  if (email.validate_email(userEmail)) {
    email.send_mail(
      userEmail,
      `Below is the signature. Do what you must:\n${signature}`
    );
  }
});

Keybook.events.NewTelegramVerificationRequest().on("data", async event => {
  telegram_bot.once("message", async msg => {
    if (msg.text.toString().toLowerCase() == "verify") {
      let message = web3.utils.soliditySha3(
        userAddress,
        web3.utils.toHex("telegram: "),
        web3.utils.toHex(msg.chat.username.toString())
      );
      let signature = await web3.eth.sign(message, ownerAddress);
      telegram_bot.sendMessage(msg.chat.id, signature);
    }
  });
});


