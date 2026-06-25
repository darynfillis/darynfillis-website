const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set(['.git', 'node_modules', '__MACOSX', '.netlify']);

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

function removeNeighborhoodFromHeader(html) {
  return html.replace(/(<div[^>]*class=["'][^"']*\bnav-links\b[^"']*["'][^>]*>)([\s\S]*?)(<\/div>)/g, (match, open, inner, close) => {
    const cleanedInner = inner
      .replace(/\s*<a\s+href=["']\/neighborhoods["'][^>]*>\s*Neighborhoods\s*<\/a>/g, '')
      .replace(/\n{3,}/g, '\n\n');
    return open + cleanedInner + close;
  });
}

function ensureFooterNeighborhoodLink(html) {
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

function removeHomepageNeighborhoodSection() {
  const file = 'index.html';
  if (!fs.existsSync(file)) return false;
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  html = html.replace(/\n<!-- NEIGHBORHOOD GUIDES -->\n<section[\s\S]*?id="neighborhoods"[\s\S]*?<\/section>\n(?=\s*<!--)/, '\n');

  if (html !== original) {
    fs.writeFileSync(file, html);
    return true;
  }
  return false;
}

function updateNeighborhoodHubLanguage() {
  const file = 'neighborhoods.html';
  if (!fs.existsSync(file)) return false;

  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  const replacements = new Map([
    ['Start with the market where the client is actually making decisions.', 'Start with the neighborhood where you are planning your next move.'],
    ['Each guide is built around practical financing pressure points, not generic neighborhood descriptions. That means loan size, property type, cash to close, HOA or insurance concerns, appraisal risk, and how the offer may be viewed by the listing side.', 'Each guide is built around practical financing pressure points, not generic neighborhood descriptions. That means loan size, property type, cash to close, HOA or insurance concerns, appraisal risk, and how your offer may be viewed by the seller and listing agent.'],
    ['For agents.', 'When you make an offer.'],
    ["The point is to understand how the buyer's financing will read to the listing side and where the file needs to be strengthened before it becomes a negotiation problem.", 'The point is to understand how your financing will look to the seller and listing agent, and where your file may need to be strengthened before it becomes a negotiation problem.']
  ]);

  for (const [from, to] of replacements) {
    html = html.replaceAll(from, to);
  }

  if (html.includes(' client ') || html.includes(' client.')) {
    html = html.replaceAll(' client ', ' buyer ');
    html = html.replaceAll(' client.', ' buyer.');
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    return true;
  }
  return false;
}

function removeAgentSpecificWestchesterLanguage() {
  const files = listHtmlFiles();
  let changed = 0;

  for (const file of files) {
    let html = fs.readFileSync(file, 'utf8');
    const original = html;

    html = html
      .replace(/Local 90045 financing strategy with The [^.]+ highlighted as the agent of choice\./g, 'Local 90045 financing strategy for buyers navigating price, payment, cash to close, appraisal risk, and offer strength.')
      .replace(/Westchester, Los Angeles mortgage strategy with The [^.]+ highlighted as the local agent of choice\./g, 'Westchester, Los Angeles mortgage strategy for buyers navigating price, payment, cash to close, appraisal risk, and offer strength.')
      .replace(/Includes financing considerations for 90045 and why The [^.]+ is a strong local real estate partner\./g, 'Includes financing considerations for 90045, offer strategy, cash-to-close planning, appraisal risk, and local market dynamics.')
      .replace(/<a href="https:\/\/[^"\s]+" class="btn btn-outline-white" target="_blank" rel="noopener">Visit [^<]+<\/a>/g, '')
      .replace(/<a href="https:\/\/[^"\s]+" target="_blank" rel="noopener" style="color:var\(--blue\);font-weight:700;text-decoration:none;border-bottom:1px solid var\(--blue\)">The [^<]+<\/a> as the agent of choice in this market/g, 'the importance of choosing a strong local agent in this market');

    if (html !== original) {
      fs.writeFileSync(file, html);
      changed += 1;
    }
  }

  const westchesterFile = 'neighborhoods/westchester.html';
  if (!fs.existsSync(westchesterFile)) return changed;

  let html = fs.readFileSync(westchesterFile, 'utf8');
  const original = html;

  const neutralSection = `<section style="background:var(--surface);border-top:1px solid var(--rule);padding:clamp(64px,9vw,100px) clamp(20px,4vw,48px)">
  <div class="max-w" style="max-width:820px">
    <div style="font-size:0.66rem;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:var(--blue-dark);margin-bottom:14px">Choosing Your Local Team</div>
    <h2 style="font-weight:800;font-size:clamp(1.8rem,3.5vw,2.6rem);color:var(--navy);letter-spacing:-0.03em;line-height:1.1;margin:0 0 24px 0">Westchester rewards a coordinated strategy between buyer, agent, and lender.</h2>
    <p style="font-weight:400;font-size:1.05rem;color:var(--body);line-height:1.85;margin:0 0 24px 0">The right real estate partner matters in Westchester, but the goal is not to limit you to one person. The goal is to make sure your agent understands the local market, your financing strategy, and how to position your offer or listing with clarity.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">For buyers.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">A strong local agent helps you understand pricing context, property condition, seller motivation, timing, and the tradeoffs between being competitive and protecting your long-term plan. The lending strategy should support that offer, not sit off to the side.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">For sellers.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">On the listing side, the strongest offer is not always the one with the highest price. Buyer financing, appraisal exposure, contingency timing, reserve strength, and lender communication can all change the risk profile of an offer.</p>

    <h3 style="font-weight:800;font-size:0.9rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--navy);margin:32px 0 10px 0">Why coordination matters.</h3>
    <p style="font-weight:400;font-size:1rem;color:var(--body);line-height:1.85;margin:0 0 18px 0">When the real estate strategy and lending strategy are aligned early, buyers write cleaner offers and sellers get better information. In Westchester, that coordination can be the difference between a smooth close and a stressful one.</p>
  </div>
</section>`;

  html = html.replace(/<section style="background:var\(--surface\);border-top:1px solid var\(--rule\);padding:clamp\(64px,9vw,100px\) clamp\(20px,4vw,48px\)">\s*<div class="max-w" style="max-width:820px">\s*<div style="[^"]*">Agent Of Choice<\/div>[\s\S]*?<\/section>/, neutralSection);

  if (html !== original) {
    fs.writeFileSync(westchesterFile, html);
    changed += 1;
  }

  return changed;
}

let changedFiles = 0;
for (const file of listHtmlFiles()) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  if (html.includes('nav-links')) {
    html = removeNeighborhoodFromHeader(html);
  }
  if (html.includes('<footer')) {
    html = ensureFooterNeighborhoodLink(html);
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    changedFiles += 1;
  }
}

const removedHomeSection = removeHomepageNeighborhoodSection();
const updatedHubCopy = updateNeighborhoodHubLanguage();
const removedAgentSpecificCopy = removeAgentSpecificWestchesterLanguage();

console.log(`Finalized neighborhood SEO strategy. Header links removed or footer links confirmed on ${changedFiles} HTML files. Homepage section removed: ${removedHomeSection}. Hub copy updated: ${updatedHubCopy}. Agent-specific Westchester copy removed from ${removedAgentSpecificCopy} HTML files.`);
