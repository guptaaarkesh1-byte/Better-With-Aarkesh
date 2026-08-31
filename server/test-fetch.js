const fetch = require('node-fetch'); // wait, node 18 has fetch natively, let's use global fetch

async function run() {
  console.log("Fetching local server...");
  try {
    const res = await fetch("http://localhost:5000/api/cal/slots?date=2026-09-17");
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Data:", data);
  } catch(e) {
    console.error("Error:", e);
  }
}
run();
