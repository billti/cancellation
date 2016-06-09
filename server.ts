import net = require('net');
import fs = require('fs');

function logMsg(msg) {
    let currMs = ("00000000" + Date.now()).substr(-6, 6); 
    console.log(`${currMs}: ${msg}`);
}

logMsg(`server process is running with pid ${process.pid}`);

const cancellationPipe = process.argv[2];
logMsg(`server will check for cancellation pipe: ${cancellationPipe}`);

// Process requests received
process.on('message', (data) => {
    logMsg(`server received msg: ${data}`);

    let result = doWork();
    process.send(result);
});

function isCancelled() {
    //if (true) return false;
    try {
        fs.statSync(cancellationPipe);
    } catch (e) {
        // No pipe detected
        return false;
    }
    logMsg("server detected cancellation pipe");
    return true;
}

function doWork() {
    const startTime = Date.now();
    let sum = 0;
    let i = 1;
    let cancelChecks = 0;
    while (i++) {
        // Check if cancelled or finished every x iterations
        if (i % 100000 === 0) {
            cancelChecks++;
            if (isCancelled()) {
                return "cancelled";
            }
            // Just do as much work as we can in 500ms
            if (i === 200000000) {
                logMsg(`server checks for cancellations ths workload: ${cancelChecks}`);
                return `done in ${Date.now() - startTime}ms`;
            }
        }
        sum *= i;
    }
}

// Send an initial response once ready to start doing some work
process.send("ready");
