const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.WebsocketProvider("ws:127.0.0.1:7545"));
// const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
const mail_sender = require("sendmail")();
// Must do `truffle compile` to generate updated ABI
const schema = require("../build/contracts/Keybook.json");
const address = "0x211f0eA6F65cE83c0a853E3C9E0ac9a69353ada7";
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


Keybook.events.NewEmailVerificationRequest({}, (err, evt) => {
  console.log("within evt req");
  console.log(err);
})
  .on('data', (event) => {
    console.log(event);
  });

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

wait(1000);


Keybook.methods.requestEmailVerification.call({
    email: "a",
    name: "a",
    phoneNumber: "a",
    pgpKey: "a",
    twitter: "a",
    website: "a"
}, (err, res) => {
  console.log("here");
  if (err) {
    console.log("ann error");
    console.log(err);
  } else {
    console.log(res);
    console.log("should emit");
  }
});


// Keybook.methods.requestEmailVerification.call((err, res) => {
//   console.log("here");
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(res);
//     console.log("should emit");
//   }
// });
// (async () => {
//   let a = await Keybook.methods.makeUser({
//     email: "a",
//     name: "a",
//     phoneNumber: "a",
//     pgpKey: "a",
//     twitter: "a",
//     website: "a"
//   });
//   console.log("should emit");
// })();
// const emailVerificationRequest = Keybook.events.NewEmailVerificationRequst();

// emailVerificationRequest.watch((err, res) => {
//   if (!err) {
//     console.log("Here YO");
//     let address = res["returnValues"]["userAddress"];
//     let to = res["returnValues"]["email"];
//     send_mail(to, "test");
//   }
// });

