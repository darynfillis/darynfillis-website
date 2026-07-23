# Mortgage Strategy Intake Mockup

Status: discussion mockup only  
Proposed URL: `/strategy-intake`  
Production submission: disabled  
Search indexing: disabled with `noindex, nofollow`

## Purpose

This page is a planning interview, not a second mortgage application.

Working positioning:

> The application tells me what you qualify for. This tells me what the mortgage needs to do.

The secure application remains the system of record for factual loan information. The strategy intake captures priorities, tradeoffs, timing, risk preferences, liquidity decisions, and future context that are usually missing from a standard mortgage application.

## Primary routing logic

The first question asks how far the client has gone with the secure NEO application.

| Client status | Mockup behavior |
| --- | --- |
| Application and credit report complete | Skip the secure-data explanation and move directly into mortgage strategy. Ask only for the application email at the end to match the response to the correct file. |
| Application complete, credit not complete | Keep credit authorization and report handling in the secure application. Show the secure-data explanation, then continue with strategy questions only. |
| Application not complete | Explain that identity, employment, income, assets, liabilities, property, mortgage, and credit information belong in the secure application. Continue with strategy questions and offer the secure-application link. |
| Client is unsure | Keep the intake non-sensitive and let the follow-up process determine what remains incomplete. |

### Recommendation

Do not reproduce the full URLA or credit workflow inside a general website form. Even when a client has not applied, use this page for strategy and route underwriting data to the secure application. This reduces duplicate records, limits sensitive information on the public website stack, and creates a cleaner client experience.

## Source-form audit

| Source item | Recommended treatment |
| --- | --- |
| Name, date of birth, address, detailed residence information | Secure application. Basic contact information is requested here only when no application exists. |
| Gross income | Secure application. The intake asks only about the expected direction and variability of income. |
| Combined tax bracket | Remove from the default flow. Add later only if an approved tax-modeling workflow requires it. |
| Property type and occupancy | Secure application or transaction file. |
| Full liabilities table | Secure application and credit report. Never duplicate it here. |
| First and second mortgage details | Secure application, credit report, or mortgage statement. |
| Current value and cash-out amount | Secure loan file. The strategy intake keeps the intended use of equity. |
| Rental income | Secure application and real-estate-owned schedule. |
| Additional monthly prepayments | Keep as a strategy question because it reveals intentional cash-flow behavior. |
| Expected property appreciation and investment return | Keep only as clearly labeled hypothetical planning assumptions, never as forecasts or promises. |
| Purchase price and current-home sale price | Secure application or transaction file. |
| Available savings and desired down payment | Replace with a broad purchase-cash range, preferred reserve level, and down-payment strategy. |
| Expected time in the home or loan | Keep because it affects break-even analysis and loan structure. |
| Desired payoff timing | Keep as a long-term planning preference. |
| Liquid-asset band | Replace with reserve and liquidity questions. Account-level balances remain in the secure application. |
| Major purchases in the next three years | Keep because future cash needs can change the correct mortgage strategy. |
| Roll closing costs into the loan | Replace with a comparison among upfront costs, credits, cash-to-close, and break-even time. |
| Lower payment versus faster principal reduction | Keep, reframed as a liquidity-versus-payment tradeoff without promising tax benefits. |
| Fixed-versus-ARM risk pyramid | Replace with a direct question about acceptable payment and rate variability. |
| Key objectives and one most important result | Keep and move near the beginning of the interview. |

## Current mockup flow

The page uses one question per screen and recalculates progress from the active branch.

### Common path

1. Secure-application and credit status
2. Secure-data explanation when appropriate
3. Transaction or decision type
4. Most important outcome
5. Expected holding period
6. Payoff direction
7. Liquidity-versus-payment preference

### Purchase branch

- Approximate purchase-cash range
- Preferred post-closing reserve level
- Down-payment strategy
- Whether the purchase depends on selling another home

### Refinance and equity branch

- Primary refinance or equity objective
- Intended use of equity when applicable

### Common planning questions

- Additional payments toward debt
- Major use of cash expected within three years
- Household income outlook
- Comfort with payment or rate variability
- Closing-cost comparison preference
- Planning assumptions
- Open-ended context
- Application-match email or basic contact information
- Advisor-facing review summary

Estimated completion time: approximately 5 to 7 minutes, depending on branch.

## Data this page should not collect

- Social Security numbers
- Bank, investment, credit-card, or loan account numbers
- Login credentials
- Full credit-report data
- Identity-document images
- Detailed employment, income, asset, liability, or real-estate-owned schedules
- Credit authorization unless a separately approved compliance and technical workflow is designed for it

## Production matching

Preferred method: generate an opaque intake token from the CRM or loan record and place that token in a private invitation URL. Do not place a name, email address, loan number, or other personally identifiable information in the URL.

Initial fallback: ask for the email used on the secure application and match it manually or through an approved automation.

## Production destination options

1. Approved CRM or LOS integration. Best long-term option when an approved API or webhook is available.
2. Secure internal notification with controlled storage. Use only after confirming encryption, access, retention, and company policy.
3. Netlify Forms. Suitable for low-sensitivity lead forms, but this strategy intake should not use it until NEO/Better approves the data, access, retention, and notification workflow.

## Accessibility and usability requirements

- One clear question per screen
- Branch-aware progress indicator
- Back navigation that preserves answers
- Keyboard-selectable choices
- Visible focus states
- Minimum 44-pixel touch targets
- Semantic labels for every input
- Reduced-motion support
- Mobile-first layout
- Optional narrative questions may be skipped
- Clear distinction between this intake and the secure mortgage application

## Brand treatment

The mockup follows the current darynfillis.com system:

- Montserrat typography
- Navy `#0A2540`
- Light blue `#5bcbf5`
- Darker blue `#38b8e8`
- White cards, light gray rules, and restrained shadows
- Direct, strategic copy rather than rate-shopping or high-pressure language

## Compliance treatment

The mockup states that it is not:

- A mortgage application
- Credit authorization
- An approval or commitment to lend
- Tax advice

It avoids guarantees about qualification, rates, payments, appreciation, investment returns, tax benefits, or refinance savings. Planning percentages are described as hypothetical scenario inputs.

The production version still requires review under current NEO/Better policies, particularly for disclosure language, consent, data destination, permissions, retention, and automated follow-up.

## Deployment stages

### Stage 1: current discussion mockup

- Draft GitHub branch and draft pull request
- `noindex, nofollow`
- No sitemap entry
- No submission endpoint
- No browser storage
- No production merge

### Stage 2: approved prototype

- Finalize question wording and branches
- Choose the approved submission destination
- Add final consent and privacy language
- Configure analytics events without sending answer content to analytics
- Test all desktop and mobile branches
- Complete accessibility and compliance review

### Stage 3: production

- Connect the approved destination
- Add server-side validation and anti-spam controls
- Add record matching and conditional next steps
- Test delivery, permissions, retention, and failure handling
- Merge only after business, technical, and compliance approval

## Decisions required before production

1. Should clients normally receive this before or after the secure application?
2. Where should completed answers be delivered: CRM, LOS, an approved secure workflow, or another destination?
3. Should one household contact complete the strategy intake, or should co-borrowers answer jointly?
4. Should invitation links contain an opaque record token?
5. What exact privacy, consent, and compliance language is required?
6. Should the completion screen route to scheduling, the secure application, or a branch-specific next step?
7. Which default planning assumptions should be used in advisor modeling?

## Source-material note

The supplied PDF displays a Borrow Smart Mortgage copyright notice. This mockup does not reproduce its visual design or copy. It reorganizes and rewrites the underlying planning concepts for Daryn Fillis's practice. Confirm the practice's rights before publishing any closer adaptation of the original material.
