const { connectLambda, getStore } = require("@netlify/blobs");

const jsonHeaders = { "Content-Type": "application/json" };
const productionDealsUrl = "https://darynfillis.com/.netlify/functions/deals";

function isNonProductionDeploy() {
  const context = process.env.CONTEXT || process.env.NETLIFY_CONTEXT || "";
  return context && context !== "production";
}

async function proxyToProduction(event) {
  const response = await fetch(productionDealsUrl, {
    method: event.httpMethod,
    headers: {
      "Content-Type": "application/json",
      "x-syg-password": event.headers["x-syg-password"] || event.headers["X-SYG-Password"] || ""
    },
    body: event.httpMethod === "POST" ? (event.body || "[]") : undefined
  });

  const text = await response.text();

  return {
    statusCode: response.status,
    headers: Object.assign({}, jsonHeaders, {
      "X-SYG-Data-Source": "production-proxy"
    }),
    body: text
  };
}

exports.handler = async (event) => {
  connectLambda(event);

  const password = process.env.SYG_PASSWORD;
  const supplied = event.headers["x-syg-password"] || event.headers["X-SYG-Password"];
  const nonProduction = isNonProductionDeploy();

  if (!password) {
    if (nonProduction) return proxyToProduction(event);
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Missing SYG_PASSWORD environment variable." })
    };
  }

  if (supplied !== password) {
    if (nonProduction) return proxyToProduction(event);
    return {
      statusCode: 401,
      headers: jsonHeaders,
      body: JSON.stringify({ error: "Unauthorized" })
    };
  }

  const store = getStore("syg-deals");

  if (event.httpMethod === "GET") {
    const existing = await store.get("deals.json", { type: "json" });

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify(existing || [])
    };
  }

  if (event.httpMethod === "POST") {
    let parsed;

    try {
      parsed = JSON.parse(event.body || "[]");
      if (!Array.isArray(parsed)) throw new Error("Expected an array.");
    } catch (e) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: JSON.stringify({ error: "Invalid JSON." })
      };
    }

    await store.setJSON("deals.json", parsed);

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: true })
    };
  }

  return {
    statusCode: 405,
    headers: jsonHeaders,
    body: JSON.stringify({ error: "Method not allowed." })
  };
};
