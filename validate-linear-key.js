/**
 * Script to validate Linear API key
 * Usage: node validate-linear-key.js <YOUR_LINEAR_API_KEY>
 */

const https = require("https");

// Get API key from command line argument
const apiKey = process.argv[2];

if (!apiKey) {
  console.error("❌ Error: Please provide a Linear API key");
  console.log("Usage: node validate-linear-key.js <YOUR_LINEAR_API_KEY>");
  process.exit(1);
}

console.log("🔍 Validating Linear API key...\n");

// Make a simple request to Linear API to validate the key
const options = {
  hostname: "api.linear.app",
  path: "/graphql",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: apiKey,
  },
};

const query = JSON.stringify({
  query: `
    query {
      viewer {
        id
        name
        email
      }
      organization {
        id
        name
      }
    }
  `,
});

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const response = JSON.parse(data);

      if (response.errors) {
        console.error("❌ Invalid API Key");
        console.error("Error:", response.errors[0].message);
        process.exit(1);
      }

      if (response.data && response.data.viewer) {
        console.log("✅ API Key is VALID!\n");
        console.log("📋 Details:");
        console.log("───────────────────────────────────────");
        console.log(`User Name:     ${response.data.viewer.name}`);
        console.log(`User Email:    ${response.data.viewer.email}`);
        console.log(`User ID:       ${response.data.viewer.id}`);
        if (response.data.organization) {
          console.log(`Organization:  ${response.data.organization.name}`);
          console.log(`Org ID:        ${response.data.organization.id}`);
        }
        console.log("───────────────────────────────────────\n");
        console.log(
          "✅ You can use this API key in your Azure DevOps extension settings."
        );
        process.exit(0);
      } else {
        console.error("❌ Unexpected response from Linear API");
        console.error("Response:", data);
        process.exit(1);
      }
    } catch (error) {
      console.error("❌ Failed to parse response");
      console.error("Error:", error.message);
      console.error("Response:", data);
      process.exit(1);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Network error while connecting to Linear API");
  console.error("Error:", error.message);
  process.exit(1);
});

req.write(query);
req.end();
