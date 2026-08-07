# Field Notes Design QA

## Comparison setup

- Source visual truth: `/private/tmp/la-condo-field-notes-qa/reference-article-desktop.png`
- Source mobile visual truth: `/private/tmp/la-condo-field-notes-qa/reference-article-mobile.png`
- Implementation desktop: `/private/tmp/la-condo-field-notes-qa/implementation-article-desktop.png`
- Implementation mobile: `/private/tmp/la-condo-field-notes-qa/implementation-article-mobile.png`
- Combined comparison: `/private/tmp/la-condo-field-notes-qa/side-by-side-comparison.png`
- Focused body comparison: `/private/tmp/la-condo-field-notes-qa/reference-article-body-desktop.png` and `/private/tmp/la-condo-field-notes-qa/implementation-article-body-desktop.png`
- Focused card comparison: `/private/tmp/la-condo-field-notes-qa/comparison-card-focused.png`
- Focused advisor/footer comparison: `/private/tmp/la-condo-field-notes-qa/reference-trust-desktop.png` and `/private/tmp/la-condo-field-notes-qa/implementation-trust-desktop.png`
- Desktop viewport and screenshots: 1280 x 900 CSS px and 1280 x 900 image px, equal-density comparison.
- Mobile viewport and screenshots: 390 x 844 CSS px and 390 x 844 image px, device pixel ratio 1, equal-density comparison.
- State: unauthenticated default page, menu closed. Mobile menu open and close states were also tested.

## Full-view comparison evidence

The desktop and mobile source and implementation captures use the same Field Notes header, breadcrumb, navy hero, typography, width constraints, image treatment, and responsive rules. The implementation uses the same 760px reading column and 880px hero image as the source. Content-dependent hero height and imagery differ as expected because the headline, introduction, and article image are different.

## Required fidelity surfaces

- Fonts and typography: passed. Both use Montserrat with the same 800-weight display headings, 400-weight body copy, sizes, line heights, and letter spacing. Desktop H1 is 51.2px/54.272px; mobile H1 is 32px/33.92px.
- Spacing and layout rhythm: passed. Header, breadcrumb, hero padding, reading-column width, image width, card padding, radii, borders, and CTA/footer spacing match the Field Notes template.
- Colors and visual tokens: passed. The implementation reuses the template's navy, blue, body, muted, surface, rule, and white tokens without substitutions.
- Image quality and asset fidelity: passed. The supplied 1600 x 900 PNG loads at the same 16:9 article and card treatment used by the source. No placeholder or reconstructed asset is used.
- Copy and content: passed. The supplied article copy, title, description, calls to action, attribution, and disclaimer are retained. The visible breadcrumb is intentionally shortened on mobile; the SEO title and article headline remain unchanged.

## Focused comparison evidence

- Article body: the paragraph, heading, list, callout, and reading-column treatment matches the existing Field Notes content styling.
- Field Notes card: target and reference cards measure the same on desktop, with identical 24px body padding, 10px radius, 1px rule border, 16px/20.8px title typography, and 14px date/read divider spacing.
- Advisor trust and footer: shared markup, styles, and runtime are copied directly from the current Field Notes template and render identically.
- Focused regions were necessary because typography, card footer alignment, and the advisor/legal treatment are too small to judge reliably from the full-page comparison alone.

## Interaction and technical checks

- Mobile menu opens and closes correctly.
- Schedule and email calls to action retain their intended links.
- All article images load.
- No horizontal overflow at 1280px or 390px.
- Browser console contains no warnings or errors.
- JSON-LD parses, social metadata is complete and unique, internal links resolve, and the sitemap remains valid XML.

## Comparison history

1. Initial finding: P2 mobile breadcrumb wrapped to a second line because the full article title was longer than the source breadcrumb.
2. First fix: shortened the visible breadcrumb label while preserving the SEO title and H1; it still narrowly wrapped at 390px.
3. Final fix: changed only the visible and BreadcrumbList label to `LA Condo: 10-Unit Advantage`. Post-fix evidence shows a single-line breadcrumb at 390px with no overflow.

## Findings

No actionable P0, P1, or P2 differences remain.

## Follow-up polish

No P3 visual changes are required for parity.

final result: passed
