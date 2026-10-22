# Website lead routing

Every Netlify form submission is already captured and verified by Netlify. The `form-submitted` event function is the non-disruptive bridge to MyMortgageSTUDIO: it runs only after that verification and does not alter the visitor's form or thank-you-page experience.

## Before activation

Set these **function-only** environment variables in Netlify after confirming the MMS intake contract:

- `MMS_LEAD_INTAKE_URL` — the HTTPS intake endpoint hosted by `mymortgagestudio.com`
- `MMS_LEAD_INTAKE_TOKEN` — the secret issued for Daryn's MMS instance
- `MMS_LEAD_INTAKE_AUTH_HEADER` — optional; defaults to `Authorization`
- `MMS_LEAD_INTAKE_AUTH_PREFIX` — optional; defaults to `Bearer`

The function will not forward lead data until both the endpoint and token are present. It accepts only HTTPS destinations on `mymortgagestudio.com`, keeps credentials server-side, deduplicates repeated submissions, and never logs borrower details.

## MMS workflow contract

The lead payload contains a form name, intake intent, response plan, contact details, submitted answers, source attribution, and a marketing-consent value. The recommended MMS workflows are:

| Lead source | MMS tag / intent | First response | Marketing status |
| --- | --- | --- | --- |
| Buyer and seller guides | `condo-buyer-guide` or `condo-seller-guide` | Deliver requested guide, then task a personal follow-up | Not enrolled unless consented |
| Condo project checks | `condo-project-check-*` | Create review task and send confirmation email | Not enrolled unless consented |
| Refinance rate watch | `refinance-rate-watch` | Rate-watch confirmation and advisor task | Not enrolled unless consented |
| Mortgage / wealth digest | `*-digest` | Digest welcome email | Add only when the form has explicit marketing consent |
| Self-employed guide | `self-employed-playbook` | Deliver guide and create consultation task | Not enrolled unless consented |
| Partnership Plus | `agent-partnership` | Deliver partner resource and team task | Not enrolled unless consented |

Text messages, newsletters, and emails with attachments should be automated inside MMS after its consent and content settings are confirmed. The website sends the lead once; MMS owns the follow-up sequence and reporting.
