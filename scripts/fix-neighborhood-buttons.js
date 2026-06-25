const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set(['.git', 'node_modules', '__MACOSX', '.netlify']);

function rewritePage(file, block) {
  let html = fs.readFileSync(file, 'utf8');
  const startIndex = html.indexOf('<!-- BREADCRUMB -->');
  const footerIndex = html.indexOf('\n<footer>', startIndex);
  if (startIndex === -1 || footerIndex === -1) {
    throw new Error(`Could not find page body markers in ${file}`);
  }
  html = html.slice(0, startIndex) + block.trim() + '\n\n' + html.slice(footerIndex);
  html = html.replaceAll('class="btn btn-primary"', 'class="btn btn-blue btn-wobble"');
  fs.writeFileSync(file, html);
}

function listHtmlFiles(dir = '.') {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
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

function addNeighborhoodToNavBlock(html) {
  return html.replace(/(<div[^>]*class=["'][^"']*\bnav-links\b[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/g, (match, open, inner, close) => {
    if (inner.includes('href="/neighborhoods"') || inner.includes("href='/neighborhoods'")) return match;

    const link = '\n    <a href="/neighborhoods">Neighborhoods</a>';
    if (inner.includes('href="/journey"')) {
      inner = inner.replace(/(\s*<a href="\/journey"[^>]*>[\s\S]*?<\/a>)/, `$1${link}`);
    } else if (inner.includes('href="/field-notes"')) {
      inner = inner.replace(/(\s*<a href="\/field-notes"[^>]*>[\s\S]*?<\/a>)/, `$1${link}`);
    } else {
      inner = inner.replace(/\s*$/, `${link}\n  `);
    }

    return open + inner + close;
  });
}

function addNeighborhoodToFooter(html) {
  return html.replace(/(<footer[\s\S]*?<\/footer>)/, footerMatch => {
    if (footerMatch.includes('href="/neighborhoods"') || footerMatch.includes("href='/neighborhoods'")) return footerMatch;

    let footer = footerMatch;
    const link = '\n      <a href="/neighborhoods">Neighborhood Guides</a>';
    if (footer.includes('<a href="/journey">The Journey</a>')) {
      footer = footer.replace('      <a href="/journey">The Journey</a>', `      <a href="/journey">The Journey</a>${link}`);
    } else if (footer.includes('<a href="/field-notes">Field Notes</a>')) {
      footer = footer.replace('      <a href="/field-notes">Field Notes</a>', `      <a href="/field-notes">Field Notes</a>${link}`);
    }
    return footer;
  });
}

function updateGlobalNavigation() {
  const files = listHtmlFiles();
  let changed = 0;

  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const original = html;

    if (html.includes('nav-links')) {
      html = addNeighborhoodToNavBlock(html);
    }
    if (html.includes('<footer')) {
      html = addNeighborhoodToFooter(html);
    }

    if (html !== original) {
      fs.writeFileSync(file, html);
      changed += 1;
    }
  }

  return changed;
}

const guideCards = `
<div class="neo-tools" style="margin-top:32px">
  <a href="/neighborhoods/santa-monica" class="neo-tool" style="text-decoration:none;color:inherit;display:block">
    <span class="neo-tool-badge">90401-90405</span>
    <div class="neo-tool-title">Santa Monica</div>
    <p class="neo-tool-desc">Zip-code differences, condo rules, jumbo planning, and the financing realities behind the Westside premium.</p>
    <span class="neo-tool-link">Read guide</span>
  </a>
  <a href="/neighborhoods/manhattan-beach" class="neo-tool" style="text-decoration:none;color:inherit;display:block">
    <span class="neo-tool-badge">90266</span>
    <div class="neo-tool-title">Manhattan Beach</div>
    <p class="neo-tool-desc">Sand, Tree, Hill, and East Manhattan Beach each need a different offer strategy and jumbo financing plan.</p>
    <span class="neo-tool-link">Read guide</span>
  </a>
  <a href="/neighborhoods/marina-del-rey" class="neo-tool" style="text-decoration:none;color:inherit;display:block">
    <span class="neo-tool-badge">90292</span>
    <div class="neo-tool-title">Marina del Rey</div>
    <p class="neo-tool-desc">Condo building reviews, HOA dues, warrantability, marina-front complexity, and loan strategy that keeps deals alive.</p>
    <span class="neo-tool-link">Read guide</span>
  </a>
  <a href="/neighborhoods/westchester" class="neo-tool" style="text-decoration:none;color:inherit;display:block">
    <span class="neo-tool-badge">90045</span>
    <div class="neo-tool-title">Westchester</div>
    <p class="neo-tool-desc">Local 90045 financing strategy with The Stephanie Younger Group at Compass highlighted as the agent of choice.</p>
    <span class="neo-tool-link">Read guide</span>
  </a>
</div>`;

const neighborhoodsBlock = `
<!-- BREADCRUMB -->
<nav class="breadcrumb-bar" aria-label="Breadcrumb">
  <div class="breadcrumb-inner">
    <a href="/" class="breadcrumb-item">Home</a><span class="breadcrumb-sep">›</span><span class="breadcrumb-item current" aria-current="page">Neighborhoods</span>
  </div>
</nav>

<main id="main-content">
<!-- HERO -->
<section style="background:var(--navy);padding:clamp(110px,14vw,150px) clamp(20px,4vw,48px) clamp(56px,7vw,88px);position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 100% 30%,rgba(91,203,245,0.09) 0%,transparent 60%);pointer-events:none"></div>
  <div class="max-w" style="max-width:840px;position:relative;z-index:1">
    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:24px;padding:6px 14px;border-radius:20px;background:rgba(91,203,245,0.12);border:1px solid rgba(91,203,245,0.25)">
      <span style="width:6px;height:6px;border-radius:50%;background:var(--blue);box-shadow:0 0 8px var(--blue)"></span>
      <span style="font-size:0.66rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:var(--blue)">Neighborhood Guides · Los Angeles</span>
    </div>
    <h1 style="font-weight:800;font-size:clamp(2.2rem,5.5vw,4rem);color:var(--white);letter-spacing:-0.035em;line-height:1.02;margin-bottom:24px">Los Angeles neighborhood mortgage guides. <em style="color:var(--blue);font-style:normal">Local strategy matters.</em></h1>
    <p style="font-weight:400;font-size:clamp(1.05rem,1.5vw,1.2rem);color:rgba(255,255,255,0.7);line-height:1.7;max-width:660px;margin-bottom:18px;font-style:italic">The right financing plan changes by zip code, property type, HOA, price tier, appraisal risk, and offer pressure.</p>
    <p style="font-weight:200;font-size:clamp(1rem,1.4vw,1.1rem);color:rgba(255,255,255,0.6);line-height:1.85;max-width:640px;margin-bottom:32px">Use these guides to understand what actually matters before writing an offer or reviewing one. The goal is to make the mortgage strategy fit the neighborhood, not force every buyer into the same generic approval.</p>
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center">
      <a href="/schedule" class="btn btn-blue btn-wobble">Talk it through</a>
      <span style="font-weight:200;font-size:0.82rem;color:rgba(255,255,255,0.5)">Free 15-minute call</span>
    </div>
    <p style="font-weight:200;font-size:0.78rem;color:rgba(255,255,255,0.35);margin:18px 0 0">Or call direct: <a href="tel:4243966967" style="color:var(--blue);text-decoration:none;font-weight:800">424-396-6967</a></p>
  </div>
</section>

<!-- TL;DR / BOTTOM LINE -->
<div style="background:linear-gradient(135deg,rgba(245,158,11,0.06) 0%,rgba(245,158,11,0.02) 100%);border-top:1px solid rgba(245,158,11,0.2);border-bottom:1px solid rgba(245,158,11,0.2);padding:28px clamp(20px,4vw,48px)">
  <div class="max-w" style="max-width:760px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="width:6px;height:6px;border-radius:50%;background:#d97706"></div>
      <div style="font-size:0.65rem;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#92400e">Bottom Line</div>
    </div>
    <p style="font-weight:400;font-size:1rem;color:var(--navy);line-height:1.8;margin:0"><strong>Local mortgage strategy is not a cosmetic detail.</strong> A Santa Monica condo, a Manhattan Beach single-family home, a Marina del Rey waterfront property, and a Westchester house can all require different loan structure, cash planning, appraisal strategy, and offer communication.</p>
  </div>
</div>

<section style="background:var(--white);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px)">
  <div class="max-w" style="max-width:920px">
    <div style="font-size:0.66rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:var(--blue-dark);margin-bottom:14px">Browse The Guides</div>
    <h2 style="font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--navy);letter-spacing:-0.03em;line-height:1.1;margin:0 0 24px 0">Start with the market where the client is actually making decisions.</h2>
    <p style="font-weight:400;font-size:1.05rem;color:var(--body);line-height:1.85;margin:0 0 24px 0;max-width:760px">Each guide is built around practical financing pressure points, not generic neighborhood descriptions. That means loan size, property type, cash to close, HOA or insurance concerns, appraisal risk, and how the offer may be viewed by the listing side.</p>
    ${guideCards}
  </div>
</section>

<section style="background:var(--surface);border-top:1px solid var(--rule);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px)">
  <div class="max-w" style="max-width:820px">
    <div style="font-size:0.66rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:var(--blue-dark);margin-bottom:14px">Why It Matters</div>
    <h2 style="font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--navy);letter-spacing:-0.03em;line-height:1.1;margin:0 0 24px 0">The same pre-approval can perform very differently from one neighborhood to the next.</h2>
    <p style="font-weight:400;font-size:1.05rem;color:var(--body);line-height:1.85;margin:0 0 24px 0">In one market, the issue may be jumbo loan reserves and appraisal support. In another, it may be condo warrantability, HOA dues, insurance, or offer structure. A buyer should know those pressure points before the offer is written, not after the seller accepts it.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">For buyers.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">The point is to know your real payment range, cash needs, loan structure, and risk points before you fall in love with the property.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">For agents.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">The point is to understand how the buyer's financing will read to the listing side and where the file needs to be strengthened before it becomes a negotiation problem.</p>
  </div>
</section>

<section style="background:var(--navy);padding:clamp(56px,8vw,86px) clamp(20px,4vw,48px);position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 100% 50%,rgba(91,203,245,0.06) 0%,transparent 60%);pointer-events:none"></div>
  <div class="max-w" style="max-width:760px;text-align:center;position:relative;z-index:1">
    <span style="font-size:0.67rem;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:var(--blue);margin-bottom:14px;display:block">Have a specific property?</span>
    <h2 style="font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--white);letter-spacing:-0.03em;line-height:1.1;margin:0 0 18px 0">Bring the address before the offer is written.</h2>
    <p style="font-weight:200;font-size:1rem;color:rgba(255,255,255,0.58);line-height:1.85;max-width:600px;margin:0 auto 28px">I can help review loan structure, cash to close, HOA or insurance concerns, appraisal risk, and offer strategy before the deal is under pressure.</p>
    <a href="/schedule" class="btn btn-blue btn-wobble">Schedule a strategy call</a>
  </div>
</section>
</main>`;

const westchesterBlock = `
<!-- BREADCRUMB -->
<nav class="breadcrumb-bar" aria-label="Breadcrumb">
  <div class="breadcrumb-inner">
    <a href="/" class="breadcrumb-item">Home</a><span class="breadcrumb-sep">›</span><a href="/neighborhoods" class="breadcrumb-item">Neighborhoods</a><span class="breadcrumb-sep">›</span><span class="breadcrumb-item current" aria-current="page">Westchester</span>
  </div>
</nav>

<main id="main-content">
<!-- HERO -->
<section style="background:var(--navy);padding:clamp(110px,14vw,150px) clamp(20px,4vw,48px) clamp(56px,7vw,88px);position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 80% at 100% 30%,rgba(91,203,245,0.09) 0%,transparent 60%);pointer-events:none"></div>
  <div class="max-w" style="max-width:840px;position:relative;z-index:1">
    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:24px;padding:6px 14px;border-radius:20px;background:rgba(91,203,245,0.12);border:1px solid rgba(91,203,245,0.25)">
      <span style="width:6px;height:6px;border-radius:50%;background:var(--blue);box-shadow:0 0 8px var(--blue)"></span>
      <span style="font-size:0.66rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:var(--blue)">Westchester · 90045</span>
    </div>
    <h1 style="font-weight:800;font-size:clamp(2.2rem,5.5vw,4rem);color:var(--white);letter-spacing:-0.035em;line-height:1.02;margin-bottom:24px">Buying a home in Westchester. <em style="color:var(--blue);font-style:normal">The 2026 strategy.</em></h1>
    <p style="font-weight:400;font-size:clamp(1.05rem,1.5vw,1.2rem);color:rgba(255,255,255,0.7);line-height:1.7;max-width:660px;margin-bottom:18px;font-style:italic">A local, relationship-driven market where the right agent and the right lending plan both matter.</p>
    <p style="font-weight:200;font-size:clamp(1rem,1.4vw,1.1rem);color:rgba(255,255,255,0.6);line-height:1.85;max-width:640px;margin-bottom:32px">Westchester buyers need to understand cash to close, loan size, payment comfort, appraisal exposure, and offer strength before the right house appears. Sellers need to know which offers are truly solid, not just which ones look attractive on price.</p>
    <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center">
      <a href="/schedule" class="btn btn-blue btn-wobble">Talk it through</a>
      <span style="font-weight:200;font-size:0.82rem;color:rgba(255,255,255,0.5)">Free 15-minute call</span>
    </div>
    <p style="font-weight:200;font-size:0.78rem;color:rgba(255,255,255,0.35);margin:18px 0 0">Or call direct: <a href="tel:4243966967" style="color:var(--blue);text-decoration:none;font-weight:800">424-396-6967</a></p>
  </div>
</section>

<!-- TL;DR / BOTTOM LINE -->
<div style="background:linear-gradient(135deg,rgba(245,158,11,0.06) 0%,rgba(245,158,11,0.02) 100%);border-top:1px solid rgba(245,158,11,0.2);border-bottom:1px solid rgba(245,158,11,0.2);padding:28px clamp(20px,4vw,48px)">
  <div class="max-w" style="max-width:760px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="width:6px;height:6px;border-radius:50%;background:#d97706"></div>
      <div style="font-size:0.65rem;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#92400e">Bottom Line</div>
    </div>
    <p style="font-weight:400;font-size:1rem;color:var(--navy);line-height:1.8;margin:0"><strong>Westchester rewards preparation.</strong> The buyer who knows the payment, loan structure, reserve position, and appraisal strategy before writing is in a better position than the buyer who only has a generic pre-approval letter.</p>
  </div>
</div>

<section style="background:var(--white);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px)">
  <div class="max-w" style="max-width:820px">
    <div style="font-size:0.66rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:var(--blue-dark);margin-bottom:14px">What You're Buying Into</div>
    <h2 style="font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--navy);letter-spacing:-0.03em;line-height:1.1;margin:0 0 24px 0">Westchester is not a generic Westside search.</h2>
    <p style="font-weight:400;font-size:1.05rem;color:var(--body);line-height:1.85;margin:0 0 24px 0">The 90045 market is driven by local knowledge, timing, property condition, buyer confidence, and the seller's belief that the transaction can actually close. For buyers, the financing plan needs to be clear enough to support the offer. For sellers, the offer review needs to look beyond the top-line price.</p>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:28px 0 36px 0">
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">90045</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Westchester focus</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">SFR</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Single-family emphasis</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">Local</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Street-by-street context</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--rule);border-radius:10px;padding:24px">
        <div style="font-weight:800;font-size:1.7rem;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-bottom:8px">Offer</div>
        <div style="font-weight:400;font-size:0.82rem;color:var(--muted);line-height:1.5">Financing must support terms</div>
      </div>
    </div>
  </div>
</section>

<section style="background:var(--surface);border-top:1px solid var(--rule);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px)">
  <div class="max-w" style="max-width:820px">
    <div style="font-size:0.66rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:var(--blue-dark);margin-bottom:14px">Agent Of Choice</div>
    <h2 style="font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--navy);letter-spacing:-0.03em;line-height:1.1;margin:0 0 24px 0">The Stephanie Younger Group at Compass brings the local discipline Westchester requires.</h2>
    <p style="font-weight:400;font-size:1.05rem;color:var(--body);line-height:1.85;margin:0 0 24px 0">For Westchester, the agent matters. This is a market where neighborhood history, property prep, buyer qualification, seller psychology, and negotiation all show up in the final outcome. That is why I highlight <a href="https://stephanieyounger.com/" target="_blank" rel="noopener" style="color:var(--blue);font-weight:700;text-decoration:none;border-bottom:1px solid var(--blue)">The Stephanie Younger Group</a> as the agent of choice in this market.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">What Stephanie brings to buyers.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">Stephanie and her team help buyers understand the market at a local level, separate emotional interest from smart value, and prepare offers that are competitive without being reckless. That includes pricing context, property condition, seller motivation, timing, and coordination with the lender so the offer reads as credible.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">What Stephanie brings to sellers.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">On the listing side, her value is not just exposure. It is preparation, positioning, pricing discipline, buyer qualification review, negotiation, and risk management from offer through close. A strong listing process helps the seller generate demand, understand the true strength of each offer, and avoid avoidable problems after acceptance.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">Why the lender and agent pairing matters.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">When the real estate strategy and lending strategy are aligned early, buyers write cleaner offers and sellers get better information. In Westchester, that coordination can be the difference between a smooth close and a stressful one.</p>
  </div>
</section>

<section style="background:var(--white);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px)">
  <div class="max-w" style="max-width:820px">
    <div style="font-size:0.66rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:var(--blue-dark);margin-bottom:14px">Financing Realities</div>
    <h2 style="font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--navy);letter-spacing:-0.03em;line-height:1.1;margin:0 0 24px 0">A Westchester approval should answer more than, "How much can I borrow?"</h2>
    <p style="font-weight:400;font-size:1.05rem;color:var(--body);line-height:1.85;margin:0 0 24px 0">The better question is whether the financing plan supports the actual offer strategy. That means understanding payment comfort, cash to close, reserves, appraisal exposure, contingency timing, and the story the lender can tell the listing side.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">Loan size.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">Buyers should know whether they are planning around conforming, high-balance, or jumbo financing before the offer price is chosen.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">Cash to close.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">Down payment, closing costs, reserves, and possible appraisal gap comfort should be clear before the buyer competes.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">Offer strength.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">The financing needs to be easy for the listing side to understand. Clean communication, strong documentation, and a direct lender conversation can change how the offer is perceived.</p>
  </div>
</section>

<section style="background:var(--navy);padding:clamp(56px,8vw,86px) clamp(20px,4vw,48px);position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 100% 50%,rgba(91,203,245,0.06) 0%,transparent 60%);pointer-events:none"></div>
  <div class="max-w" style="max-width:760px;text-align:center;position:relative;z-index:1">
    <span style="font-size:0.67rem;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:var(--blue);margin-bottom:14px;display:block">Westchester Game Plan</span>
    <h2 style="font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--white);letter-spacing:-0.03em;line-height:1.1;margin:0 0 18px 0">Before you write, know the financing strategy behind the offer.</h2>
    <p style="font-weight:200;font-size:1rem;color:rgba(255,255,255,0.58);line-height:1.85;max-width:600px;margin:0 auto 28px">I can help map the mortgage side of the purchase so your offer strategy, cash plan, and long-term goals are aligned.</p>
    <a href="/schedule" class="btn btn-blue btn-wobble">Schedule a strategy call</a>
  </div>
</section>
</main>`;

rewritePage('neighborhoods.html', neighborhoodsBlock);
rewritePage('neighborhoods/westchester.html', westchesterBlock);
const changedMenus = updateGlobalNavigation();

console.log(`Neighborhood pages aligned to existing site formatting. Updated navigation on ${changedMenus} HTML files.`);
