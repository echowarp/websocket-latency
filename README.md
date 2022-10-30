# websocket-latency

Benchmarks to compare websocket response time for different frameworks

## Results - Sequential Requests

|Server    |Requests|Max Response Time (ms)|Mean Response Time (ms)|
|----------|--------|----------------------|-----------------------|
|node-ws   |400000|24.5|0.1280455|
|Rust Actix|400000|16.4|0.1310193|

## Flood Of Requests (Browser Client Limited)

This version fo the test does not wait for a response before sending a new latency test.

|Server    |Requests|Max Response Time (ms)|Mean Response Time (ms)|
|----------|--------|----------------------|-----------------------|
|node-ws   |400000|9843.3|5992.1|
|Rust Actix|400000|9907.1|6023.4|
