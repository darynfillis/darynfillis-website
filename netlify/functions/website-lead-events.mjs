import formSubmissionRouter from "./form-submitted.js";

// Use Netlify's current platform-event API so verified Forms submissions
// invoke the router in production. The CommonJS handler remains available for
// backwards-compatible direct invocation, while this event handler is the
// authoritative subscription for new submissions.
export default {
  formSubmitted(event) {
    // Platform events expose verified fields directly on event.data. Normalize
    // that shape for the existing router instead of relying on the older
    // webhook-style payload wrapper.
    const data = event?.data && typeof event.data === "object" ? event.data : {};
    return formSubmissionRouter.handler({
      data,
      form_name: data.mms_form || data["form-name"] || data.form_name || event?.formName || event?.form?.name || "website-form",
      id: event?.id || data.submission_id,
      created_at: event?.createdAt || event?.created_at
    });
  }
};
