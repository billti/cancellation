# Synchronous cancellation in Node

This simple demo shows how to check for a notification without returning to the event loop.

The code uses named pipes on Windows as written, so would need changes to support other platforms.
(See https://nodejs.org/api/net.html#net_server_listen_path_backlog_callback for platform details).

## How it works

 - The client spawns the server, passing the name of a named pipe to check for as a cancellation signal.
 - The client sends "work" requests, and waits for "done" or "cancelled" responses.
 - If the client wants to cancel work, it creates a named pipe of the provided name.
 - While the server is doing work, it regularly checks for existance of the above pipe. 
 - It is sees it, it aborts the current request.

## Overhead
The overhead of each check is minimal. For example, in the code given, if the cancellation check is
just hardcoded to return false (i.e. doesn't actually check for the pipe), the iterations finish in around
490ms on my test machine. Actually checking for the pipe repeatedly during a unit or work (2000 times in 
this example), adds only a few milliseconds total on average (i.e. around 1% overhead).

This example checks for the pipe overly aggressively, which generally results in the creation and detection of the
pipe across processes occurring within the same millisecond. For example, a run on my machine produced the below for
some iterations (the column on the left being the current millisecond):

```
818648: server received msg: work
819152: server checks for cancellations ths workload: 2000
819152: client receivied result from server: done in 499ms
821647: client sending work request
821647: server received msg: work
821896: client sending a cancellation
821896: server detected cancellation pipe
821898: client receivied result from server: cancelled
```

## To run the demo
Build the project using the TypeScript compiler in the root (e.g. run "tsc").
With the ./built directory as the current directory, run the `client` module (e.g. "node editor.js")
