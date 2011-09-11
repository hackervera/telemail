var telemail = require('./telemail');

telemail.privkey("mailpriv.pem");
telemail.listen("tyler");
telemail.on("message", function(message){
    console.log(message);
});