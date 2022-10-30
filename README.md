# websocket-latency

Benchmarks to compare websocket response time for different frameworks

## Results

Rust responds more consistently, but slightly slower.

### Sequential Requests

A single client connects and sends timestamped requests one at a time to the server.

|Server    |Requests|Max Response Time (ms)|Mean Response Time (ms)|
|----------|--------|----------------------|-----------------------|
|node-ws   |400000|24.5|0.1280455|
|Rust Actix|400000|16.4|0.1310193|

### Flood Of Requests (Browser Client Limited)

This version of the test does not wait for a response and instead sends the full batch of latency tests before handling any responses. As a result, this mostly tests the browser's ability to send websocket requests, not the round trip time in the server.

|Server    |Requests|Max Response Time (ms)|Mean Response Time (ms)|
|----------|--------|----------------------|-----------------------|
|node-ws   |400000|9843.3|5992.1|
|Rust Actix|400000|9907.1|6023.4|
