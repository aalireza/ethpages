const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
const mail_sender = require("sendmail")();
// Must do `truffle compile` to generate updated ABI
const schema = require("../build/contracts/Keybook.json");
const address = "0x4968Cd0c9D5E9832272363A28c74Dc8E328Aac23";

const send_mail = (to, body) => {
  mail_sender(
    {
      from: "no-reply@keybook-verification-node",
      subject: "Keybook Email Verification",
      html: body,
      to
    },
    function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
    }
  );
};

const Keybook = new web3.eth.Contract(schema.abi, address);
console.log(Keybook.requestEmailVerification);

// const emailVerificationRequest = Keybook.NewEmailVerificationRequst();

// emailVerificationRequest.watch((err, res) => {
//   if (!err) {
//     let address = res["returnValues"]["userAddress"];
//     let to = res["returnValues"]["email"];
//     send_mail(to, "test");
//   }
// });

