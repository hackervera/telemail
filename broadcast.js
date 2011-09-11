var sys = require("sys");
var dcrypt = require("dcrypt");
var telehash = require("./telehash");
var fs = require("fs");

var s = new telehash.createSwitch(undefined, undefined, undefined);
s.on("+key", function(remoteipp, telex, line) {
    var verifier = dcrypt.verify.createVerify('sha1').update(telex["+body"]).verify(telex["+key"], telex["+signature"], 'hex');
    console.log(telex["+body"]);
    //console.log(telex["+key"]);
    //console.log(telex["+signature"]);
    console.log(verifier);
    console.log("Remote ip: "+remoteipp+"; Self ip: "+s.selfipp);

    
    //console.log(new Date() + " <" + remoteipp + "> " + telex["+wall"]);
});

var endHash = new telehash.Hash("42");

var tap = {};
tap.is = {};
tap.is["+end"] = endHash.toString();
tap.has = ["+key"];

s.addTap(tap);

var stdin = process.openStdin();
stdin.setEncoding("UTF-8");



    
var sendInfo = function(message){    
    console.log(message);
    var ckeys = telehash.keys(s.master)
    .filter(function(x) { return s.master[x].ipp != s.selfipp; })
    .sort(function(a,b) { return endHash.distanceTo(a) - endHash.distanceTo(b) })
    .slice(0,3).forEach(function(ckey){
        var target = s.master[ckey].ipp;
        if (!target) {
            return;
        }
        
        console.log("attached to " + target + " at distance " + endHash.distanceTo(target));
    telexOut = new telehash.Telex(target);
    var signer = fs.readFileSync('./test1.pem','ascii')
    telexOut["+key"] = fs.readFileSync('./pub.pem','ascii')
    telexOut["+body"] = message;
    telexOut["+signature"] = dcrypt.sign.createSign('sha1').update(telexOut["+body"]).sign(signer, 'hex');
    telexOut["+guid"] = new Date().getTime();
    telexOut["_hop"] = 1;
    telexOut["+end"] = endHash.toString();
    s.send(telexOut);  
    });
};
    
setTimeout(function(){
   sendInfo(process.argv[2]); 
}, 5000);

process.on('SIGINT', function() {
    console.log("Use Control-D to exit.");
});

stdin.on('end', function () {
    s.stop();
    process.exit(0);
});

s.start()

