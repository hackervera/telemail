var sys = require("sys");
var telehash = require("./telehash");

var _ = require("./underscore");



var s = new telehash.createSwitch(undefined, process.argv[2], process.argv[3]);

s.on("+response", function(remoteipp, telex, line) {
    console.log("TELEX: "+JSON.stringify(telex));
    
    try {
    var keys = Object.keys(telex["body"]);
    keys.forEach(function(key){
        console.log(key+":"+telex["body"][key]);
    });
    }
    catch(e){
        console.log("FAIL: "+e);
    }
      //console.log("My name is "+telex.name+" and i am "+telex.age);  
        //console.log(new Date() + " <" + remoteipp + "> " + telex["+id"]);
});

var facebookId = "facebook";

var endHash = new telehash.Hash(facebookId);
var tap = {};
tap.is = {};
tap.is["+end"] = endHash.toString();
tap.has = ["+response"];

s.addTap(tap);

var stdin = process.openStdin();
stdin.setEncoding("UTF-8");

stdin.on('data', function(chunk){    
    var ckeys = telehash.keys(s.master)
    .filter(function(x) { return s.master[x].ipp != s.selfipp; })
    .sort(function(a,b) { return endHash.distanceTo(a) - endHash.distanceTo(b) })
    .forEach(function(ckey){
        
        var target = s.master[ckey].ipp;
        if (!target) {
            return;
        }
        //console.log("CKEY: "+ckey);
        console.log("attached to " + target + " at distance " + endHash.distanceTo(target));
        var telexOut = new telehash.Telex(target);
        telexOut["+lookup"] = chunk;
        var telexOut = _.extend(telexOut,{
        "+guid" : new Date().getTime(),
        "_hop" : 1,
        "+end" : endHash.toString()
    });
        s.send(telexOut);

    });
});



process.on('SIGINT', function() {
    console.log("Use Control-D to exit.");
});

stdin.on('end', function () {
    s.stop();
    process.exit(0);
});



s.start()

