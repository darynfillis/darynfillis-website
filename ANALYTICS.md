# Conversion analytics

The public site loads `site-analytics.js`, which sends consistent GA4 events without reading or transmitting form-field values.

## Funnel events

| Event | Meaning |
| --- | --- |
| `cta_clicked` | A primary site CTA was selected |
| `schedule_started` | A visitor selected a schedule or YouCanBookMe link |
| `schedule_viewed` | The scheduling page was viewed |
| `schedule_widget_loaded` | The YouCanBookMe embed loaded |
| `consultation_booked` | The confirmed-booking URL was reached |
| `prequalification_started` | A visitor left for the NEO prequalification flow |
| `phone_contact_started` | A telephone link was selected |
| `email_contact_started` | An email link was selected |
| `lead_form_submitted` | A site form was submitted |
| `lead_form_completed` | A mapped thank-you page was reached |
| `calculator_started` | A visitor first interacted with a calculator |
| `calculator_result_viewed` | A calculator result was updated, viewed, or exported |

## One provider setting

Configure YouCanBookMe's post-booking redirect URL as:

`https://darynfillis.com/schedule?booking=confirmed`

That URL triggers `consultation_booked`. Until the redirect is configured in YouCanBookMe, the site still records scheduling-page visits and widget loads but cannot confirm completed bookings across the third-party iframe boundary.

## Recommended GA4 key events

- `consultation_booked`
- `lead_form_completed`
- `prequalification_started`

Use `schedule_started`, `schedule_viewed`, and `schedule_widget_loaded` as diagnostic funnel steps rather than primary conversions.
