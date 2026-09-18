# Open House Property Strategy

This folder powers the property-specific landing-page system for the nine NEO sign riders.

## Public routes

The clean route pattern is:

```text
/homes/{property-slug}/{rider-slug}
```

Netlify rewrites each route to `open-house.html` and passes the property and rider as query parameters.

The demo property is:

```text
/homes/demo-123-main-street/do-not-scan
```

Available rider slugs:

```text
do-not-scan
get-rich-maybe
finance-smartly
wait-for-rates
today-tomorrow
no-best-mortgage
access-to-money
five-year-wealth
special-financing
```

## Adding a property

Add a new object to `properties.js` using a lowercase, hyphenated slug. Each property record controls:

- Address, price, property facts, and open-house schedule
- Hero image and image description
- Listing-agent attribution and contact details
- Tax, insurance, HOA, and closing-cost assumptions
- Three illustrative financing structures
- Property-specific seller credit or financing incentive
- Required property-specific disclosure

The demo record must be duplicated and replaced with verified property data before a QR code is pointed to a page.

## Important publishing checks

Before publishing a property:

1. Replace the demo image and property facts.
2. Verify the listing-agent name, brokerage, license, and contact routing.
3. Verify tax, insurance, HOA, seller-credit, and closing-cost assumptions.
4. Replace all demo financing terms with approved, property-specific illustrations.
5. Review special-financing language, eligible uses, expiration date, and disclosures for compliance.
6. Test all nine routes on desktop and mobile.
7. Submit the Netlify form and confirm the hidden property, rider, and interaction fields are captured.
8. Keep the pages `noindex` unless a future SEO strategy intentionally changes that.

## Architecture

- `../open-house.html`: shared page shell and Netlify form
- `styles.css`: NEO and DarynFillis.com presentation layer
- `styles-base.css`: layout, property hero, and shared foundations
- `styles-modules.css`: rider tools, strategy cards, and calculators
- `styles-conversion.css`: strategy brief form, partner attribution, footer, and confirmation page
- `styles-responsive.css`: tablet, mobile, accessibility, and reduced-motion rules
- `properties.js`: property records and financing assumptions
- `app-data.js`: rider language and shared state
- `app-utils.js`: calculations, routing, property rendering, metadata, and analytics helpers
- `app-modules.js`: rider-specific interface modules
- `app-interactions.js`: calculators, selectors, pressure test, and form validation
- `app.js`: application initialization
- `thanks.html`: post-submit confirmation page
- `demo-property.svg`: unmistakably labeled placeholder artwork for private review
