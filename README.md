# Tahoe Lakefront Property Landing Page

This is a static Netlify-ready property landing page for 7600 N Lake Blvd #34.

## Deploy

1. Upload this folder to Netlify or connect it to a Git repo.
2. In Netlify, enable Forms/Form detection.
3. Deploy the site.
4. In Netlify, go to Forms and add email notifications for the `private-showing` form.

Netlify will capture the showing request form because the form is present in static HTML and includes `name="private-showing"` plus `data-netlify="true"`.

## Hero video

The current hero uses `assets/images/meta/hero-poster.jpg` as a static image.

When the hero video is ready:

1. Save the video as `assets/video/hero-video.mp4`.
2. In `index.html`, replace the hero image with the commented `<video>` block directly below it.
3. Keep the poster image as the fallback.

Recommended video settings: MP4/H.264, 1080p, short loop, muted background footage, compressed for web.

## Before launch

Confirm final active-listing facts before publishing: price, MLS status, bed/bath count, square footage, HOA, showing instructions, rental/STR rules, brokerage disclaimer, and any required agent compliance language.


## Krys contact details

The contact block, footer, hidden Netlify form fields, and success page now include:

- Instagram: https://www.instagram.com/krysbenyamein
- Phone: 714-588-1017
- Email: krysbenyamein@gmail.com

Netlify form email notifications are configured inside Netlify, not inside this HTML file. Add krysbenyamein@gmail.com and any team inboxes as notification recipients after deployment.

## Outbound place links

Neighborhood, resort, water-access, airport, grocery, and market cards are clickable. External links open in a new tab. The Ski Country card jumps to the detailed resort section on the same page.


## Netlify Forms fix applied

The showing form now uses Netlify's static HTML detection pattern:

```html
<form name="private-showing" method="POST" netlify netlify-honeypot="bot-field" action="/success/">
  <input type="hidden" name="form-name" value="private-showing">
```

A matching success page exists at both `/success/` and `success.html`. The form posts to `/success/` because extensionless success paths are the safest Netlify pattern. `_redirects` also forwards older `/success.html` and `/thanks.html` paths to `/success/`.

After redeploying, open Netlify Dashboard > Forms and make sure form detection is enabled. Then submit one test lead. If the form appears as `private-showing`, add email notifications for Krys and the real estate team in Netlify Dashboard > Forms > Form notifications.


## Added launch pages
- `/404.html` uses the existing illustrated Tahoe artwork style, not property photography.
- `/accessibility/` includes a simple accessibility statement and Krys contact info.
- `/privacy/` explains form collection and use.
- `/terms/` includes reliable-but-not-guaranteed, buyer verification, financing, and Equal Housing Opportunity language.

## Quick accessibility fixes included
- Visible focus states.
- Decorative icons marked as hidden from assistive tech.
- Audience-toggle inactive copy marked `aria-hidden`.
- Toggle/filter buttons use `aria-pressed`.
- Netlify honeypot field is hidden and removed from tab order.


## Favicon package

The 34 favicon assets are included in `/assets/favicons/` and all static page heads have been patched to reference them.


## OG Image Update
The Open Graph image is the selected retro FOR SALE poster at assets/images/meta/og-image.jpg, exported at 1200 x 630 for social previews.


## OGv2 / iMessage social preview

The primary social preview image is:

`/assets/images/meta/OGv2.jpg?v=2`

The site uses absolute Open Graph image URLs for better compatibility with iMessage, Facebook, LinkedIn, Slack, and other preview scrapers.

After deploying, test directly:

`https://laketahoecondo.netlify.app/assets/images/meta/OGv2.jpg?v=2`

Then paste the homepage URL into a new iMessage thread. If an older image appears, send the URL with a cache-busting query once:

`https://laketahoecondo.netlify.app/?v=2`


## OGv3 iMessage fix

Primary OG image is now a root-level image for maximum iMessage compatibility:

`https://laketahoecondo.netlify.app/OGv3.jpg?v=3`

The site now has one OG/Twitter image block per HTML page and no alternate OG image file references.

After deploy:
1. Open `https://laketahoecondo.netlify.app/OGv3.jpg?v=3` directly.
2. Open `https://laketahoecondo.netlify.app/?v=3` in Safari.
3. Paste `https://laketahoecondo.netlify.app/?v=3` into a new iMessage thread.

If iMessage still shows the old card, delete the thread and try again because Apple caches previews aggressively.


## OGv4 iMessage no-crop fix

The previous OG image was cropped to fit 1200x630, which trimmed the top and bottom of the poster. OGv4 preserves the full poster inside a 1200x630 canvas with safe padding.

Primary image:

`https://laketahoecondo.netlify.app/OGv4.jpg?v=4`

Test after deployment:
1. Open `https://laketahoecondo.netlify.app/OGv4.jpg?v=4` directly.
2. Paste `https://laketahoecondo.netlify.app/?v=4` into a brand-new iMessage thread.
3. If iMessage still shows the old card, delete the thread and test again. Apple caches link previews aggressively.


## OGv5 iMessage edge-fill version

OGv5 removes the beige padding. It preserves the full poster without cropping by using a blurred full-bleed version of the artwork behind the fitted poster.

Primary image:

`https://laketahoecondo.netlify.app/OGv5.jpg?v=5`

Test:
`https://laketahoecondo.netlify.app/?v=5`


## OGv6 correct-size poster

OGv6 uses the correctly-wide poster artwork and resizes it directly to 1200x630.
No crop. No beige padding. No blurred background.

Primary image:

`https://laketahoecondo.netlify.app/OGv6.jpg`

Test after deploy:

`https://laketahoecondo.netlify.app/OGv6.jpg`

Then paste this into a brand-new iMessage thread:

`https://laketahoecondo.netlify.app/?v=6`


## Matching 34 favicon

The favicon now uses the same circular 34 badge from the OG poster artwork.

Primary favicon paths:

`/favicon.ico`
`/favicon-32x32.png`
`/apple-touch-icon.png`
`/site.webmanifest`

If the old favicon still appears after deploying, hard refresh or open a private window. Browsers cache favicons aggressively.
