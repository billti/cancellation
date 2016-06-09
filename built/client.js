"use strict";
var net = require('net');
var child_proc = require('child_process');
function logMsg(msg) {
    var currMs = ("000000" + Date.now()).substr(-6, 6);
    console.log(currMs + ": " + msg);
}
logMsg("client process is running with pid " + process.pid);
var pipeName = "\\\\?\\pipe\\TS" + process.pid;
var serverPipe = undefined;
var server_proc = child_proc.fork("./server", [pipeName]);
server_proc.on("close", function (exitCode) {
    logMsg("Server process closed with " + exitCode);
    process.exit(0);
});
// Should get one response when the server is ready
server_proc.once("message", function (data) {
    logMsg("client received msg from server: \"" + data + "\".");
    // Start sending work requests every 3 seconds
    setInterval(sendWork, 3000);
});
function sendWork() {
    var timeout = undefined;
    // Should get one response for each and every request sent
    server_proc.once('message', function (data) {
        if (timeout)
            clearTimeout(timeout);
        deleteCancelPipe();
        logMsg("client receivied result from server: " + data);
    });
    logMsg("client sending work request");
    server_proc.send("work");
    // Set a cancellation for a random time within the 1.5 second
    timeout = setTimeout(function () {
        logMsg("client sending a cancellation");
        createCancelPipe();
    }, Math.random() * 1500);
}
function createCancelPipe() {
    serverPipe = net.createServer().listen(pipeName);
}
function deleteCancelPipe() {
    if (serverPipe) {
        serverPipe.close();
        serverPipe = undefined;
    }
}
