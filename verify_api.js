const { spawn } = require('child_process');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

console.log("========================================");
console.log("   AUTOMATED API VERIFICATION SUITE     ");
console.log("========================================\n");

// 1. Start the Express API server as a child process
console.log("[1/3] Booting up the Anakin API server on port 3000...");
const serverProcess = spawn('node', ['index.js'], { stdio: 'pipe' });

let serverReady = false;

serverProcess.stdout.on('data', (data) => {
    if (data.toString().includes('running at http://localhost:3000')) {
        serverReady = true;
    }
});

serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
});

// 2. Wait for server to boot, then run tests
setTimeout(async () => {
    if (!serverReady) {
        console.log("❌ Server failed to start in time. Aborting tests.");
        serverProcess.kill();
        process.exit(1);
    }
    console.log("✅ Server is live! Running Endpoint Tests...\n");

    const tests = [
        { name: "Luma GET", url: "http://localhost:3000/api/scrape/luma", method: "GET" },
        { name: "Luma POST (Unified Query)", url: "http://localhost:3000/api/scrape/luma", method: "POST", body: { city: "mumbai" } },
        { name: "Meetup GET", url: "http://localhost:3000/api/scrape/meetup", method: "GET" },
        { name: "Meetup POST (Unified Query)", url: "http://localhost:3000/api/scrape/meetup", method: "POST", body: { city: "mumbai", dateRange: "this-week" } },
        { name: "Eventbrite GET", url: "http://localhost:3000/api/scrape/eventbrite", method: "GET" },
        { name: "Eventbrite POST (Unified Query)", url: "http://localhost:3000/api/scrape/eventbrite", method: "POST", body: { city: "mumbai", category: "science-and-tech--events" } },
        { name: "Scrape All POST (Unified Query)", url: "http://localhost:3000/api/scrape/all", method: "POST", body: { city: "hyderabad" } }
    ];

    let passed = 0;

    for (const test of tests) {
        console.log(`-> Testing [${test.method}] ${test.name}...`);
        try {
            const reqInit = {
                method: test.method,
                headers: { "Content-Type": "application/json" }
            };
            if (test.body) reqInit.body = JSON.stringify(test.body);

            const response = await fetch(test.url, reqInit);
            const data = await response.json();

            if (response.ok && data.status === "success") {
                console.log(`   ✅ PASS: Received ${data.total} events from ${data.source}.`);
                passed++;
            } else {
                console.log(`   ❌ FAIL: Server responded with status ${response.status} or error.`);
                console.log(`   Response: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            console.log(`   ❌ FAIL: Network or execution error - ${error.message}`);
        }
    }

    console.log("\n========================================");
    console.log(`   TEST RESULTS: ${passed}/${tests.length} PASSED`);
    console.log("========================================");

    // 3. Cleanup
    console.log("\n[3/3] Shutting down test server...");
    serverProcess.kill();
    process.exit(0);

}, 4000); // Wait 4 seconds for server boot
