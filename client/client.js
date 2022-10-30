let test_type = "async"; // sequential || async
let test_duration = 100000;


tests = [{
    duration: 10,
    type: "async"
}]
function generate_tests() {
    let test_durations = [
        10,15,20,40,80,100,150,200,400,800,1000,1500,2000,4000,8000,
        10000,15000,20000,40000,80000,100000,200000,400000
    ]

    tests = [];
    for (let i in test_durations) {
        tests.push({
            duration: test_durations[i],
            type: "async",
        })
    }
}
generate_tests();



let socket = new WebSocket("ws://localhost:8081/ws");
socket.onopen = function(e) {
  console.log("[open] Connection established");

  run_test();
};

socket.onmessage = function(event) {
  let response_millis = performance.now()
  let data = JSON.parse(event.data);

  let query_millis = parseFloat(data.millis)

  results[ data.id ] = response_millis - query_millis;

  if (test_type === "sequential") {
    if (test_count < test_duration) {
        send_test();
    }
  }

  // sumarize once all tests have been received
  if (data.id >= test_duration - 1) {
    summarize();
  }
};

socket.onclose = function(event) {
  if (event.wasClean) {
    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    console.error('[close] Connection died');
  }
};

socket.onerror = function(error) {
  console.error(`[error]`, error);
};


results = {};
test_count = 0;
start_at = 0;
function run_test() {
    let t = tests.pop();
    if (t) {
        test_duration = t.duration;
        test_type = t.type;

        results = {};
        test_count = 0;
        start_at = performance.now();

        if (test_type === "sequential") {
            send_test();
        }
        else if (test_type === "async") {
            while (test_count < test_duration) {
                send_test();
            }
        }
    }
    else {
        finalize();
    }
}


end_at = 0;
function summarize() {
    end_at = performance.now();
    setTimeout(summarize_delayed, 200);
}

summaries = [];
function summarize_delayed() {
    summary = {
        test_type: test_type,
        mean: 0.0,
        min: Infinity,
        max: 0.0,
        sum: 0.0,
        count: Object.keys(results).length,
        stddev: 0.0,
        duration: end_at - start_at,
    }

    if (summary.count !== test_duration) {
        console.error("Test failed to relay all packets", summary.count, test_duration)
    }

    for (let r in results) {
        if (results[r] < 0) {results[r] = 0;} // round off floating point rounding errors
        let result = results[r];
        summary.sum += result;
        if (result < summary.min) {
            summary.min = result;
        }
        if (result > summary.max) {
            summary.max = result;
        }
    }

    summary.mean = summary.sum / summary.count;

    for (let r in results) {
        let result = results[r];
        summary.stddev += Math.pow(result - summary.mean, 2)
    }
    summary.stddev = Math.sqrt(summary.stddev / summary.count)

    console.log(summary);
    summaries.push(summary);

    run_test();
}


function send_test() {
    message = {
        id: test_count,
        millis: performance.now().toFixed(11),
    };
    socket.send(JSON.stringify(message));
    test_count += 1;
}

function finalize() {
    str = "type,count,min,max,mean,sum,stddev,duration\n"
    for (let s in summaries) {
        let summary = summaries[s];

        str += summary.test_type + ",";
        str += summary.count + ",";
        str += summary.min + ",";
        str += summary.max + ",";
        str += summary.mean + ",";
        str += summary.sum + ",";
        str += summary.stddev + ",";
        str += summary.duration + "\n";
    }

    console.log(str);
}