# Scenario Desk Online Intake - Guided Mockup v3

Status: discussion mockup only  
URL: `/strategy-intake`  
Production submission: disabled  
Search indexing: disabled with `noindex, nofollow`

## Objective

Convert the supplied two-page Scenario Desk Interview Form into a branded, one-step-at-a-time online intake without dropping any source question. The form must be understandable to a client who does not know mortgage or financial terminology.

## Source-fidelity rule

The supplied `Scenario Desk Interview Form.pdf` remains the source of truth. Every Page 1 and Page 2 field, range, Yes/No choice, Option 1/Option 2 statement, Risk Pyramid choice, and open-ended objective prompt is represented in the mockup.

Added questions are limited to routing and usability:

- Whether the online application and credit report are complete
- Purchase versus refinance
- Whether there is a second borrower
- Whether a home is being sold
- Whether a first mortgage exists
- Whether a second mortgage or HELOC exists

These additions prevent clients from seeing inapplicable blank sections. Each added question is labeled as a routing question.

## Application-complete routing

When the client confirms both the online application and credit report are complete, the form skips information expected to exist in that file:

- Borrower names, dates of birth, address, email, city, state, ZIP code, and county
- Property type and occupancy
- Gross income
- Purchase price and expected sale price
- Current value and cash-out amount
- Rental income
- Liquid-asset range
- Current liabilities
- First- and second-mortgage details

The form continues to collect source-form planning inputs that may not be standard application fields:

- Combined tax bracket
- Realtor fee when a home is being sold
- Additional savings available for a purchase
- Ideal down payment
- Purpose of cash out for a refinance, including Not applicable when no cash out is requested
- Additional monthly prepayments
- Property-appreciation assumption
- Investment-return assumption
- Expected time in the loan or home
- Desired payoff timeline
- Additional debt-payment behavior
- Major purchases within three years
- Closing-cost preference
- Option 1 versus Option 2
- Risk Pyramid preference
- Key objectives
- The single most important outcome

This is a best-logic mockup. Before production, the skip list must be compared field by field with the exact NEO application and credit workflow.

## Financial-literacy treatment

Every step includes:

1. A plain-English explanation of the question
2. Where the client can find the information
3. What the client should enter
4. An important note when tax, investment, appreciation, or product limitations apply

The most common sources identified in the form are:

- Government-issued ID
- Utility bill, lease, mortgage statement, or bank statement
- Purchase agreement, listing agreement, or agent value estimate
- Pay stub, W-2, tax return, pension statement, Social Security statement, or profit-and-loss statement
- Bank and brokerage statements
- Credit report and current debt statements
- Closing Disclosure, promissory note, and mortgage or HELOC statements

When an exact amount is not available, the client can use `I cannot find this right now` on supported fields. The review screen preserves the response as `Not sure` rather than forcing a guess.

## Source coverage

### Page 1

- Both Name and Date of birth lines
- Address, Email Address(es), City, State, ZIP code, and County
- Combined tax bracket and Most recent gross income
- Type of property and Type of residence
- Existing House Refinance Only: Current value, Cash-out requested, Purpose of cash out
- Cash Flow: rent collected, additional monthly prepayments, expected property appreciation, expected investment appreciation
- New House Purchase Only: purchase price, sale price of home being sold, Realtor fee, additional savings, ideal down payment
- Current liabilities: Type, Creditor, Rate, Balance, Principal & Interest, Tax & Insurance, Payoff Yes/No
- First Mortgage: original amount, original start date, fixed or adjustable term and years, interest-only Yes/No
- Second Mortgage: fixed term and years or HELOC, original amount, original start date

### Page 2

- All ten loan/home holding-period ranges
- All seven desired-payoff ranges
- All three liquid-asset ranges
- Additional monthly debt payment Yes/No and amount
- Major purchase Yes/No and purpose
- Roll closing costs into loan Yes/No
- Original Option 1 and Option 2 wording
- A, B, and C Risk Pyramid wording
- Full ARM-to-fixed product spectrum
- Key objectives prompt
- Single most important outcome prompt

## Brand treatment

The mockup uses the current darynfillis.com system:

- Montserrat typography
- Navy `#0A2540`
- Light blue `#5bcbf5`
- Darker blue `#38b8e8`
- Current fixed white navigation structure
- Current phone, Sign in, and Continue actions
- Dark video hero with the same overlay and grid texture
- Uppercase tracked eyebrow labels and compact CTA styling
- White form surfaces, light-gray rules, restrained shadows, and dark footer structure

## Usability treatment

- One decision or closely related field group per step
- Desktop help panel and mobile expandable help
- Branch-aware progress
- Back navigation with preserved answers
- Keyboard selection for choice questions
- Minimum 44-pixel touch targets
- Mobile liabilities cards instead of a wide table
- Review summary grouped by form section
- Explicit distinction between required and optional fields
- Reduced-motion support

## Mockup safeguards

- No submission endpoint
- No browser storage
- No answer-bearing analytics
- No live CRM, LOS, email, or Netlify Forms connection
- `noindex, nofollow`
- No sitemap entry

## Before production

1. Compare the skip map against the exact online application and credit report workflow.
2. Confirm the secure destination for completed responses.
3. Confirm how a response matches the correct client or loan record.
4. Confirm privacy, consent, retention, access-control, and compliance language.
5. Confirm the current Better/NEO disclosure language with compliance before production.
6. Confirm rights to reproduce or adapt the Borrow Smart Mortgage source form and Risk Pyramid.
