const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TODAY = '2026-06-25';

function filePath(file) {
  return path.join(ROOT, file);
}

function read(file) {
  return fs.readFileSync(filePath(file), 'utf8');
}

function write(file, content) {
  fs.mkdirSync(path.dirname(filePath(file)), { recursive: true });
  fs.writeFileSync(filePath(file), content);
}

function replaceOnce(html, search, replacement, label) {
  if (!html.includes(search)) {
    throw new Error(`Could not find marker for ${label}`);
  }
  return html.replace(search, replacement);
}

function addGlobalNeighborhoodLinks(html) {
  if (!html.includes('<a href="/neighborhoods">Neighborhoods</a>')) {
    html = replaceOnce(
      html,
      '    <a href="/journey">Journey</a>',
      '    <a href="/journey">Journey</a>\n    <a href="/neighborhoods">Neighborhoods</a>',
      'primary neighborhoods nav link'
    );
  }

  if (!html.includes('<a href="/neighborhoods">Neighborhood Guides</a>')) {
    html = replaceOnce(
      html,
      '      <a href="/journey">The Journey</a>',
      '      <a href="/journey">The Journey</a>\n      <a href="/neighborhoods">Neighborhood Guides</a>',
      'footer neighborhood guide link'
    );
  }

  return html;
}

function neighborhoodCard({ href, code, title, description, featured = false, delay = '' }) {
  if (featured) {
    return `      <a href="${href}" class="reveal ${delay}" style="background:var(--navy);border:1px solid rgba(91,203,245,0.25);border-radius:12px;padding:28px;text-decoration:none;display:flex;flex-direction:column;min-height:230px;transition:box-shadow 0.22s,transform 0.22s;position:relative;overflow:hidden" onmouseover="this.style.boxShadow='0 12px 36px rgba(10,37,64,0.18)';this.style.transform='translateY(-4px)'" onmouseout="this.style.boxShadow='';this.style.transform=''">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 80% at 100% 0%,rgba(91,203,245,0.12) 0%,transparent 60%);pointer-events:none"></div>
        <div style="position:relative;z-index:1;font-size:0.62rem;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:var(--blue);margin-bottom:10px">${code}</div>
        <h3 style="position:relative;z-index:1;font-weight:800;font-size:1.08rem;color:var(--white);letter-spacing:-0.01em;line-height:1.25;margin:0 0 12px 0">${title}</h3>
        <p style="position:relative;z-index:1;font-weight:200;font-size:0.88rem;color:rgba(255,255,255,0.7);line-height:1.75;margin:0 0 18px 0;flex:1">${description}</p>
        <span style="position:relative;z-index:1;font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--blue)">Read guide -></span>
      </a>`;
  }

  return `      <a href="${href}" class="reveal ${delay}" style="background:var(--surface);border:1px solid var(--rule);border-radius:12px;padding:28px;text-decoration:none;display:flex;flex-direction:column;min-height:230px;transition:box-shadow 0.22s,transform 0.22s" onmouseover="this.style.boxShadow='0 8px 32px rgba(10,37,64,0.1)';this.style.transform='translateY(-4px)'" onmouseout="this.style.boxShadow='';this.style.transform=''">
        <div style="font-size:0.62rem;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:var(--blue-dark);margin-bottom:10px">${code}</div>
        <h3 style="font-weight:800;font-size:1.08rem;color:var(--navy);letter-spacing:-0.01em;line-height:1.25;margin:0 0 12px 0">${title}</h3>
        <p style="font-weight:200;font-size:0.88rem;color:var(--body);line-height:1.75;margin:0 0 18px 0;flex:1">${description}</p>
        <span style="font-size:0.68rem;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:var(--blue-dark)">Read guide -></span>
      </a>`;
}

const neighborhoodCards = [
  neighborhoodCard({
    href: '/neighborhoods/santa-monica',
    code: '90401-90405',
    title: 'Santa Monica',
    description: 'Zip-code differences, condo rules, jumbo planning, and the financing realities behind the Westside premium.'
  }),
  neighborhoodCard({
    href: '/neighborhoods/manhattan-beach',
    code: '90266',
    title: 'Manhattan Beach',
    description: 'Sand, Tree, Hill, and East Manhattan Beach each need a different offer and jumbo strategy.',
    delay: 'd1'
  }),
  neighborhoodCard({
    href: '/neighborhoods/marina-del-rey',
    code: '90292',
    title: 'Marina del Rey',
    description: 'Condo building reviews, HOA dues, warrantability, marina-front complexity, and the loan strategy that keeps deals alive.',
    delay: 'd2'
  }),
  neighborhoodCard({
    href: '/neighborhoods/westchester',
    code: '90045 - Featured Partner',
    title: 'Westchester',
    description: '90045 financing strategy with The Stephanie Younger Group at Compass highlighted as the local agent of choice.',
    featured: true,
    delay: 'd3'
  })
];

function homepageNeighborhoodSection() {
  return `
<!-- NEIGHBORHOOD GUIDES -->
<section style="background:var(--white);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px);border-top:1px solid var(--rule)" id="neighborhoods">
  <div class="max-w">
    <div class="reveal" style="display:flex;align-items:flex-end;justify-content:space-between;gap:28px;flex-wrap:wrap;margin-bottom:42px">
      <div>
        <span class="eyebrow">Local Guides</span>
        <h2 class="h2" style="max-width:660px">Every neighborhood has its own mortgage strategy.</h2>
        <p class="sub">Santa Monica is not Manhattan Beach. Marina del Rey is not Westchester. The price point, property type, HOA, appraisal, loan size, and offer terms all change by market.</p>
      </div>
      <a href="/neighborhoods" class="btn btn-outline-navy">View all neighborhoods</a>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:20px">
${neighborhoodCards.join('\n\n')}
    </div>
  </div>
</section>
`;
}

function updateIndex() {
  const file = 'index.html';
  let html = addGlobalNeighborhoodLinks(read(file));

  if (!html.includes('id="neighborhoods"')) {
    const marker = html.match(/\n<!--[^>]*REFI RATE WATCH LEAD MAGNET[^>]*-->/);
    if (!marker) throw new Error('Could not find Refi Rate Watch section marker in index.html');
    html = html.slice(0, marker.index) + '\n' + homepageNeighborhoodSection() + html.slice(marker.index);
  }

  html = html.replace('\n<!-- ══ FOOTER ══ -->\n</main>\n\n<footer>', '\n<!-- ══ FOOTER ══ -->\n\n<footer>');
  write(file, html);
}

function updateNeighborhoodDetailPage(file, name) {
  let html = read(file);

  html = html.replace(
    '"name": "Neighborhoods", "item": "https://darynfillis.com/neighborhoods/"',
    '"name": "Neighborhoods", "item": "https://darynfillis.com/neighborhoods"'
  );

  html = html.replace(
    '.breadcrumb-bar{background:var(--white);border-bottom:1px solid var(--rule);padding:10px 48px}',
    '.breadcrumb-bar{position:static;top:auto;left:auto;right:auto;height:auto;display:block;margin-top:70px;background:var(--white);border-bottom:1px solid var(--rule);padding:6px 48px}'
  );

  html = html.replace(
    '@media(max-width:480px){.breadcrumb-bar{padding:8px 20px}}',
    '@media(max-width:480px){.breadcrumb-bar{position:static;top:auto;left:auto;right:auto;height:auto;display:block;margin-top:70px;padding:5px 20px}}'
  );

  if (!html.includes('class="skip-to-main"')) {
    html = replaceOnce(html, '<body>', '<body>\n<a href="#main-content" class="skip-to-main">Skip to main content</a>', `${file} skip link`);
  }

  html = addGlobalNeighborhoodLinks(html);

  if (!html.includes('<main id="main-content">')) {
    const breadcrumb = `\n\n<!-- BREADCRUMB -->\n<nav class="breadcrumb-bar" aria-label="Breadcrumb">\n  <div class="breadcrumb-inner">\n    <a href="/" class="breadcrumb-item">Home</a><span class="breadcrumb-sep">›</span><a href="/neighborhoods" class="breadcrumb-item">Neighborhoods</a><span class="breadcrumb-sep">›</span><span class="breadcrumb-item current" aria-current="page">${name}</span>\n  </div>\n</nav>\n\n<main id="main-content">`;
    html = html.replace(/<\/nav>\s*<!-- HERO -->/, `</nav>${breadcrumb}\n\n<!-- HERO -->`);
  }

  if (!html.includes('\n</main>\n\n<footer>')) {
    html = html.replace('\n<footer>', '\n\n</main>\n\n<footer>');
  }

  write(file, html);
}

function shellFromTemplate(template, metaBlock, bodyBlock) {
  const titleIndex = template.indexOf('<title>');
  const styleIndex = template.indexOf('<style>');
  const bodyIndex = template.indexOf('<body>');
  const navMatch = template.match(/<nav id="nav">[\s\S]*?<\/nav>/);
  const footerIndex = template.indexOf('<footer>');

  if (titleIndex === -1 || styleIndex === -1 || bodyIndex === -1 || !navMatch || footerIndex === -1) {
    throw new Error('Could not split neighborhood template');
  }

  const beforeTitle = template.slice(0, titleIndex);
  const styleThroughBody = template.slice(styleIndex, bodyIndex + '<body>'.length);
  const nav = navMatch[0];
  const footer = template.slice(footerIndex);

  return `${beforeTitle}${metaBlock}\n${styleThroughBody}\n<a href="#main-content" class="skip-to-main">Skip to main content</a>\n\n${nav}\n\n${bodyBlock}\n\n${footer}`;
}

function hubMeta() {
  return `<title>Los Angeles Neighborhood Mortgage Guides | Daryn Fillis</title>
<meta name="description" content="Neighborhood-specific home financing guides for Los Angeles buyers, sellers, and real estate partners. Explore Santa Monica, Manhattan Beach, Marina del Rey, Westchester, and more.">
<link rel="canonical" href="https://darynfillis.com/neighborhoods">

<meta property="og:title" content="Los Angeles Neighborhood Mortgage Guides | Daryn Fillis">
<meta property="og:description" content="Neighborhood-specific home financing guides for Los Angeles buyers, sellers, and real estate partners.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://darynfillis.com/neighborhoods">
<meta property="og:image" content="https://darynfillis.com/og-home.jpg">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Los Angeles Neighborhood Mortgage Guides | Daryn Fillis">
<meta name="twitter:description" content="Neighborhood-specific home financing guides for Los Angeles buyers, sellers, and real estate partners.">
<meta name="twitter:image" content="https://darynfillis.com/og-home.jpg">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Los Angeles Neighborhood Mortgage Guides",
  "description": "Neighborhood-specific home financing guides for Los Angeles buyers, sellers, and real estate partners.",
  "url": "https://darynfillis.com/neighborhoods"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://darynfillis.com/"},
    {"@type": "ListItem", "position": 2, "name": "Neighborhoods", "item": "https://darynfillis.com/neighborhoods"}
  ]
}
</script>`;
}

function hubBody() {
  return `<!-- BREADCRUMB -->
<nav class="breadcrumb-bar" aria-label="Breadcrumb">
  <div class="breadcrumb-inner">
    <a href="/" class="breadcrumb-item">Home</a><span class="breadcrumb-sep">›</span><span class="breadcrumb-item current" aria-current="page">Neighborhoods</span>
  </div>
</nav>

<main id="main-content">
<section style="background:var(--navy);padding:clamp(110px,14vw,150px) clamp(20px,4vw,48px) clamp(56px,7vw,88px);position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 100% 30%,rgba(91,203,245,0.09) 0%,transparent 60%);pointer-events:none"></div>
  <div class="max-w" style="position:relative;z-index:1">
    <span class="eyebrow" style="color:var(--blue)">Neighborhood Guides</span>
    <h1 class="h1" style="color:var(--white);max-width:820px">Local mortgage strategy for specific Los Angeles neighborhoods.</h1>
    <p class="sub" style="color:rgba(255,255,255,0.72);max-width:760px">A good financing plan changes by zip code, property type, HOA, price tier, appraisal risk, and offer competition. These guides help buyers, sellers, and agents plan the financing side before the deal is under pressure.</p>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:30px">
      <a href="/schedule" class="btn btn-primary">Talk through a neighborhood strategy</a>
      <a href="/#neighborhoods" class="btn btn-outline-white">View featured guides</a>
    </div>
  </div>
</section>

<section style="background:var(--white);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px)">
  <div class="max-w">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:28px;flex-wrap:wrap;margin-bottom:38px">
      <div>
        <span class="eyebrow">Browse the Guides</span>
        <h2 class="h2" style="max-width:720px">Start with the market where the client is actually making decisions.</h2>
        <p class="sub">Each guide is built around practical financing decisions, not generic neighborhood descriptions.</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px">
${neighborhoodCards.join('\n\n')}
    </div>
  </div>
</section>

<section style="background:var(--surface);padding:clamp(64px,9vw,96px) clamp(20px,4vw,48px)">
  <div class="max-w" style="display:grid;grid-template-columns:1.05fr 0.95fr;gap:36px;align-items:start">
    <div>
      <span class="eyebrow">Why Local Financing Matters</span>
      <h2 class="h2">The same pre-approval can perform very differently from one neighborhood to the next.</h2>
      <p class="sub">In one market, the strategy may be about jumbo loan reserves and appraisal support. In another, it may be condo warrantability, HOA dues, insurance, or offer structure. The goal is to help the buyer and agent know the pressure points before writing.</p>
    </div>
    <div style="background:var(--white);border:1px solid var(--rule);border-radius:14px;padding:30px">
      <h3 style="margin:0 0 14px 0;color:var(--navy);font-size:1.05rem;font-weight:800">What each guide is designed to clarify</h3>
      <ul style="margin:0;padding-left:20px;color:var(--body);line-height:1.85;font-weight:250">
        <li>Likely financing friction by property type</li>
        <li>Offer strategy considerations for competitive listings</li>
        <li>Conforming, high-balance, and jumbo loan planning</li>
        <li>Questions buyers should ask before falling in love with the home</li>
        <li>How agents and lenders can coordinate earlier in the process</li>
      </ul>
    </div>
  </div>
</section>

<section style="background:var(--navy);padding:clamp(56px,8vw,86px) clamp(20px,4vw,48px);text-align:center">
  <div class="max-w" style="max-width:780px">
    <span class="eyebrow" style="color:var(--blue)">Have a specific property?</span>
    <h2 class="h2" style="color:var(--white)">Bring the address before the offer is written.</h2>
    <p class="sub" style="color:rgba(255,255,255,0.72)">I can help review the financing strategy, loan structure, cash-to-close, HOA or insurance concerns, and how the offer may look to the listing side.</p>
    <a href="/schedule" class="btn btn-primary" style="margin-top:22px">Schedule a strategy call</a>
  </div>
</section>
</main>`;
}

function westchesterMeta() {
  return `<title>Buying a Home in Westchester 2026 | Daryn Fillis</title>
<meta name="description" content="Westchester, Los Angeles mortgage strategy for buyers, sellers, and agents. Includes financing considerations for 90045 and why The Stephanie Younger Group is a strong local real estate partner.">
<link rel="canonical" href="https://darynfillis.com/neighborhoods/westchester">

<meta property="og:title" content="Buying a Home in Westchester 2026 | Daryn Fillis">
<meta property="og:description" content="Westchester, Los Angeles mortgage strategy with The Stephanie Younger Group highlighted as the local agent of choice.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://darynfillis.com/neighborhoods/westchester">
<meta property="og:image" content="https://darynfillis.com/og-home.jpg">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Buying a Home in Westchester 2026 | Daryn Fillis">
<meta name="twitter:description" content="Westchester, Los Angeles mortgage strategy with The Stephanie Younger Group highlighted as the local agent of choice.">
<meta name="twitter:image" content="https://darynfillis.com/og-home.jpg">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Daryn Fillis - NEO Home Loans",
  "image": "https://darynfillis.com/og-home.jpg",
  "telephone": "424-396-6967",
  "email": "myadvisors@neohomeloans.com",
  "areaServed": {"@type": "Place", "name": "Westchester, Los Angeles, CA"},
  "url": "https://darynfillis.com/neighborhoods/westchester",
  "priceRange": "Free consultation"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Buying a Home in Westchester 2026 | Daryn Fillis",
  "description": "Westchester, Los Angeles mortgage strategy for buyers, sellers, and agents.",
  "url": "https://darynfillis.com/neighborhoods/westchester"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://darynfillis.com/"},
    {"@type": "ListItem", "position": 2, "name": "Neighborhoods", "item": "https://darynfillis.com/neighborhoods"},
    {"@type": "ListItem", "position": 3, "name": "Westchester", "item": "https://darynfillis.com/neighborhoods/westchester"}
  ]
}
</script>`;
}

function westchesterBody() {
  return `<!-- BREADCRUMB -->
<nav class="breadcrumb-bar" aria-label="Breadcrumb">
  <div class="breadcrumb-inner">
    <a href="/" class="breadcrumb-item">Home</a><span class="breadcrumb-sep">›</span><a href="/neighborhoods" class="breadcrumb-item">Neighborhoods</a><span class="breadcrumb-sep">›</span><span class="breadcrumb-item current" aria-current="page">Westchester</span>
  </div>
</nav>

<main id="main-content">
<section style="background:var(--navy);padding:clamp(110px,14vw,150px) clamp(20px,4vw,48px) clamp(56px,7vw,88px);position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 100% 30%,rgba(91,203,245,0.09) 0%,transparent 60%);pointer-events:none"></div>
  <div class="max-w" style="position:relative;z-index:1">
    <span class="eyebrow" style="color:var(--blue)">Westchester - 90045</span>
    <h1 class="h1" style="color:var(--white);max-width:820px">Westchester buyers need a financing plan that is ready before the right house shows up.</h1>
    <p class="sub" style="color:rgba(255,255,255,0.72);max-width:760px">Westchester is a relationship-driven, inventory-sensitive market with a mix of move-up buyers, first-time buyers stretching into single-family homes, and sellers who need certainty. The loan strategy needs to support the offer, not trail behind it.</p>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:30px">
      <a href="/schedule" class="btn btn-primary">Review a Westchester strategy</a>
      <a href="https://stephanieyounger.com/" class="btn btn-outline-white" target="_blank" rel="noopener">Visit Stephanie Younger</a>
    </div>
  </div>
</section>

<section style="background:var(--white);padding:clamp(64px,9vw,96px) clamp(20px,4vw,48px)">
  <div class="max-w" style="display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:stretch">
    <div style="background:var(--surface);border:1px solid var(--rule);border-radius:14px;padding:30px">
      <span class="eyebrow">For Buyers</span>
      <h2 style="font-size:1.35rem;line-height:1.25;color:var(--navy);margin:8px 0 14px;font-weight:800">The win is knowing your ceiling before you fall in love with the home.</h2>
      <p style="font-weight:250;color:var(--body);line-height:1.8;margin:0">In Westchester, a buyer often needs to move quickly when a well-positioned single-family home comes up. That means cash-to-close, reserves, loan type, appraisal risk, and offer terms should be mapped out before the showing. The goal is not just to qualify. The goal is to write with clarity and confidence.</p>
    </div>
    <div style="background:var(--surface);border:1px solid var(--rule);border-radius:14px;padding:30px">
      <span class="eyebrow">For Sellers</span>
      <h2 style="font-size:1.35rem;line-height:1.25;color:var(--navy);margin:8px 0 14px;font-weight:800">The strongest offer is not always the cleanest-looking offer.</h2>
      <p style="font-weight:250;color:var(--body);line-height:1.8;margin:0">Sellers need to understand the buyer's financing strength, not just the price on page one. Loan structure, appraisal gap planning, contingency timing, down payment source, and lender communication can change the risk profile of an offer dramatically.</p>
    </div>
  </div>
</section>

<section style="background:var(--surface);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px)">
  <div class="max-w" style="display:grid;grid-template-columns:0.95fr 1.05fr;gap:40px;align-items:start">
    <div>
      <span class="eyebrow">Agent of Choice</span>
      <h2 class="h2">The Stephanie Younger Group at Compass brings the local discipline Westchester requires.</h2>
      <p class="sub">For Westchester, the agent matters. The market is too local, too relationship-based, and too nuanced to treat like a generic Los Angeles search.</p>
      <a href="https://stephanieyounger.com/" class="btn btn-outline-navy" target="_blank" rel="noopener" style="margin-top:18px">Learn more about Stephanie Younger</a>
    </div>
    <div style="background:var(--white);border:1px solid var(--rule);border-radius:14px;padding:32px">
      <h3 style="margin:0 0 14px 0;color:var(--navy);font-size:1.1rem;font-weight:800">The value Stephanie brings on the buy side</h3>
      <p style="font-weight:250;color:var(--body);line-height:1.8;margin:0 0 22px">Stephanie and her team help buyers understand the neighborhood at a street-by-street level, separate emotional interest from smart value, and prepare offers that are competitive without being reckless. That includes guidance on pricing context, property condition, seller motivation, timing, and how to coordinate with the lender so the offer reads as credible.</p>

      <h3 style="margin:0 0 14px 0;color:var(--navy);font-size:1.1rem;font-weight:800">The value Stephanie brings on the sell side</h3>
      <p style="font-weight:250;color:var(--body);line-height:1.8;margin:0 0 22px">On the listing side, Stephanie's value is not just exposure. It is preparation, positioning, pricing discipline, buyer qualification review, negotiation, and risk management from offer through close. A strong listing process should help the seller generate demand, understand the true strength of each offer, and avoid the avoidable problems that can appear after acceptance.</p>

      <h3 style="margin:0 0 14px 0;color:var(--navy);font-size:1.1rem;font-weight:800">Why this pairing matters</h3>
      <p style="font-weight:250;color:var(--body);line-height:1.8;margin:0">When the real estate strategy and lending strategy are aligned early, buyers write cleaner offers and sellers get better information. That coordination is especially important in Westchester, where the difference between a smooth closing and a stressful one is often the work done before the offer is accepted.</p>
    </div>
  </div>
</section>

<section style="background:var(--white);padding:clamp(64px,9vw,96px) clamp(20px,4vw,48px)">
  <div class="max-w">
    <span class="eyebrow">Financing Strategy</span>
    <h2 class="h2" style="max-width:780px">A Westchester approval should answer more than, "How much can I borrow?"</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;margin-top:32px">
      <div style="border:1px solid var(--rule);border-radius:12px;padding:24px;background:var(--surface)"><strong style="color:var(--navy)">Loan size</strong><p style="margin:10px 0 0;color:var(--body);line-height:1.7;font-weight:250">Plan around conforming, high-balance, and jumbo thresholds before the offer price is chosen.</p></div>
      <div style="border:1px solid var(--rule);border-radius:12px;padding:24px;background:var(--surface)"><strong style="color:var(--navy)">Cash to close</strong><p style="margin:10px 0 0;color:var(--body);line-height:1.7;font-weight:250">Clarify down payment, closing costs, reserves, and potential appraisal gap comfort.</p></div>
      <div style="border:1px solid var(--rule);border-radius:12px;padding:24px;background:var(--surface)"><strong style="color:var(--navy)">Offer strength</strong><p style="margin:10px 0 0;color:var(--body);line-height:1.7;font-weight:250">Make the financing easy for the listing side to understand and hard to dismiss.</p></div>
    </div>
  </div>
</section>

<section style="background:var(--navy);padding:clamp(56px,8vw,86px) clamp(20px,4vw,48px);text-align:center">
  <div class="max-w" style="max-width:780px">
    <span class="eyebrow" style="color:var(--blue)">Westchester Game Plan</span>
    <h2 class="h2" style="color:var(--white)">Before you write, know the financing strategy behind the offer.</h2>
    <p class="sub" style="color:rgba(255,255,255,0.72)">I can help you map the mortgage side of the purchase so your offer strategy, cash plan, and long-term goals are aligned.</p>
    <a href="/schedule" class="btn btn-primary" style="margin-top:22px">Schedule a strategy call</a>
  </div>
</section>
</main>`;
}

function generateNeighborhoodPages() {
  const template = read('neighborhoods/santa-monica.html');
  write('neighborhoods.html', addGlobalNeighborhoodLinks(shellFromTemplate(template, hubMeta(), hubBody())));
  write('neighborhoods/westchester.html', addGlobalNeighborhoodLinks(shellFromTemplate(template, westchesterMeta(), westchesterBody())));
}

function updateRedirects() {
  let redirects = read('_redirects');
  if (!redirects.includes('/neighborhoods    /neighborhoods.html    200')) {
    redirects = redirects.replace('/*    /404.html    404', '/neighborhoods    /neighborhoods.html    200\n/neighborhoods/   /neighborhoods.html    200\n/*    /404.html    404');
  }
  write('_redirects', redirects);
}

function updateSitemap() {
  let xml = read('sitemap.xml');
  xml = xml.replace('<loc>https://darynfillis.com/</loc>\n    <lastmod>2026-05-29</lastmod>', `<loc>https://darynfillis.com/</loc>\n    <lastmod>${TODAY}</lastmod>`);
  for (const slug of ['santa-monica', 'manhattan-beach', 'marina-del-rey']) {
    const re = new RegExp(`(<loc>https://darynfillis.com/neighborhoods/${slug}</loc>\\n\\s*<lastmod>)[^<]+(</lastmod>)`);
    xml = xml.replace(re, `$1${TODAY}$2`);
  }
  if (!xml.includes('<loc>https://darynfillis.com/neighborhoods</loc>')) {
    xml = xml.replace('\n</urlset>', `

  <url>
    <loc>https://darynfillis.com/neighborhoods</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>

  <url>
    <loc>https://darynfillis.com/neighborhoods/westchester</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>

</urlset>`);
  }
  write('sitemap.xml', xml);
}

function main() {
  updateIndex();
  updateNeighborhoodDetailPage('neighborhoods/santa-monica.html', 'Santa Monica');
  updateNeighborhoodDetailPage('neighborhoods/manhattan-beach.html', 'Manhattan Beach');
  updateNeighborhoodDetailPage('neighborhoods/marina-del-rey.html', 'Marina del Rey');
  generateNeighborhoodPages();
  updateRedirects();
  updateSitemap();
  console.log('Neighborhood section generated successfully.');
}

main();
