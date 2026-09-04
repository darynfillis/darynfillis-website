# Open House Property Strategy

This folder powers the property-specific landing-page system for the nine NEO sign riders.

## Public routes

The clean route pattern is:

```text
/homes/{property-slug}/{rider-slug}
```

Netlify rewrites the route to `open-house.html` and passes the property and rider as query parameters.

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

Add a new object to `properties.js` using a lowercase hyphenated slug. Each record controls:

- Property address and facts
- Hero image
- Open-house schedule
- Listing-agent attribution and contact details
- Tax, insurance, HOA, and cost assumptions
- Three illustrative financing structures
- Property-specific seller credit or financing incentive
- Required property-specific disclosure

The demo record must be replaced or duplicated with verified property data before a QR code is pointed to the page.

## Important publishing checks

Before publishing a property:

1. Replace the demo image and property facts.
2. Verify the listing-agent name, brokerage, license, and contact routing.
3. Verify tax, insurance, HOA, seller-credit, and closing-cost assumptions.
4. Replace all demo financing terms with approved, property-specific illustrations.
5. Review the special-financing language and expiration date for compliance.
6. Test all nine routes on mobile.
7. Submit the Netlify form and confirm the hidden property and rider fields are captured.
8. Keep the pages `noindex` unless a future SEO strategy intentionally changes that.

## Architecture

- `../open-house.html`: shared page shell and Netlify form
- `styles.css`: NEO and DarynFillis.com presentation layer
- `properties.js`: property records and financing assumptions
- `app.js`: route handling, rider modules, calculators, form context, and analytics
- `thanks.html`: post-submit confirmation page
