"use strict";
var fs = require('fs');
function logMsg(msg) {
    var currMs = ("00000000" + Date.now()).substr(-6, 6);
    console.log(currMs + ": " + msg);
}
logMsg("server process is running with pid " + process.pid);
var cancellationPipe = process.argv[2];
logMsg("server will check for cancellation pipe: " + cancellationPipe);
// Process requests received
process.on('message', function (data) {
    logMsg("server received msg: " + data);
    var result = doWork();
    process.send(result);
});
function isCancelled() {
    //if (true) return false;
    try {
        fs.statSync(cancellationPipe);
    }
    catch (e) {
        // No pipe detected
        return false;
    }
    logMsg("server detected cancellation pipe");
    return true;
}
function doWork() {
    var startTime = Date.now();
    var sum = 0;
    var i = 1;
    var cancelChecks = 0;
    while (i++) {
        // Check if cancelled or finished every x iterations
        if (i % 100000 === 0) {
            cancelChecks++;
            if (isCancelled()) {
                return "cancelled";
            }
            // Just do as much work as we can in 500ms
            if (i === 200000000) {
                logMsg("server checks for cancellations ths workload: " + cancelChecks);
                return "done in " + (Date.now() - startTime) + "ms";
            }
        }
        sum *= i;
    }
}
// Send an initial response once ready to start doing some work
process.send("ready");
