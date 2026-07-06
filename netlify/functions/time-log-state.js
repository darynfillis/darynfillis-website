const { connectLambda, getStore } = require("@netlify/blobs");

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function safeKey(value) {
  const raw = String(value || "default").trim();
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  return clean || "default";
}

exports.handler = async (event) => {
  try {
    connectLambda(event);
    const store = getStore("time-log-state");
    const stateKey = safeKey((event.queryStringParameters || {}).key);
    const blobKey = `states/${stateKey}.json`;

    if (event.httpMethod === "GET") {
      const existing = await store.get(blobKey, { type: "json" });
      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ ok: true, key: stateKey, state: existing || null })
      };
    }

    if (event.httpMethod === "POST") {
      if ((event.body || "").length > 1500000) {
        return {
          statusCode: 413,
          headers: jsonHeaders,
          body: JSON.stringify({ ok: false, error: "Saved worksheet is too large." })
        };
      }

      let parsed;
      try {
        parsed = JSON.parse(event.body || "{}");
      } catch (error) {
        return {
          statusCode: 400,
          headers: jsonHeaders,
          body: JSON.stringify({ ok: false, error: "Invalid JSON body." })
        };
      }

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {
          statusCode: 400,
          headers: jsonHeaders,
          body: JSON.stringify({ ok: false, error: "Expected a JSON object." })
        };
      }

      parsed.meta = parsed.meta && typeof parsed.meta === "object" ? parsed.meta : {};
      parsed.meta.savedAt = new Date().toISOString();
      parsed.meta.stateKey = stateKey;

      await store.setJSON(blobKey, parsed);
      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: JSON.stringify({ ok: true, key: stateKey, savedAt: parsed.meta.savedAt })
      };
    }

    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, error: "Method not allowed." })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: JSON.stringify({ ok: false, error: error.message || "Server error." })
    };
  }
};
