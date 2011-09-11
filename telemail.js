var sys = require("sys");
var telehash = require("./telehash");
var request = require("request");
var EventEmitter = require( "events" ).EventEmitter;
var fs = require("fs");
var endHash = new telehash.Hash("telemail");
var s = new telehash.createSwitch(undefined, process.argv[2], process.argv[3]);

var dcrypt = require("dcrypt");


var each = function(options){
    var target = s.master[options.ckey].ipp;
    if (!target) {
        return;
    }
    //console.log("CKEY: "+ckey);
    console.log("attached to " + target + " at distance " + endHash.distanceTo(target));
    var telexOut = new telehash.Telex(target);
    telexOut["+to"] = options.to;
    //rsa = new dcrypt.keypair.newRSA(1024, 65537)
    //console.log(typeof(rsa.pem_pub));
    var message = dcrypt.rsa.encrypt(options.key,options.message,'RSA_PKCS1_PADDING', 'hex');
    console.log(message);
    telexOut["message"] = message;
    telexOut["+guid"] = new Date().getTime();
    telexOut["_hop"] = 1;
    telexOut["+end"] = endHash.toString();
    
    console.log(JSON.stringify(telexOut));


    s.send(telexOut);

}


var sendMessage = function(options){
    options.key = fs.readFileSync(options.publicKey, 'utf8');
    console.log(options.key);
    telehash.keys(s.master)
    .filter(function(x) { return s.master[x].ipp != s.selfipp; })
    .sort(function(a,b) { 
        return endHash.distanceTo(a) - endHash.distanceTo(b) 
    }).forEach(function(ckey){
        options.ckey = ckey;
        //console.log("CKEY: "+ckey);
        each(options);
    });
    
}


var telemail = new EventEmitter();
telemail.sendMessage = sendMessage;

var seeded = function(){
    console.log("seeded");
    setTimeout(function(){
        telemail.emit("seeded");
    },5000);
}

var listen = function(address){
    var self = this;
    //console.log(this.privkey);
    s.on("+to", function(remoteipp, telex, line) {
        if(telex["+to"] == address){
            var message = dcrypt.rsa.decrypt(self.privkey, telex["message"], 'RSA_PKCS1_PADDING', 'hex');
            telemail.emit("message", message);
        }
    });
}
telemail.listen = listen;
telemail.privkey = function(privkey){
    this.privkey = fs.readFileSync(privkey,'utf8');
}
module.exports = telemail


s.start(seeded);

process.on('SIGINT', function() {
     s.stop();
     console.log("shutting down");
    process.exit(0);
});


