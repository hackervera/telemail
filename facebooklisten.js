var sys = require("sys");
var telehash = require("./telehash");
var _ = require("./underscore");
var request = require("request");

var endHash = new telehash.Hash("facebook");

var s = new telehash.createSwitch(undefined, process.argv[2], process.argv[3]);

s.on("+lookup", function(remoteipp, telex, line) {
    console.log("TELEX: "+JSON.stringify(telex));
        
            var ckeys = telehash.keys(s.master)
    .filter(function(x) { return s.master[x].ipp != s.selfipp; })
    .sort(function(a,b) { return endHash.distanceTo(a) - endHash.distanceTo(b) })
        .forEach(function(ckey){
        
        var target = s.master[ckey].ipp;
        if (!target) {
            return;
        }
        console.log("CKEY: "+ckey);
        console.log("attached to " + target + " at distance " + endHash.distanceTo(target));
        var telexOut = new telehash.Telex(target);

   
        telexOut["+response"] = true;
        telexOut["+guid"] = new Date().getTime();
        telexOut["_hop"] = 1;
        telexOut["+end"] = endHash.toString();

        console.log(JSON.stringify(telexOut));
        
        
        request({uri:'https://graph.facebook.com/'+telex["+lookup"]}, function(err, res, body){
        console.log(err+" "+body);
         telexOut = _.extend(telexOut,{body: JSON.parse(body)});
         s.send(telexOut);
        });
    });
});



var tap = {};
tap.is = {};
tap.is["+end"] = endHash.toString();
tap.has = ["+lookup"];

s.addTap(tap);


var stdin = process.openStdin();
stdin.setEncoding("UTF-8");

process.on('SIGINT', function() {
    console.log("Use Control-D to exit.");
});

stdin.on('end', function () {
    s.stop();
    process.exit(0);
});


s.start()

