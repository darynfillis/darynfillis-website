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

console.log(`Finalized neighborhood SEO strategy. Header links removed or footer links confirmed on ${changedFiles} HTML files. Homepage section removed: ${removedHomeSection}. Hub copy updated: ${updatedHubCopy}.`);
