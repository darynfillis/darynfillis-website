const crypto = require("node:crypto");
const { connectLambda, getStore } = require("@netlify/blobs");

const INTERNAL_FIELDS = new Set([
  "bot-field",
  "form-name",
  "ip",
  "user_agent",
  "user-agent",
  "submission_id"
]);

const FORM_PLANS = {
  "cal-condo-buyer": { intent: "condo-buyer-guide", response: "guide-delivery-and-consultation" },
  "cal-condo-seller": { intent: "condo-seller-guide", response: "guide-delivery-and-consultation" },
  "condo-check": { intent: "condo-project-check", response: "project-review" },
  "condo-project-check-buyer": { intent: "condo-project-check-buyer", response: "project-review" },
  "condo-project-check-seller": { intent: "condo-project-check-seller", response: "project-review" },
  "decode-2026": { intent: "market-guide", response: "guide-delivery" },
  "mortgage-strategy-digest": { intent: "mortgage-strategy-digest", response: "digest-enrollment" },
  "wealth-digest": { intent: "wealth-digest", response: "digest-enrollment" },
  "partnership-plus-download": { intent: "agent-partnership", response: "partner-resource-delivery" },
  "refi-rate-watch": { intent: "refinance-rate-watch", response: "rate-watch-follow-up" },
  "self-employed-playbook": { intent: "self-employed-playbook", response: "guide-delivery-and-consultation" }
};

function text(value, maxLength = 1000) {
  return String(value || "").trim().slice(0, maxLength);
}

function parseEvent(event) {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    return body && (body.payload || body);
  } catch {
    return null;
  }
}

function formName(payload, data) {
  return text(payload?.form_name || payload?.formName || payload?.form?.name || data["form-name"], 100);
}

function safeAnswers(data) {
  return Object.fromEntries(
    Object.entries(data || {})
      .filter(([name]) => /^[a-zA-Z0-9_-]{1,80}$/.test(name) && !INTERNAL_FIELDS.has(name.toLowerCase()))
      .map(([name, value]) => [name, text(value)])
      .filter(([, value]) => value)
  );
}

function normalizeLead(answers) {
  return {
    first_name: text(answers.firstname || answers.first_name, 100),
    last_name: text(answers.lastname || answers.last_name, 100),
    email: text(answers.email, 254).toLowerCase(),
    phone: text(answers.phone, 40)
  };
}

function marketingConsent(answers) {
  return ["yes", "true", "1", "on", "checked"].includes(text(answers.marketing_consent || answers.newsletter_consent, 10).toLowerCase());
}

function mmsUrl() {
  try {
    const url = new URL(text(process.env.MMS_LEAD_INTAKE_URL, 500));
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:" && (hostname === "mymortgagestudio.com" || hostname.endsWith(".mymortgagestudio.com")) ? url : null;
  } catch {
    return null;
  }
}

function authHeaderName() {
  const name = text(process.env.MMS_LEAD_INTAKE_AUTH_HEADER || "Authorization", 100);
  return /^[A-Za-z0-9-]+$/.test(name) ? name : "Authorization";
}

function authPrefix() {
  if (process.env.MMS_LEAD_INTAKE_AUTH_PREFIX !== undefined) {
    return text(process.env.MMS_LEAD_INTAKE_AUTH_PREFIX, 40);
  }

  return authHeaderName().toLowerCase() === "authorization" ? "Bearer" : "";
}

function deliveryKey(payload, form) {
  const identifier = text(payload?.id || payload?.submission_id || payload?.created_at || payload?.createdAt, 160);
  return crypto.createHash("sha256").update(`${form}:${identifier}`).digest("hex");
}

exports.handler = async (event) => {
  const payload = parseEvent(event);
  const data = payload?.data;
  if (!payload || !data || typeof data !== "object") return;

  const form = formName(payload, data);
  const answers = safeAnswers(data);
  const plan = FORM_PLANS[form] || { intent: "website-inquiry", response: "personal-review" };
  const endpoint = mmsUrl();
  const token = text(process.env.MMS_LEAD_INTAKE_TOKEN, 500);

  // An unconfigured destination is deliberately a no-op: forms continue to be
  // captured by Netlify, but no borrower data is sent anywhere else.
  if (!endpoint || !token || !form) return;

  connectLambda(event);
  const store = getStore("mms-lead-delivery-dedupe");
  const key = `submissions/${deliveryKey(payload, form)}`;
  if (await store.get(key, { type: "json" })) return;

  const submittedAt = text(payload.created_at || payload.createdAt, 50) || new Date().toISOString();
  const idempotencyKey = deliveryKey(payload, form);
  const authorizationPrefix = authPrefix();
  const headers = { "Content-Type": "application/json", "User-Agent": "darynfillis-website-lead-router/1.0" };
  headers[authHeaderName()] = authorizationPrefix ? `${authorizationPrefix} ${token}` : token;
  headers["x-idempotency-key"] = idempotencyKey;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      event: "website_lead_submitted",
      source: "darynfillis.com",
      workspace: text(process.env.MMS_LEAD_WORKSPACE || "darynfillis", 80),
      submitted_at: submittedAt,
      submission: { form, intent: plan.intent, response_plan: plan.response },
      lead: normalizeLead(answers),
      answers,
      consent: { marketing: marketingConsent(answers) }
    })
  });

  if (!response.ok) {
    // Never log borrower details. The form and HTTP status are enough to diagnose routing.
    console.error(`MMS lead delivery failed for ${form}: ${response.status}`);
    throw new Error("MMS lead delivery failed");
  }

  await store.setJSON(key, { deliveredAt: new Date().toISOString(), form });
};
