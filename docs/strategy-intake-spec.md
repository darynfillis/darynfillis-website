# Scenario Desk Online Intake - Corrected Mockup

Status: discussion mockup only  
Proposed URL: `/strategy-intake`  
Production submission: disabled  
Search indexing: disabled with `noindex, nofollow`

## Source rule

The supplied two-page `Scenario Desk Interview Form.pdf` is the source of truth for client-facing questions and answer choices.

The mockup adds only two routing questions:

1. Has the client completed the online application and credit report?
2. Which source-form section applies: New House Purchase or Existing House Refinance?

No other strategy questions have been invented or substituted.

## Conditional routing

### Application and credit report complete

Skip information expected to exist in the application or credit file:

- Name, date of birth, address, email, city, state, ZIP code, and county
- Type of property and type of residence
- Most recent gross income
- Purchase price, sale price of the home being sold, current value, and cash-out amount
- Rental income
- Liquid-asset range
- Current liabilities
- First- and second-mortgage details

Retain source-form questions treated as planning inputs rather than standard application facts:

- Combined tax bracket
- Realtor fee
- Additional savings the client would consider using
- Ideal down payment
- Additional monthly prepayments
- Expected property appreciation
- Expected investment appreciation
- Years expected to keep the loan or home
- Desired payoff timeline
- Additional debt payments
- Major purchases planned within three years
- Closing-cost preference
- Option 1 versus Option 2 preference
- Risk Pyramid selection
- Key objectives
- The one outcome the client most wants to accomplish

### Application or credit report not complete

Show the applicable Page 1 information before Page 2, including the purchase or refinance branch, cash flow, liabilities, and mortgage information.

## Source-form fidelity

The mockup preserves:

- The Page 1 purchase and refinance section labels
- The Page 1 liability columns
- First- and second-mortgage fields
- All Page 2 time-horizon and payoff ranges
- The liquid-asset ranges
- Yes/No answer choices
- Option 1 and Option 2 wording
- A, B, and C Risk Pyramid labels and descriptions
- Both open-ended objective prompts

The liabilities section is adapted from a paper table into a responsive web table with an Add another row control.

The Risk Pyramid is adapted into an accessible HTML representation of the A/B/C spectrum and the loan-type continuum shown on Page 2.

## Deliberate mockup safeguards

- No submission endpoint
- No browser storage
- No analytics containing answers
- No sitemap entry
- `noindex, nofollow`
- No live CRM, LOS, email, or Netlify form connection

## Before production

1. Compare the skip map against the exact online application and credit workflow.
2. Confirm whether any retained fields are already available in the LOS or CRM.
3. Confirm the approved destination for responses.
4. Confirm privacy, consent, retention, access-control, and compliance language.
5. Decide how a response will match the correct client record.
6. Confirm rights to reproduce or adapt the Borrow Smart Mortgage source form and Risk Pyramid.
