const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TODAY = '2026-07-01';
const CANONICAL_URL = 'https://darynfillis.com/glossary';
const SKIP_DIRS = new Set(['.git', 'node_modules', '__MACOSX', '.netlify', 'mnt']);

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}

const terms = readJson('scripts/glossary-terms.json');

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

function listHtmlFiles(dir = '.') {
  const results = [];
  for (const entry of fs.readdirSync(filePath(dir), { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...listHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function removeGlossaryFromHeader(html) {
  return html.replace(/(<div[^>]*class=["'][^"']*\bnav-links\b[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/g, (match, open, inner, close) => {
    const cleanedInner = inner
      .replace(/\s*<a\s+href=["']\/glossary["'][^>]*>[\s\S]*?<\/a>/g, '')
      .replace(/\n{3,}/g, '\n\n');
    return open + cleanedInner + close;
  });
}

function normalizeInternalPageNav(html) {
  return html
    .replaceAll('href="#strategies"', 'href="/#strategies"')
    .replaceAll('href="#process"', 'href="/#process"');
}

function ensureFooterGlossaryLink(html) {
  return html.replace(/(<footer[\s\S]*?<\/footer>)/, footerMatch => {
    if (footerMatch.includes('href="/glossary"') || footerMatch.includes("href='/glossary'")) return footerMatch;

    const link = '\n      <a href="/glossary">Mortgage &amp; Real Estate Glossary</a>';
    let footer = footerMatch;
    if (footer.includes('<a href="/neighborhoods">Neighborhood Guides</a>')) {
      footer = footer.replace('      <a href="/neighborhoods">Neighborhood Guides</a>', `      <a href="/neighborhoods">Neighborhood Guides</a>${link}`);
    } else if (footer.includes('<a href="/journey">The Journey</a>')) {
      footer = footer.replace('      <a href="/journey">The Journey</a>', `      <a href="/journey">The Journey</a>${link}`);
    } else if (footer.includes('<a href="/calculator">Mortgage Calculator</a>')) {
      footer = footer.replace('      <a href="/calculator">Mortgage Calculator</a>', `      <a href="/calculator">Mortgage Calculator</a>${link}`);
    } else if (footer.includes('<a href="https://darynfillis.com/schedule">Book a Call</a>')) {
      footer = footer.replace('      <a href="https://darynfillis.com/schedule">Book a Call</a>', `      <a href="https://darynfillis.com/schedule">Book a Call</a>${link}`);
    } else if (footer.includes('<a href="/about">About</a>')) {
      footer = footer.replace('    <a href="/about">About</a>', `    <a href="/about">About</a>\n    <a href="/glossary">Mortgage &amp; Real Estate Glossary</a>`);
    } else {
      footer = footer.replace('</footer>', `\n  <div style="margin-top:10px"><a href="/glossary">Mortgage &amp; Real Estate Glossary</a></div>\n</footer>`);
    }
    return footer;
  });
}

function groupedTerms() {
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, 'en', { numeric: true }));
  const groups = new Map();
  for (const item of sorted) {
    const first = item.term.charAt(0).toUpperCase();
    const key = /^[A-Z]$/.test(first) ? first : '#';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function categoryCards() {
  const categories = [
    ['Mortgage strategy', 'Loan types, rate locks, refinance options, buydowns, mortgage insurance, and payment structure.'],
    ['Buying and selling', 'Offer terms, contingencies, escrow, disclosures, inspections, and closing milestones.'],
    ['Costs and cash flow', 'Cash to close, credits, points, prepaid items, taxes, insurance, and reserves.'],
    ['Title and property rules', 'Deeds, liens, easements, HOA details, condo warrantability, zoning, and ownership terms.']
  ];

  return categories.map(([title, copy]) => `
      <div class="glossary-card">
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(copy)}</p>
      </div>`).join('');
}

function alphabetNav(groups) {
  return [...groups.keys()].map(letter => `<a href="#letter-${letter === '#' ? 'number' : letter.toLowerCase()}">${letter}</a>`).join('');
}

function termSections() {
  const groups = groupedTerms();
  return [...groups.entries()].map(([letter, items]) => {
    const letterId = letter === '#' ? 'number' : letter.toLowerCase();
    const cards = items.map(item => {
      const id = slugify(item.term);
      return `
        <article class="term-card" id="${id}" data-term="${escapeHtml(item.term.toLowerCase())}" data-category="${escapeHtml(item.category.toLowerCase())}">
          <div class="term-category">${escapeHtml(item.category)}</div>
          <h3>${escapeHtml(item.term)}</h3>
          <p>${escapeHtml(item.definition)}</p>
        </article>`;
    }).join('');

    return `
    <section class="glossary-letter" id="letter-${letterId}" aria-labelledby="heading-${letterId}">
      <h2 id="heading-${letterId}">${letter}</h2>
      <div class="term-grid">
${cards}
      </div>
    </section>`;
  }).join('');
}

function glossaryStructuredData() {
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${CANONICAL_URL}#webpage`,
    name: 'Mortgage and Real Estate Glossary',
    description: 'Plain-English mortgage and real estate definitions for buyers, homeowners, investors, sellers, and real estate partners.',
    url: CANONICAL_URL,
    author: {
      '@type': 'Person',
      name: 'Daryn Fillis',
      jobTitle: 'Certified Mortgage Advisor',
      url: 'https://darynfillis.com'
    },
    about: ['Mortgage terms', 'Real estate terms', 'Home buying', 'Refinancing', 'Los Angeles real estate']
  };

  const termSet = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${CANONICAL_URL}#terms`,
    name: 'Mortgage and Real Estate Glossary',
    description: 'Definitions for common mortgage, homebuying, real estate, title, escrow, and closing terms.',
    url: CANONICAL_URL,
    hasDefinedTerm: terms.map(item => ({
      '@type': 'DefinedTerm',
      name: item.term,
      description: item.definition,
      inDefinedTermSet: `${CANONICAL_URL}#terms`,
      url: `${CANONICAL_URL}#${slugify(item.term)}`
    }))
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://darynfillis.com/' },
      { '@type': 'ListItem', position: 2, name: 'Mortgage and Real Estate Glossary', item: CANONICAL_URL }
    ]
  };

  return [webPage, termSet, breadcrumbs]
    .map(data => `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`)
    .join('\n');
}

function glossaryMeta() {
  return `<title>Mortgage &amp; Real Estate Glossary | Daryn Fillis</title>
<meta name="description" content="Plain-English mortgage and real estate glossary for buyers, homeowners, investors, sellers, and agents. Learn loan, offer, escrow, title, closing, and refinance terms.">
<link rel="canonical" href="${CANONICAL_URL}">

<meta property="og:title" content="Mortgage &amp; Real Estate Glossary | Daryn Fillis">
<meta property="og:description" content="A comprehensive plain-English glossary of mortgage and real estate terms for buyers, homeowners, investors, sellers, and agents.">
<meta property="og:type" content="website">
<meta property="og:url" content="${CANONICAL_URL}">
<meta property="og:image" content="https://darynfillis.com/og-home.jpg">
<meta property="og:site_name" content="Daryn Fillis | NEO Home Loans">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Mortgage &amp; Real Estate Glossary | Daryn Fillis">
<meta name="twitter:description" content="Plain-English mortgage and real estate terms for buyers, homeowners, investors, sellers, and agents.">
<meta name="twitter:image" content="https://darynfillis.com/og-home.jpg">

<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Daryn Fillis">
<meta name="geo.region" content="US-CA">
<meta name="geo.placename" content="Los Angeles, California">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;600;800&display=swap" rel="stylesheet">

${glossaryStructuredData()}`;
}

function glossaryStyles() {
  return `
<style>
.breadcrumb-bar{position:static;top:auto;left:auto;right:auto;height:auto;display:block;margin-top:70px;background:var(--white);border-bottom:1px solid var(--rule);padding:6px 48px}
.breadcrumb-inner{max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.breadcrumb-item{font-size:0.7rem;font-weight:600;color:var(--muted);text-decoration:none;letter-spacing:0.04em;white-space:nowrap;transition:color 0.15s}
.breadcrumb-item:hover{color:var(--navy)}
.breadcrumb-item.current{color:var(--body);font-weight:600}
.breadcrumb-sep{font-size:0.65rem;color:var(--muted);opacity:0.5}
.glossary-search-breadcrumb{margin-top:0;border-top:1px solid var(--rule)}
.glossary-hero { background: var(--navy); padding: clamp(94px, 14vw, 142px) clamp(20px, 4vw, 48px) clamp(50px, 7vw, 76px); position: relative; overflow: hidden; }
.glossary-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 68% 80% at 100% 34%, rgba(91,203,245,0.075) 0%, transparent 60%); pointer-events: none; }
.glossary-hero .max-w { max-width: 840px; position: relative; z-index: 1; }
.glossary-kicker { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 24px; padding: 6px 14px; border-radius: 20px; background: rgba(91,203,245,0.12); border: 1px solid rgba(91,203,245,0.25); }
.glossary-kicker-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); box-shadow: 0 0 8px var(--blue); }
.glossary-kicker-text { font-size: 0.66rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--blue); }
.glossary-hero h1 { font-weight: 800; font-size: clamp(2.05rem, 5.5vw, 3.7rem); color: var(--white); letter-spacing: -0.035em; line-height: 1.04; margin: 0 0 22px; max-width: 780px; }
.glossary-hero h1 em { color: var(--blue); font-style: normal; }
.glossary-hero .sub { font-weight: 200; font-size: clamp(1rem, 1.4vw, 1.1rem); color: rgba(255,255,255,0.62); line-height: 1.85; max-width: 650px; margin: 0 0 32px; }
.glossary-section { background: var(--white); padding: clamp(64px, 9vw, 96px) clamp(20px, 4vw, 48px); }
.glossary-intro { display: grid; grid-template-columns: minmax(0, 0.95fr) minmax(320px, 1.05fr); gap: clamp(32px, 6vw, 72px); align-items: start; }
.glossary-intro-copy p { font-weight: 200; color: var(--body); line-height: 1.88; margin: 0 0 16px; }
.glossary-cards { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--rule); border-radius: 8px; overflow: hidden; background: var(--white); box-shadow: var(--shadow-sm); }
.glossary-card { display: grid; grid-template-columns: minmax(150px, 0.38fr) 1fr; gap: 18px; background: var(--white); border-bottom: 1px solid var(--rule); padding: 22px 24px; }
.glossary-card:last-child { border-bottom: none; }
.glossary-card h2 { color: var(--navy); font-size: 0.72rem; line-height: 1.35; margin: 0; font-weight: 800; letter-spacing: 0.11em; text-transform: uppercase; }
.glossary-card p { color: var(--body); font-size: 0.82rem; line-height: 1.72; margin: 0; font-weight: 200; }
.glossary-tools { background: var(--surface); border-bottom: 1px solid var(--rule); padding: 30px clamp(20px, 4vw, 48px); }
.glossary-tools-inner { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: minmax(260px, 360px) 1fr; gap: 26px; align-items: start; }
.glossary-search label { display: block; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--blue-dark); margin-bottom: 8px; }
.glossary-search input { width: 100%; min-height: 50px; border: 1px solid var(--rule); border-radius: 6px; padding: 13px 15px; font-family: var(--font); font-size: 0.92rem; color: var(--ink); background: var(--white); box-shadow: var(--shadow-sm); }
.glossary-search input:focus { outline: 2px solid var(--blue); outline-offset: 2px; border-color: var(--blue-dark); }
.alpha-nav { display: flex; gap: 7px; justify-content: flex-end; flex-wrap: wrap; padding-top: 26px; }
.alpha-nav a { display: inline-flex; align-items: center; justify-content: center; min-width: 30px; height: 30px; border: 1px solid var(--rule); border-radius: 4px; background: var(--white); color: var(--body); font-size: 0.72rem; font-weight: 800; text-decoration: none; transition: all 0.18s; }
.alpha-nav a:hover, .alpha-nav a:focus-visible { border-color: var(--blue-dark); color: var(--navy); background: rgba(91,203,245,0.12); outline: none; }
.glossary-list { background: var(--white); padding: clamp(58px, 8vw, 92px) clamp(20px, 4vw, 48px); }
.glossary-letter { max-width: 880px; margin: 0 auto 54px; scroll-margin-top: 116px; }
.glossary-letter h2 { color: var(--navy); font-size: clamp(1.55rem, 3vw, 2.05rem); font-weight: 800; letter-spacing: -0.025em; line-height: 1; margin: 0 0 18px; padding-bottom: 14px; border-bottom: 1px solid var(--rule); }
.term-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--rule); border-radius: 8px; overflow: hidden; background: var(--white); }
.term-card { border-bottom: 1px solid var(--rule); background: var(--white); padding: 22px 24px; scroll-margin-top: 116px; transition: background 0.18s; }
.term-card:last-child { border-bottom: none; }
.term-card:hover { background: var(--surface); }
.term-category { color: var(--blue-dark); font-size: 0.6rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px; }
.term-card h3 { color: var(--navy); font-size: 0.98rem; line-height: 1.3; font-weight: 800; margin: 0 0 8px; }
.term-card p { color: var(--body); font-size: 0.88rem; line-height: 1.82; margin: 0; font-weight: 200; }
.glossary-empty { max-width: 880px; margin: 0 auto; display: none; color: var(--body); font-weight: 400; line-height: 1.7; border: 1px solid var(--rule); border-radius: 8px; padding: 24px; background: var(--surface); }
.glossary-note { max-width: 880px; margin: 0 auto; padding-top: 4px; color: var(--muted); font-size: 0.78rem; line-height: 1.7; font-weight: 200; }
.glossary-cta { text-align: center; }
.glossary-cta .max-w { max-width: 780px; }
.glossary-cta .sub { color: rgba(255,255,255,0.72); margin: 0 auto; }
@media (max-width: 920px) {
  .glossary-intro, .glossary-tools-inner { grid-template-columns: 1fr; }
  .alpha-nav { justify-content: flex-start; }
  .alpha-nav { padding-top: 0; }
}
@media (max-width: 640px) {
  .breadcrumb-bar{position:static;top:auto;left:auto;right:auto;height:auto;display:block;margin-top:70px;padding:5px 20px}
  .glossary-search-breadcrumb{margin-top:0}
  .glossary-card { grid-template-columns: 1fr; gap: 8px; padding: 20px; }
  .glossary-letter { scroll-margin-top: 90px; }
  .term-card { padding: 20px; }
}
</style>`;
}

function glossaryBody() {
  const groups = groupedTerms();

  return `

<!-- BREADCRUMB -->
<nav class="breadcrumb-bar" aria-label="Breadcrumb">
  <div class="breadcrumb-inner">
    <a href="/" class="breadcrumb-item">Home</a><span class="breadcrumb-sep">›</span><span class="breadcrumb-item current" aria-current="page">Mortgage &amp; Real Estate Glossary</span>
  </div>
</nav>

<main id="main-content">
<section class="glossary-hero">
  <div class="max-w">
    <div class="glossary-kicker"><span class="glossary-kicker-dot"></span><span class="glossary-kicker-text">Mortgage &amp; Real Estate Terms</span></div>
    <h1>Mortgage and real estate terms, <em>translated into plain English.</em></h1>
    <p class="sub">Buying, selling, refinancing, or investing gets easier when the language is clear. This glossary explains mortgage, escrow, title, offer, closing, and real estate terms in practical language for California buyers, homeowners, agents, and investors.</p>
    <div class="hero-cta-row">
      <a href="#glossarySearch" class="btn btn-blue btn-wobble">Search the glossary</a>
      <span class="hero-divider">or</span>
      <a href="/schedule" class="btn btn-outline-white">Ask Daryn</a>
    </div>
  </div>
</section>

<section class="glossary-section">
  <div class="max-w glossary-intro">
    <div class="glossary-intro-copy">
      <span class="eyebrow">Use the right words</span>
      <h2 class="h2">Clear definitions make better mortgage and real estate strategy possible.</h2>
      <p>Terms like APR, cash to close, appraisal contingency, title insurance, reserves, and condo warrantability can affect the offer you write, the payment you carry, and the risk you take on.</p>
      <p>This page is built as a reference guide. It is not legal, tax, or credit advice, and actual loan approval depends on program rules, documentation, property details, and lender review.</p>
    </div>
    <div class="glossary-cards" aria-label="Glossary topic areas">
${categoryCards()}
    </div>
  </div>
</section>

<nav class="breadcrumb-bar glossary-search-breadcrumb" id="glossarySearch" aria-label="Breadcrumb">
  <div class="breadcrumb-inner">
    <a href="/" class="breadcrumb-item">Home</a><span class="breadcrumb-sep">›</span><span class="breadcrumb-item current" aria-current="page">Mortgage &amp; Real Estate Glossary</span>
  </div>
</nav>

<section class="glossary-tools" aria-label="Find a glossary term">
  <div class="glossary-tools-inner">
    <div class="glossary-search">
      <label for="glossarySearchInput">Search terms</label>
      <input id="glossarySearchInput" type="search" placeholder="Search APR, escrow, appraisal, PMI..." autocomplete="off">
    </div>
    <div class="alpha-nav" aria-label="Alphabetical glossary links">
${alphabetNav(groups)}
    </div>
  </div>
</section>

<section class="glossary-list" aria-label="Mortgage and real estate term definitions">
  <div class="glossary-empty" id="glossaryEmpty">No matching terms found. Try a broader mortgage or real estate keyword.</div>
${termSections()}
  <p class="glossary-note">Definitions are general and may vary by loan program, contract, state law, county custom, property type, lender, investor guideline, and timing.</p>
</section>

<section class="cta-banner glossary-cta">
  <div class="max-w">
    <span class="eyebrow" style="color:var(--blue)">Have a real scenario?</span>
    <h2 class="h2">The term matters most when it changes the strategy.</h2>
    <p class="sub">If you are comparing loan options, writing an offer, reviewing a disclosure, or deciding whether to refinance, bring the document or question into a strategy conversation.</p>
    <div class="cta-btns reveal d2" style="margin-top:28px">
      <a href="/schedule" class="btn btn-blue btn-wobble">Book a strategy call</a>
      <a href="tel:4243966967" class="btn btn-outline-white">Call 424-396-6967</a>
    </div>
  </div>
</section>
</main>`;
}

function glossaryScript() {
  return `
<script>
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

const searchInput = document.getElementById('glossarySearchInput');
const emptyState = document.getElementById('glossaryEmpty');
const termCards = Array.from(document.querySelectorAll('.term-card'));
const letterSections = Array.from(document.querySelectorAll('.glossary-letter'));
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    for (const card of termCards) {
      const haystack = (card.textContent || '').toLowerCase();
      const visible = !query || haystack.includes(query);
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    }
    for (const section of letterSections) {
      const visibleCards = section.querySelectorAll('.term-card:not([style*="display: none"])');
      section.style.display = visibleCards.length ? '' : 'none';
    }
    if (emptyState) emptyState.style.display = visibleCount ? 'none' : 'block';
  });
}

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}
</script>
</body>
</html>
`;
}

function generateGlossaryPage() {
  const template = read('index.html');
  const titleIndex = template.indexOf('<title>');
  const styleIndex = template.indexOf('<style>');
  const bodyIndex = template.indexOf('<body>');
  const navMatch = template.match(/<nav id="nav">[\s\S]*?<\/nav>/);
  const footerStart = template.indexOf('<footer>');
  const footerEnd = template.indexOf('</footer>', footerStart);

  if (titleIndex === -1 || styleIndex === -1 || bodyIndex === -1 || !navMatch || footerStart === -1 || footerEnd === -1) {
    throw new Error('Could not split index.html into reusable page shell');
  }

  const beforeTitle = template.slice(0, titleIndex);
  let styleThroughBody = template.slice(styleIndex, bodyIndex + '<body>'.length);
  if (!styleThroughBody.includes('</head>\n<body>')) {
    throw new Error('Could not insert glossary styles into page head');
  }
  styleThroughBody = styleThroughBody.replace('</head>\n<body>', `${glossaryStyles()}\n</head>\n<body>`);
  const nav = normalizeInternalPageNav(removeGlossaryFromHeader(navMatch[0]));
  const footer = ensureFooterGlossaryLink(template.slice(footerStart, footerEnd + '</footer>'.length));

  const page = `${beforeTitle}${glossaryMeta()}
${styleThroughBody}
<a href="#main-content" class="skip-to-main">Skip to main content</a>

${nav}
${glossaryBody()}

${footer}
${glossaryScript()}`;

  write('glossary.html', page);
}

function updateGlobalFooters() {
  let changed = 0;
  for (const file of listHtmlFiles()) {
    let html = read(file);
    const original = html;
    html = removeGlossaryFromHeader(html);
    if (html.includes('<footer')) html = ensureFooterGlossaryLink(html);
    if (html !== original) {
      write(file, html);
      changed += 1;
    }
  }
  return changed;
}

function updateRedirects() {
  const file = '_redirects';
  let redirects = read(file);
  const rule = '/glossary    /glossary.html    200\n/glossary/   /glossary.html    200';
  if (!redirects.includes('/glossary    /glossary.html    200')) {
    if (redirects.includes('/*    /404.html    404')) {
      redirects = redirects.replace('/*    /404.html    404', `${rule}\n/*    /404.html    404`);
    } else {
      redirects = `${redirects.trim()}\n${rule}\n`;
    }
    write(file, redirects);
    return true;
  }
  return false;
}

function updateSitemap() {
  const file = 'sitemap.xml';
  let xml = read(file);
  const entry = `  <url>
    <loc>${CANONICAL_URL}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
  </url>`;

  const existing = new RegExp(`\\s*<url>\\s*<loc>${CANONICAL_URL.replace(/\//g, '\\/')}<\\/loc>[\\s\\S]*?<\\/url>`, 'm');
  if (xml.includes(`<loc>${CANONICAL_URL}</loc>`)) {
    xml = xml.replace(existing, `\n${entry}`);
  } else {
    xml = xml.replace('\n</urlset>', `\n\n${entry}\n\n</urlset>`);
  }
  write(file, xml);
}

function main() {
  generateGlossaryPage();
  const footersChanged = updateGlobalFooters();
  const redirectsChanged = updateRedirects();
  updateSitemap();
  console.log(`Glossary page generated. Footer links updated on ${footersChanged} HTML files. Redirects changed: ${redirectsChanged}.`);
}

main();
