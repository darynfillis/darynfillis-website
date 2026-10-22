const crypto = require("node:crypto");
const { connectLambda, getStore } = require("@netlify/blobs");

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function value(value, maxLength = 100) {
  return String(value || "").trim().slice(0, maxLength);
}

function webhookSecret(headers) {
  const matched = Object.entries(headers || {}).find(([name]) => name.toLowerCase() === "x-booking-webhook-secret");
  return value(matched && matched[1], 256);
}

function securelyMatches(actual, expected) {
  const supplied = Buffer.from(actual || "");
  const known = Buffer.from(expected || "");
  return supplied.length === known.length && crypto.timingSafeEqual(supplied, known);
}

function clientIdFromBooking(reference) {
  const digest = crypto.createHash("sha256").update(reference).digest();
  return `${digest.readUInt32BE(0)}.${digest.readUInt32BE(4)}`;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
  }

  if ((event.body || "").length > 20000) {
    return { statusCode: 413, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
  }

  const expectedSecret = process.env.BOOKING_WEBHOOK_SECRET;
  if (!expectedSecret || !securelyMatches(webhookSecret(event.headers), expectedSecret)) {
    return { statusCode: 401, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
  }

  const bookingReference = value(payload.booking_reference, 128);
  if (!/^[a-zA-Z0-9_-]+$/.test(bookingReference)) {
    return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
  }

  const measurementId = value(process.env.GA4_MEASUREMENT_ID, 32);
  const apiSecret = value(process.env.GA4_MEASUREMENT_PROTOCOL_SECRET, 256);
  if (!measurementId || !apiSecret) {
    return { statusCode: 503, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
  }

  connectLambda(event);
  const store = getStore("booking-completion-dedupe");
  const dedupeKey = `bookings/${crypto.createHash("sha256").update(bookingReference).digest("hex")}`;
  const alreadyRecorded = await store.get(dedupeKey, { type: "json" });
  if (alreadyRecorded) {
    return { statusCode: 204, headers: jsonHeaders, body: "" };
  }

  const response = await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientIdFromBooking(bookingReference),
        events: [{
          name: "consultation_booked",
          params: {
            booking_channel: "youcanbookme",
            engagement_time_msec: 1
          }
        }]
      })
    }
  );

  if (!response.ok) {
    return { statusCode: 502, headers: jsonHeaders, body: JSON.stringify({ ok: false }) };
  }

  await store.setJSON(dedupeKey, { recordedAt: new Date().toISOString() });
  return { statusCode: 204, headers: jsonHeaders, body: "" };
};
