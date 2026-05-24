const { connectLambda, getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  connectLambda(event);

  const password = process.env.SYG_PASSWORD;
  const supplied = event.headers["x-syg-password"] || event.headers["X-SYG-Password"];

  if (!password) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing SYG_PASSWORD environment variable." })
    };
  }

  if (supplied !== password) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unauthorized" })
    };
  }

  const store = getStore("syg-deals");

  if (event.httpMethod === "GET") {
    const existing = await store.get("deals.json", { type: "json" });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid JSON." })
      };
    }

    await store.setJSON("deals.json", parsed);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  }

  return {
    statusCode: 405,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Method not allowed." })
  };
};
