const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules', '__MACOSX', '.netlify', 'mnt']);

const SOCIAL_PROFILES = [
  'https://www.instagram.com/mymortgageadvisor',
  'https://www.facebook.com/darynfillis',
  'https://www.linkedin.com/in/darynfillis',
  'https://www.youtube.com/@mymortgageadvisors',
  'https://www.nmlsconsumeraccess.org/TuringTestPage.aspx?ReturnUrl=/EntityDetails.aspx/INDIVIDUAL/1988371'
];

const KNOWS_ABOUT = [
  'Los Angeles mortgage advisor',
  'Competitive offer strategy',
  'RSU mortgage qualification',
  'Self-employed mortgages',
  'California condo financing',
  'Mortgage under management',
  'No-cost refinance strategy'
];

const ANSWER_BLOCKS = new Map([
  ['competitive-offer-strategy.html', {
    eyebrow: 'Short Answer',
    heading: 'A financed buyer can beat cash when the financing removes seller risk.',
    body: 'The strategy is not a louder pre-approval letter. It is full underwriting before the offer, proof the file can close, contingency decisions that match the actual risk, and a lender who can communicate that certainty to the listing side.'
  }],
  ['pmi-strategy.html', {
    eyebrow: 'Short Answer',
    heading: 'PMI is not automatically bad. Waiting can be more expensive.',
    body: 'In Los Angeles, the real comparison is not PMI versus no PMI. It is the cost of PMI against appreciation missed, rent paid while waiting, and the opportunity cost of tying up more cash than the plan requires.'
  }],
  ['no-cost-refinance.html', {
    eyebrow: 'Short Answer',
    heading: 'A no-cost refinance only works when the break-even math works.',
    body: 'The point is not to refinance every time rates move. The point is to compare monthly savings, lender credits, loan term, and how long you expect to keep the mortgage, then move only when the numbers improve your position.'
  }],
  ['mortgage-under-management.html', {
    eyebrow: 'Short Answer',
    heading: 'Mortgage under management means the loan is watched after closing.',
    body: 'The work does not end when you get keys. Your equity, PMI removal window, refinance math, recast options, and next-purchase strategy should be reviewed as the market and your life change.'
  }],
  ['interest-rate-vs-cost.html', {
    eyebrow: 'Short Answer',
    heading: 'The lowest rate is not always the lowest-cost mortgage.',
    body: 'A lower rate can hide higher points, fees, break-even risk, or cash tradeoffs. The better question is total cost over the period you expect to hold the loan, not just the monthly payment on day one.'
  }],
  ['rsu-strategy.html', {
    eyebrow: 'Short Answer',
    heading: 'RSUs can help you qualify when they are documented correctly.',
    body: 'Lenders need to see vesting history, continuance, stable valuation, and whether the RSUs are being used as income, assets, or both. The strategy is timing the file around the way your compensation actually works.'
  }],
  ['relocation-strategy.html', {
    eyebrow: 'Short Answer',
    heading: 'Relocation loans work when income, timing, and benefits are aligned early.',
    body: 'Offer-letter income, sign-on compensation, buy-before-you-sell structures, and corporate relocation credits can all help, but only if the lender reviews the package before the moving timeline becomes urgent.'
  }],
  ['self-employed.html', {
    eyebrow: 'Short Answer',
    heading: 'Self-employed buyers usually need a different documentation strategy.',
    body: 'The question is not whether your business income is real. The question is which loan path tells that story cleanly: tax returns, bank statements, P&L, DSCR, asset depletion, or a blended structure.'
  }],
  ['first-time-buyers.html', {
    eyebrow: 'Short Answer',
    heading: 'First-time buyers need strategy before they need houses.',
    body: 'The safest path is to know your real number, compare down payment options, understand PMI, and build an offer plan before you fall in love with a property that moves faster than your financing.'
  }],
  ['move-up-method.html', {
    eyebrow: 'Short Answer',
    heading: 'Moving up is a sequencing problem before it is a loan problem.',
    body: 'The right plan depends on whether you buy first, sell first, bridge, recast, rent the old home, or use equity differently. The goal is to protect leverage without carrying unnecessary payment risk.'
  }],
  ['buying-vs-renting.html', {
    eyebrow: 'Short Answer',
    heading: 'Buying versus renting is a time-horizon and cash-flow decision.',
    body: 'The right answer depends on how long you will stay, what rent does next, appreciation assumptions, tax treatment, cash invested elsewhere, and the emotional value of control. The calculator should start the conversation, not end it.'
  }],
  ['faq.html', {
    eyebrow: 'Fast Context',
    heading: 'Most mortgage questions have a simple answer and a strategic answer.',
    body: 'The simple answer gets you oriented. The strategic answer depends on your credit, income, cash, timeline, property type, and whether you are trying to buy, refinance, move up, invest, or protect a home you already own.'
  }]
]);

const TRUST_FILES = new Set([
  ...ANSWER_BLOCKS.keys(),
  'field-notes/why-buyers-lose-homes.html',
  'field-notes/no-cost-refinance.html',
  'field-notes/81-percent-regret.html',
  'field-notes/condo-financing-challenges.html',
  'field-notes/moving-with-a-low-mortgage-rate.html',
  'field-notes/california-home-insurance-affordability.html',
  'field-notes/when-an-arm-makes-sense.html',
  'field-notes/the-ridge-line-june-2026.html',
  'field-notes/new-condo-rules-2026.html',
  'calculator.html',
  'glossary.html',
  'neighborhoods.html',
  'neighborhoods/santa-monica.html',
  'neighborhoods/manhattan-beach.html',
  'neighborhoods/marina-del-rey.html',
  'neighborhoods/westchester.html'
]);

function filePath(file) {
  return path.join(ROOT, file);
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
  return results.sort();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function answerBlock(file, config) {
  return `
<!-- AEO SHORT ANSWER: ${file} -->
<section data-aeo-answer="${file}" style="background:var(--surface);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule);padding:clamp(32px,5vw,56px) clamp(20px,4vw,48px)">
  <div class="max-w" style="display:grid;grid-template-columns:minmax(0,0.85fr) minmax(0,2fr);gap:clamp(20px,4vw,44px);align-items:start">
    <div style="font-size:0.64rem;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:var(--blue-dark)">${escapeHtml(config.eyebrow)}</div>
    <div>
      <h2 style="font-weight:800;font-size:clamp(1.35rem,2.6vw,2rem);line-height:1.16;letter-spacing:-0.02em;color:var(--navy);margin:0 0 12px 0">${escapeHtml(config.heading)}</h2>
      <p style="font-weight:400;font-size:1rem;line-height:1.85;color:var(--body);margin:0;max-width:820px">${escapeHtml(config.body)}</p>
    </div>
  </div>
</section>`;
}

function trustModule() {
  return `
<!-- ADVISOR TRUST MODULE -->
<section data-brand-trust="daryn-advisor" style="background:var(--white);border-top:1px solid var(--rule);padding:clamp(44px,7vw,72px) clamp(20px,4vw,48px)">
  <div class="max-w" style="display:grid;grid-template-columns:minmax(0,1.4fr) minmax(260px,0.8fr);gap:clamp(24px,5vw,56px);align-items:center">
    <div>
      <div style="font-size:0.64rem;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:var(--blue-dark);margin-bottom:12px">Daryn Fillis · Certified Mortgage Advisor</div>
      <h2 style="font-weight:800;font-size:clamp(1.55rem,3vw,2.35rem);line-height:1.12;letter-spacing:-0.03em;color:var(--navy);margin:0 0 16px 0">Mortgage strategy with a real advisor behind it.</h2>
      <p style="font-weight:400;font-size:1rem;line-height:1.85;color:var(--body);margin:0;max-width:720px">I help Los Angeles buyers, homeowners, investors, and real estate partners structure financing around the full picture: offer strength, cash flow, equity, tax context, and what the mortgage should do for you after closing.</p>
    </div>
    <div style="border:1px solid var(--rule);background:var(--surface);border-radius:10px;padding:22px;display:grid;gap:12px">
      <div style="font-weight:800;color:var(--navy);font-size:0.95rem">Daryn Fillis</div>
      <div style="font-size:0.85rem;color:var(--body);line-height:1.65">Certified Mortgage Advisor · NMLS #1988371<br>Branch Lead · NEO Home Loans<br>Los Angeles / El Segundo · English + Spanish</div>
      <a href="/schedule" class="btn btn-navy" style="margin-top:4px;width:100%">Book a 15-minute call</a>
    </div>
  </div>
</section>`;
}

function insertAfterHero(file, html, block) {
  if (html.includes(`data-aeo-answer="${file}"`)) return html;
  const mainIndex = html.indexOf('<main id="main-content">');
  const searchStart = mainIndex === -1 ? html.indexOf('<body') : mainIndex;
  if (searchStart === -1) return html;
  let firstSection = html.indexOf('<section', searchStart);
  if (firstSection === -1) return html;

  if (mainIndex === -1) {
    const secondSection = html.indexOf('<section', firstSection + 1);
    if (secondSection !== -1) firstSection = secondSection;
  }

  return html.slice(0, firstSection) + block + '\n' + html.slice(firstSection);
}

function insertTrustModule(file, html) {
  if (!TRUST_FILES.has(file) || html.includes('data-brand-trust="daryn-advisor"')) return html;
  const module = trustModule();
  if (html.includes('\n</main>\n\n<footer>')) {
    return html.replace('\n</main>\n\n<footer>', `${module}\n</main>\n\n<footer>`);
  }
  if (html.includes('\n<footer>')) {
    return html.replace('\n<footer>', `\n${module}\n\n<footer>`);
  }
  return html;
}

function improveHomepageHero(html) {
  const current = "The financing was wrong before you ever made an offer. One conversation and you'll know exactly where you stand.";
  const improved = "The financing was wrong before you ever made an offer. One conversation and you'll know exactly where you stand. I help Los Angeles buyers, homeowners, investors, and self-employed borrowers structure mortgages that win today and still make sense years from now.";
  if (html.includes(improved)) return html;
  return html.replace(current, improved);
}

function mutateDarynPersonSchema(data) {
  if (!data || typeof data !== 'object') return false;
  let changed = false;

  if (Array.isArray(data)) {
    for (const item of data) changed = mutateDarynPersonSchema(item) || changed;
    return changed;
  }

  const type = data['@type'];
  const isPerson = type === 'Person' || (Array.isArray(type) && type.includes('Person'));
  const isPrimaryDaryn = isPerson && data.name === 'Daryn Fillis' && (data.jobTitle || data['@id'] === 'https://darynfillis.com/#daryn');
  if (isPrimaryDaryn) {
    const sameAs = new Set(Array.isArray(data.sameAs) ? data.sameAs : []);
    for (const url of SOCIAL_PROFILES) sameAs.add(url);
    data.sameAs = [...sameAs];
    data.knowsLanguage = ['English', 'Spanish'];
    const knowsAbout = new Set(Array.isArray(data.knowsAbout) ? data.knowsAbout : []);
    for (const item of KNOWS_ABOUT) knowsAbout.add(item);
    data.knowsAbout = [...knowsAbout];
    changed = true;
  }

  if (Array.isArray(data['@graph'])) changed = mutateDarynPersonSchema(data['@graph']) || changed;
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object') changed = mutateDarynPersonSchema(value) || changed;
  }
  return changed;
}

function updatePersonSchema(html) {
  return html.replace(/<script\s+type=["']application\/ld\+json["']>\s*([\s\S]*?)\s*<\/script>/gi, (match, body) => {
    try {
      const data = JSON.parse(body.trim());
      if (!mutateDarynPersonSchema(data)) return match;
      return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
    } catch {
      return match;
    }
  });
}

let changed = 0;
for (const file of listHtmlFiles()) {
  let html = fs.readFileSync(filePath(file), 'utf8');
  const original = html;

  if (file === 'index.html') html = improveHomepageHero(html);
  if (ANSWER_BLOCKS.has(file)) html = insertAfterHero(file, html, answerBlock(file, ANSWER_BLOCKS.get(file)));
  html = insertTrustModule(file, html);
  html = updatePersonSchema(html);

  if (html !== original) {
    fs.writeFileSync(filePath(file), html);
    changed += 1;
  }
}

console.log(`AEO and brand pass 2 applied. HTML files changed: ${changed}.`);
