# darynfillis.com

Personal mortgage advisory website for Daryn Fillis, Certified Mortgage Advisor at NEO Home Loans.

This site is built to educate buyers, homeowners, and real estate partners in Los Angeles. It includes strategy pages, local neighborhood pages, Field Notes articles, lead magnet landing pages, calculators, scheduling pages, and a private SYG partnership dashboard.

## Project status

This is a static HTML site deployed on Netlify.

There is no required frontend build process for normal page edits. Most pages are standalone `.html` files with page-level CSS and JavaScript. Netlify is used for hosting, forms, redirects, headers, and the SYG serverless function.

GitHub repository:

```text
https://github.com/darynfillis/darynfillis-website.git
```

## Tech stack

- Static HTML, CSS, and JavaScript
- Netlify hosting
- Netlify Forms for lead capture
- Netlify Functions for `/netlify/functions/deals.js`
- Netlify Blobs for SYG dashboard storage
- `netlify.toml` for deploy settings and headers
- `_redirects` for custom routing and 404 behavior
- `_headers` for asset and security headers
- `sitemap.xml` and `robots.txt` for SEO and crawler controls

## Local development

Install dependencies only if you need to run Netlify locally or work on the SYG function.

```bash
npm install
npm run dev
```

The `npm run dev` script runs:

```bash
netlify dev
```

For simple HTML edits, opening the relevant `.html` file in a browser is usually enough for layout review. Use Netlify Dev when testing forms, redirects, or serverless functions.

## Deployment

The site is designed to deploy from the project root.

Netlify configuration:

```toml
[build]
  publish = "."
```

Recommended deployment flow:

1. Make changes locally or through GitHub.
2. Test the edited pages on desktop and mobile widths.
3. Confirm forms submit correctly if a form was changed.
4. Confirm internal links use clean URLs, such as `/about` instead of `/about.html`.
5. Update `sitemap.xml` when adding or removing indexable pages.
6. Commit to GitHub and let Netlify deploy from the connected repository.

## Main site structure

```text
/
├── index.html                         # Homepage
├── about.html                         # About Daryn
├── schedule.html                      # Booking page
├── faq.html                           # Common mortgage questions
├── for-agents.html                    # Real estate partner page
├── field-notes.html                   # Field Notes index
├── field-notes/                       # Blog and newsletter-style articles
├── neighborhoods/                     # Local LA neighborhood pages
├── calculator.html                    # Mortgage calculator
├── buying-vs-renting.html             # Buy vs rent calculator
├── cal-condo.html                     # California condo page
├── cal-condo-buyer.html               # Condo buyer lead magnet
├── cal-condo-seller.html              # Condo seller lead magnet
├── thanks-*.html                      # Thank-you pages for forms and downloads
├── syg/                               # Private SYG dashboard pages
├── netlify/functions/deals.js         # SYG data API
├── sitemap.xml                        # Search engine sitemap
├── robots.txt                         # Crawler rules
├── netlify.toml                       # Netlify config
├── _redirects                         # Netlify redirects and 404 rule
├── _headers                           # Netlify headers
└── package.json                       # Netlify CLI and function dependency setup
```

## Page categories

### Core pages

These are the main public brand and conversion pages.

- `index.html`
- `about.html`
- `schedule.html`
- `faq.html`
- `for-agents.html`
- `ig.html`

### Strategy pages

These pages explain specific mortgage planning concepts and are usually indexable.

Examples:

- `no-cost-refinance.html`
- `competitive-offer-strategy.html`
- `mortgage-under-management.html`
- `pmi-strategy.html`
- `rsu-strategy.html`
- `relocation-strategy.html`
- `interest-rate-vs-cost.html`
- `move-up-method.html`
- `self-employed.html`
- `first-time-buyers.html`
- `military-veterans.html`

### Tools and calculators

These pages are more interactive and may include page-level JavaScript.

Examples:

- `calculator.html`
- `buying-vs-renting.html`
- `rate-watch.html`
- `refi-rate-watch.html`
- `journey.html`

### Field Notes

Field Notes is the article and newsletter section.

Index:

- `field-notes.html`

Article folder:

- `field-notes/`

When adding a Field Notes article:

1. Create the article file inside `field-notes/`.
2. Use a clean slug, such as `field-notes/example-topic.html`.
3. Add the article card or link to `field-notes.html`.
4. Add the article to `sitemap.xml` if it should be indexed.
5. Add or update the article image in `field-notes/images/` when needed.
6. Use an absolute canonical URL without `.html`, such as `https://darynfillis.com/field-notes/example-topic`.

### Neighborhood pages

Neighborhood pages live in:

```text
neighborhoods/
```

Current examples:

- `neighborhoods/santa-monica.html`
- `neighborhoods/manhattan-beach.html`
- `neighborhoods/marina-del-rey.html`

When adding a neighborhood page:

1. Duplicate the closest existing neighborhood page.
2. Update title, meta description, canonical URL, Open Graph tags, and page content.
3. Keep claims specific and current, especially pricing, inventory, insurance, HOA, zoning, and financing details.
4. Add the page to `sitemap.xml`.
5. Link to it from relevant pages if it should be discoverable.

### Lead magnets and thank-you pages

Lead magnet pages generally include Netlify forms and route users to thank-you pages.

Examples:

- `decode3.html`
- `self-employed-playbook.html`
- `cal-condo-buyer.html`
- `cal-condo-seller.html`
- `thanks-playbook.html`
- `thanks-condo-buyer-guide.html`
- `thanks-condo-seller-guide.html`
- `thanks-rate-watch.html`
- `thanks-partnership.html`

Thank-you pages should usually use:

```html
<meta name="robots" content="noindex, follow">
```

Gated PDFs or post-submit assets should be blocked in `robots.txt` when they are not meant to be indexed directly.

## Adding a new page

Use this workflow every time a new page is added.

1. Pick the page type.
   - Core page
   - Strategy page
   - Field Notes article
   - Neighborhood page
   - Lead magnet
   - Thank-you page
   - Tool or calculator

2. Choose a clean URL slug.
   - Use lowercase.
   - Use hyphens between words.
   - Avoid dates unless the date is part of the content strategy.
   - Keep the public URL extensionless, even though the file is `.html`.

3. Duplicate a similar existing page.
   - Strategy page: duplicate a strategy page.
   - Article: duplicate a Field Notes article.
   - Neighborhood page: duplicate an existing neighborhood page.
   - Thank-you page: duplicate a related thank-you page.

4. Update the `<head>`.
   - `<title>`
   - Meta description
   - Canonical URL
   - Robots directive
   - Open Graph title, description, URL, and image
   - Twitter card title, description, and image
   - Author and local geo tags where relevant

5. Update body content.
   - Hero headline
   - Subheadline
   - CTA buttons
   - Internal links
   - Footer links
   - Legal and compliance language

6. Update site discovery.
   - Add indexable pages to `sitemap.xml`.
   - Add article links to `field-notes.html` when relevant.
   - Add neighborhood links to relevant pages when relevant.
   - Update `ig.html` if the new page should be featured from social media.
   - Add redirects in `_redirects` if replacing or renaming an existing page.

7. Test before publishing.
   - Desktop layout
   - Mobile layout
   - Navigation links
   - CTA buttons
   - Forms
   - Thank-you page redirects
   - Social preview image
   - Spelling, numbers, and mortgage compliance language

## SEO conventions

Use clean canonical URLs without `.html`.

Correct:

```html
<link rel="canonical" href="https://darynfillis.com/no-cost-refinance">
```

Avoid:

```html
<link rel="canonical" href="https://darynfillis.com/no-cost-refinance.html">
```

Every indexable page should include:

- One unique `<title>`
- One unique meta description
- One canonical URL
- Open Graph metadata
- Twitter card metadata
- A clear H1
- Internal links to related pages
- A primary CTA

Recommended title format:

```text
Page Topic | Daryn Fillis
```

For local SEO pages:

```text
Buying a Home in [Neighborhood] | Daryn Fillis
```

For strategy pages:

```text
[Mortgage Strategy Topic] in Los Angeles | Daryn Fillis
```

## Sitemap rules

Update `sitemap.xml` when adding, removing, or renaming public indexable pages.

Do include:

- Homepage
- Core pages
- Strategy pages
- Field Notes articles
- Neighborhood pages
- Tools and calculators that should rank in search

Do not include:

- Thank-you pages
- Private dashboard pages
- Gated PDFs
- Test pages
- Pages with `noindex`

Use realistic priorities:

- Homepage: `1.0`
- Major conversion pages: `0.8` to `0.9`
- Articles and neighborhood pages: `0.6` to `0.85`
- Utility or legal pages: `0.3` to `0.5`

## Robots rules

`robots.txt` currently allows the public site to be crawled and blocks direct access to gated assets like the 2026 housing market PDF and confirmation page.

When adding new gated assets, add them to `robots.txt` if they should not be indexed directly.

Example:

```text
Disallow: /example-gated-file.pdf
Disallow: /example-confirmed
```

## Forms

Forms are handled through Netlify Forms.

A Netlify form should include:

```html
<form name="example-form" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/thanks-example">
  <input type="hidden" name="form-name" value="example-form">
  <p style="display:none">
    <label>Do not fill this out: <input name="bot-field" tabindex="-1"></label>
  </p>
</form>
```

After adding or changing a form:

1. Deploy to Netlify.
2. Submit a test form.
3. Confirm the form appears in the Netlify dashboard.
4. Confirm notifications are configured in Netlify.
5. Confirm the user lands on the correct thank-you page.

## SYG dashboard

The `syg/` folder contains private partnership dashboard pages.

Related files:

```text
syg/index.html
syg/rogers_intel.html
syg/README.md
netlify/functions/deals.js
```

The SYG dashboard uses the Netlify Function:

```text
/.netlify/functions/deals
```

The function requires this Netlify environment variable:

```text
SYG_PASSWORD
```

Do not expose `SYG_PASSWORD` in client-side code, public files, screenshots, or documentation.

## Brand voice

The site should sound like a mortgage advisor who is strategic, calm, practical, and direct.

Use language that is:

- Clear
- Plainspoken
- Strategic
- Locally relevant to Los Angeles
- Helpful without sounding salesy
- Focused on long-term financial impact, not just rates

Avoid language that is:

- Overhyped
- Fear-based
- Rate-shopper focused
- Overly technical without explanation
- Full of guarantees or promises

Good positioning themes:

- Better decisions before the offer
- Mortgage strategy, not just mortgage quotes
- Buyer confidence in a competitive market
- Wealth building through real estate
- Planning before, during, and after the transaction
- Support for real estate partners who want stronger clients and cleaner closings

## Mortgage compliance guardrails

Before publishing mortgage-related content, confirm that claims are accurate and compliant.

Do not promise:

- Loan approval
- A specific rate
- A specific payment
- Future home appreciation
- Guaranteed refinance savings
- Guaranteed tax benefits
- Guaranteed investment returns

Use careful language around:

- Affordability
- Qualification
- Mortgage rates
- APR
- Down payment requirements
- Program eligibility
- Investment returns
- Home appreciation
- Tax deductibility

When needed, include appropriate NMLS, Equal Housing, company, and licensing disclosures according to current company compliance requirements.

## Image and asset conventions

Common root-level assets include:

- `daryn-fillis.jpg`
- `hero.mp4`
- `og-home.jpg`
- `og-schedule.jpg`
- `og-playbook.jpg`
- `og-partnership.jpg`
- `og-self-employed.jpg`
- `favicon.png`
- `site.webmanifest`

Field Notes images live in:

```text
field-notes/images/
```

Use absolute URLs for Open Graph images:

```html
<meta property="og:image" content="https://darynfillis.com/og-home.jpg">
```

Social preview images should ideally be 1200 x 630 pixels.

## Redirects and headers

`_redirects` currently includes a catch-all rule that serves `404.html` for unmatched paths:

```text
/*    /404.html    404
```

When renaming a public page, add a redirect before the catch-all rule.

Example:

```text
/old-page    /new-page    301
/*           /404.html    404
```

`_headers` controls content types, favicon behavior, cache rules, and basic security headers.

Be careful when editing `_headers`, especially for favicons, social preview images, and security headers.

## Cleanup notes

Items that should not be part of a clean production repo or deployment package:

- `.DS_Store`
- `__MACOSX/`
- Local scratch folders
- Export artifacts
- Unneeded zip files
- Old test files
- Private data

Current maintenance items to verify:

- The canonical headshot asset is `daryn-fillis.jpg`.
- Condo guide download assets use clean public filenames: `california-condo-buyers-checklist.pdf` and `california-condo-sellers-checklist.pdf`.
- Generated public pages include `glossary.html`, `neighborhoods.html`, and `neighborhoods/westchester.html`.
- Some older pages may contain stale or duplicated metadata from copied templates. Check meta titles, descriptions, and robots directives before relying on a page for SEO.

## Working with AI on this project

When asking an AI assistant to add or edit a page, provide:

```text
Page name:
Desired URL slug:
Audience:
Primary goal:
Main CTA:
Source content:
SEO keyword focus:
Should this be indexed? Yes or no:
Related pages to link to:
Any compliance language required:
```

Expected AI workflow:

1. Duplicate the closest existing page type.
2. Update copy, layout, metadata, CTA, and internal links.
3. Update `sitemap.xml` if the page should be indexed.
4. Update `robots.txt` if the page or asset should be blocked.
5. Test links, forms, mobile layout, and metadata.
6. Return the changed files or an updated project zip.

## Ownership

Project owner:

```text
Daryn Fillis
Certified Mortgage Advisor
NMLS 1988371
NEO Home Loans
Los Angeles, California
```

Primary website:

```text
https://darynfillis.com
```
