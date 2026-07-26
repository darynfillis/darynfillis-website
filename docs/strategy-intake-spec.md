# Scenario Desk Online Intake - Guided Mockup v4

Status: discussion mockup only  
URL: `/strategy-intake`  
Production submission: disabled  
Search indexing: disabled with `noindex, nofollow`

## Objective

Convert the supplied two-page Scenario Desk Interview Form into a branded, one-step-at-a-time online intake without dropping the information requested by the source form. The experience must be understandable to a client who does not know mortgage or financial terminology.

## Capture-only rule

The intake collects client-supplied information. It does not calculate, infer, score, categorize, recommend, or draw conclusions about:

- Affordability or qualification
- Equity or cash flow
- Investment return
- Risk level
- Tax bracket
- Loan structure
- Todd/Borrow Smart framework outcomes

The final screen is a review of supplied answers only.

## Source-fidelity rule

The supplied `Scenario Desk Interview Form.pdf` remains the source of truth for required information. Every Page 1 and Page 2 topic, Yes/No choice, Option 1/Option 2 statement, Risk Pyramid choice, mortgage field, liability field, and objective prompt is represented.

Two deliberate adaptations have been approved for the online version:

1. The Page 2 liquid-asset ranges are replaced by one exact combined dollar amount when possible.
2. `Roll closing costs into loan?` is displayed only for a refinance and is skipped for a purchase.

## Routing questions

Added questions are limited to routing and usability:

- Whether the online application and credit report are complete
- Purchase versus refinance
- Whether there is a second borrower
- Whether a home is being sold
- Number of existing properties
- Whether each property has a first mortgage
- Whether each property has a second mortgage or HELOC
- Whether a second lien is fixed term or a HELOC
- Federal filing status as an additional captured tax input

These questions prevent clients from seeing sections that do not apply.

## Unknown-answer rule

When the client does not know an answer, the interface provides:

`Not sure, I need Daryn's help with this.`

This appears as:

- An answer choice on applicable choice questions
- A cannot-find control on applicable text, date, percentage, and dollar fields
- A choice within applicable dropdowns

The client is not required to guess.

## Application-complete routing

When the client confirms that both the online application and credit report are complete, the intake skips information expected to already exist in that file, including:

- Borrower identity and contact information
- Property and occupancy information
- Gross income
- Purchase price and expected sale price
- Current value and requested cash-out amount
- Rental income
- Exact liquid-asset information
- Current liabilities
- First- and second-mortgage details

The production skip map still requires a field-by-field comparison with the actual NEO application and credit workflow.

## Existing real estate

Existing-real-estate questions are grouped by property.

The full-intake route asks how many properties the client currently owns and repeats a complete property section for each one. The new property being purchased is kept separate from existing real estate. On a refinance, Property 1 is the property being refinanced.

Each structured property captures:

- Address or identifying description
- Property type
- Primary, vacation, or investment use
- Current value
- Monthly rent collected
- Expected appreciation input
- First-mortgage routing
- First-mortgage creditor, rate, balance, principal and interest, tax and insurance, payoff preference, original amount, start date, fixed or adjustable term, term in years, and interest-only status
- Second-mortgage or HELOC routing
- Second-lien creditor, rate, balance, principal and interest, tax and insurance, payoff preference, original amount or line limit, start date, type, and fixed term when applicable

The form supports up to 10 structured properties plus an additional-property narrative for larger portfolios.

Property-secured debts stay with the property. The later liability section is reserved for non-property debts such as credit cards, auto loans, student loans, personal loans, and support obligations.

## Home-sale routing

For a purchase, the intake asks whether a current property is being sold.

- If No, sale-price and Realtor-fee questions are skipped.
- If Yes, the client identifies the property being sold and supplies the expected sales price and Realtor fee.

## Liquid assets

The source form asks for an approximate range. The online version asks for the exact current combined total when possible.

Include:

- Checking and savings
- Money-market accounts
- CDs
- Mutual funds
- Brokerage accounts
- Other marketable securities

Do not include real estate value. The client is directed to use the latest statements and add the current balances together. If the exact total cannot be determined, the client can choose `Not sure, I need Daryn's help with this.`

## Tax information

The intake captures:

- Expected federal filing status
- Annual gross income when the application is incomplete
- Combined tax bracket only when the client already knows it

The intake does not calculate or infer a tax bracket. The field may be recorded as unknown for later discussion.

## Closing-cost routing

`Roll closing costs into loan?` appears only on the refinance route.

It is skipped on the purchase route because purchase closing costs are not being treated as an amount to roll into the purchase loan in this workflow.

## Financial-literacy treatment

Every substantive step includes:

1. What the question means
2. Where the client can find the information
3. What the client should enter
4. An important note when tax, investment, appreciation, or product limitations apply

Common source documents include:

- Government-issued ID
- Utility bill, lease, mortgage statement, or bank statement
- Purchase agreement, listing agreement, or agent value estimate
- Pay stub, W-2, tax return, pension statement, Social Security statement, or profit-and-loss statement
- Bank and brokerage statements
- Credit report and current debt statements
- Closing Disclosure, promissory note, and mortgage or HELOC statements

## Page 1 coverage

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

## Page 2 coverage

- All loan/home holding-period ranges
- All desired-payoff ranges
- Exact liquid-asset total in place of the three source ranges
- Additional monthly debt payment Yes/No and amount
- Major purchase Yes/No and purpose
- Roll closing costs into loan Yes/No on refinance only
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
- Static dark branded hero with subtle grid texture; no video
- Uppercase tracked eyebrow labels and compact CTA styling
- White form surfaces, light-gray rules, restrained shadows, and dark footer structure

## Usability treatment

- One decision or closely related field group per step
- Similar information kept together
- Desktop help panel and mobile expandable help
- Branch-aware progress
- Back navigation with preserved answers
- Keyboard selection for choice questions
- Minimum 44-pixel touch targets
- Mobile liabilities cards instead of a wide table
- Review summary grouped by section and property
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
7. Approve final question order and required-versus-optional rules.
