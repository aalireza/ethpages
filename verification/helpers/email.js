const Mailgun = require("mailgun-js");
const domain = "mg.ethpages.com";
const api_key = "6c99c4cb1d6ca9051e599f918ec22631-1b65790d-fcb39b8d";
const mailgun = new Mailgun({ apiKey: api_key, domain: domain });
const from = "no-reply@ethpages.com";

function send_mail(to, body) {
  mailgun.messages().send({
    from,
    to,
    subject: "Keybook Email Verification",
    html: body,
  }, (err, body) => console.log(err));
}

function validate_email(email) {
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegexp.test(email);
}

module.exports = [send_mail, validate_email];
