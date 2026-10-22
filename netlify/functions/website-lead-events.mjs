import formSubmissionRouter from "./form-submitted.js";

// Use Netlify's current platform-event API so verified Forms submissions
// invoke the router in production. The CommonJS handler remains available for
// backwards-compatible direct invocation, while this event handler is the
// authoritative subscription for new submissions.
export default {
  formSubmitted(event) {
    return formSubmissionRouter.handler(event);
  }
};
