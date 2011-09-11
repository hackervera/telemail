var dcrypt = require("dcrypt");
var fs = require("fs");

var rsa = new dcrypt.keypair.newRSA();

fs.writeFileSync("mailpub.pem",rsa.pem_pub);
fs.writeFileSync("mailpriv.pem",rsa.pem_priv);
