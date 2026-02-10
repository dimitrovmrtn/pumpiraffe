const http = require('http');

// Configuration matches script.js
const TOKEN_ADDRESS = "CPDqRnTEv9z3xSZhv6qfqAkzCcgJY1fyYoW6Yxckpump";
const PROXY_URL = `http://localhost:3000/mcap?token=${TOKEN_ADDRESS}&t=${Date.now()}`;

console.log(`Fetching from: ${PROXY_URL}`);

http.get(PROXY_URL, (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            console.log("--- Raw Response Body ---");
            console.log(data);
            console.log("-------------------------");

            const jsonData = JSON.parse(data);
            console.log("Parsed JSON Data Keys:", Object.keys(jsonData));

            const mcap = jsonData.usd_market_cap || jsonData.market_cap;
            console.log(`Extracted 'usd_market_cap': ${jsonData.usd_market_cap}`);
            console.log(`Extracted 'market_cap': ${jsonData.market_cap}`);
            console.log(`Final Calculated Mcap: ${mcap}`);

            if (!mcap) {
                console.error("❌ FAILURE: Market Cap is 0 or undefined.");
            } else {
                console.log("✅ SUCCESS: Market Cap found.");
            }

        } catch (e) {
            console.error("Error parsing JSON:", e.message);
        }
    });

}).on('error', (err) => {
    console.error("Error fetching from proxy:", err.message);
    console.log("Make sure 'node proxy.js' is running in another terminal!");
});
