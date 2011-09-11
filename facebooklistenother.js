var sys = require("sys");
var telehash = require("./telehash");

var s = new telehash.createSwitch(undefined, process.argv[2], process.argv[3]);

s.on("+facebook", function(remoteipp, telex, line) {
    if(/foobizle/.test(telex["+id"])){
        console.log(new Date() + " <" + remoteipp + "> " + telex["+id"]);
    }});

var endHash = new telehash.Hash("heathergillies@facebook.com");

var tap = {};
tap.is = {};
tap.is["+end"] = endHash.toString();
tap.has = ["+facebook"];

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

