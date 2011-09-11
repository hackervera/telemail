var telemail = require('./telemail');

telemail.privkey("mailpriv.pem");

telemail.on("seeded", function(){
    telemail.sendMessage({
        publicKey: "mailpub.pem",
        to: "tyler",
        message: "sekret sauze"
    });
});