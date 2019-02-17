const mail_sender = require("sendmail")();

function send_mail(to, body) {
  mail_sender(
    {
      from: "no-reply@ethpages.com",
      subject: "Keybook Email Verification",
      html: body,
      to
    },
    function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
    }
  );
}

function validate_email(email) {
  const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegexp.test(email);
}

module.exports = {
    send_mail: send_mail,
    validate_email: validate_email
};
