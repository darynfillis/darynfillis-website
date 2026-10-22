# Conversion analytics

The public site loads `site-analytics.js`, which sends consistent GA4 events without reading or transmitting form-field values.

## Funnel events

| Event | Meaning |
| --- | --- |
| `cta_clicked` | A primary site CTA was selected |
| `schedule_started` | A visitor selected a schedule or YouCanBookMe link |
| `schedule_viewed` | The scheduling page was viewed |
| `schedule_widget_loaded` | The YouCanBookMe embed loaded |
| `consultation_booked` | YouCanBookMe securely notified the site that an appointment was completed |
| `prequalification_started` | A visitor left for the NEO prequalification flow |
| `phone_contact_started` | A telephone link was selected |
| `email_contact_started` | An email link was selected |
| `lead_form_started` | A visitor first engaged with a site form |
| `lead_form_submitted` | A site form was submitted |
| `lead_form_completed` | A mapped thank-you page was reached |
| `generate_lead` | A completed site lead, suitable for GA4 key-event reporting |
| `calculator_started` | A visitor first interacted with a calculator |
| `calculator_result_viewed` | A calculator result was updated, viewed, or exported |

## Attribution and privacy

The site attaches a small, non-sensitive attribution record to Netlify form submissions: original source, medium, campaign, landing page, referring domain, submission page, and the form's defined funnel intent. It never reads or sends a visitor's form answers to GA4.

GA4 reporting uses the event-scoped dimensions `website_source` and `lead_type`. They make it possible to compare lead quality by channel and website journey without using personal information.

## Confirmed consultation measurement

The established MyMortgageSTUDIO redirect inside YouCanBookMe remains unchanged. Booking completion is measured separately through `netlify/functions/booking-completed.js`, so it does not alter the existing mortgage-system handoff.

Before enabling the webhook, set these server-only Netlify environment variables:

- `BOOKING_WEBHOOK_SECRET`: a new long random secret used only by YouCanBookMe and the function
- `GA4_MEASUREMENT_ID`: `G-QC0YG2MK2P`
- `GA4_MEASUREMENT_PROTOCOL_SECRET`: an API secret created in this GA4 property's web stream

Then configure YouCanBookMe to send a POST request to:

`https://darynfillis.com/.netlify/functions/booking-completed`

with the header `x-booking-webhook-secret` and only an opaque `booking_reference` in the JSON body. The function validates the secret, sends a server-side `consultation_booked` event to GA4, and deduplicates retries. It intentionally does not receive or transmit names, emails, phone numbers, loan information, or other borrower data.

## Recommended GA4 key events

- `consultation_booked`
- `generate_lead`
- `prequalification_started`

Use `schedule_started`, `schedule_viewed`, `schedule_widget_loaded`, `lead_form_started`, and `lead_form_submitted` as diagnostic funnel steps rather than primary conversions.
