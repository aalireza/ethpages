var Mailgun = require('mailgun-js');
//Your api key, from Mailgun’s Control Panel
var api_key = '6c99c4cb1d6ca9051e599f918ec22631-1b65790d-fcb39b8d';
//Your domain, from the Mailgun Control Panel
var domain = 'mg.ethpages.com';
//Your sending email address
var from_who = 'team@ethpages.com';


var email_to = "kmbaragona@gmail.com";

var mailgun = new Mailgun({apiKey: api_key, domain: domain});
var data = {
//Specify email data
  from: from_who,
//The email to contact
  to: email_to,
//Subject and text data
  subject: 'Test',
  html: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! '
}
//Invokes the method to send emails given the above data with the helper library
mailgun.messages().send(data, function (err, body) {
    //If there is an error, render the error page
    if (err) {
        console.log("got an error: ", err);
        return;
    }
    //Else we can greet    and leave
    else {
        //Here "submitted.jade" is the view file for this landing page
        //We pass the variable "email" from the url parameter in an object rendered by Jade
        return;
    }
});

