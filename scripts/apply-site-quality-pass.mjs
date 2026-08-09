import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excludedDirectories = new Set(['.git', 'decks', 'node_modules', 'syg', 'time-log']);

function listPublicHtml(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || excludedDirectories.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listPublicHtml(absolute);
    return entry.isFile() && entry.name.endsWith('.html') ? [absolute] : [];
  });
}

function ensureHeadAsset(html, markup) {
  if (html.includes(markup)) return html;
  return html.replace('</head>', `${markup}\n</head>`);
}

function ensureSkipLink(html) {
  if (!/<main\b/i.test(html)) return html;
  if (!/id=["']main-content["']/i.test(html)) {
    html = html.replace(/<main(\s*>)/i, '<main id="main-content"$1');
    html = html.replace(/<main\s+([^>]*?)>/i, (tag, attrs) => {
      if (/id=/i.test(attrs)) return tag;
      return `<main id="main-content" ${attrs}>`;
    });
  }
  const insertedSkipLink = '<a class="skip-link" href="#main-content">Skip to main content</a>';
  const existingSkipLink = /<a\b(?=[^>]*href=["']#main-content["'])[^>]*class=["'][^"']*skip-to-main[^"']*["'][^>]*>/i;
  if (existingSkipLink.test(html)) {
    return html.replace(`${insertedSkipLink}\n`, '').replace(insertedSkipLink, '');
  }
  if (/<a\b(?=[^>]*href=["']#main-content["'])[^>]*>\s*Skip to main content\s*<\/a>/i.test(html)) return html;
  return html.replace(/<body([^>]*)>/i, '<body$1>\n<a class="skip-link" href="#main-content">Skip to main content</a>');
}

function ensureMainLandmark(html, relative) {
  const pagesNeedingMain = new Set(['buying-vs-renting.html', 'journey.html', 'rate-watch.html']);
  if (!pagesNeedingMain.has(relative) || /<main\b/i.test(html)) return html;
  html = html.replace('</nav>', '</nav>\n<main id="main-content">');
  return html.replace('<footer', '</main>\n<footer');
}

function ensureNoopener(html) {
  return html.replace(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi, (tag) => {
    const rel = tag.match(/\brel=(["'])(.*?)\1/i);
    if (!rel) return tag.replace(/>$/, ' rel="noopener noreferrer">');
    const values = new Set(rel[2].split(/\s+/).filter(Boolean));
    values.add('noopener');
    values.add('noreferrer');
    return tag.replace(rel[0], `rel=${rel[1]}${[...values].join(' ')}${rel[1]}`);
  });
}

function ensureNavState(html) {
  return html.replace(/<button\b([^>]*\bid=["']navToggle["'][^>]*)>/gi, (tag, attrs) => {
    let updated = attrs;
    if (!/\baria-controls=/i.test(updated)) updated += ' aria-controls="navLinks"';
    if (!/\baria-expanded=/i.test(updated)) updated += ' aria-expanded="false"';
    return `<button${updated}>`;
  });
}

function applyLabelMap(html, mapping) {
  for (const [id, label] of Object.entries(mapping)) {
    for (const openTag of ['<label>', '<label class="input-label">']) {
      const original = `${openTag}${label}</label>`;
      const associated = openTag.replace('>', ` for="${id}">`) + `${label}</label>`;
      html = html.replaceAll(original, associated);
    }
  }
  return html;
}

const sellLabels = {
  lp: 'Target list price ($)', cr: 'Commission (%)', fe: 'Escrow / title / fees ($)',
  dp: 'Down payment (%)', occ: 'Occupancy', av: 'Assumed appraised value ($, optional)',
  txr: 'Property tax rate (%/yr)', insr: 'Homeowners insurance (%/yr)',
  smi: 'Standard-list mortgage insurance / mo ($)', bmi: 'Full House mortgage insurance / mo ($)',
  bhoa: 'Buyer HOA / mo ($)', mb: 'Current loan balance ($)', mr: 'Current rate (%)',
  mt: 'Remaining term (yrs)', spp: 'Original purchase price ($)', spd: 'Purchase date',
  txcap: 'Tax assessment cap (%/yr)', inscap: 'Insurance inflation (%/yr)',
  stax: 'Actual seller property tax / mo ($, optional)', sins: 'Actual seller insurance / mo ($, optional)',
  cn: 'Seller concession ($)', br: 'Full House rate (%)', sr: 'Standard List rate (%)',
  dc: 'Price cut if it sits ($)', shoa: 'Seller&rsquo;s HOA / mo ($)', dm: 'Months on market'
};

const buyingLabels = {
  liquidAssets: 'Your liquid assets today <span class="input-label-hint">savings + investments available</span>',
  homePrice: "Home price you're considering",
  downPct: 'Down payment <span class="input-label-hint">%</span>',
  rate: 'Interest rate', taxRate: 'Property tax', hoa: 'HOA (monthly)',
  rent: 'Current/comparable rent (monthly)', appreciation: 'Home appreciation',
  rentInflation: 'Rent inflation',
  investmentReturn: 'Investment return <span class="input-label-hint">S&amp;P 500 historical</span>',
  maintenance: 'Maintenance <span class="input-label-hint">% of value/yr</span>',
  years: 'Years to hold', taxBracket: 'Marginal tax rate'
};

const closingCostLabels = {
  origination: 'Origination fee', underwriting: 'Underwriting fee', processing: 'Processing fee',
  appraisal: 'Appraisal', credit: 'Credit report', otherLender: 'Other (lender)',
  lenderTitle: "Lender's title insurance", ownerTitle: "Owner's title insurance", escrowFee: 'Escrow fee',
  settlement: 'Settlement fee', otherTitle: 'Other (title &amp; escrow)', recording: 'Recording fees',
  otherGov: 'Other (government)', hoaQuestionnaire: 'HOA Questionnaire', otherMisc: 'Other'
};

function fixCalculatorClosingLabels(html) {
  for (const [key, labelText] of Object.entries(closingCostLabels)) {
    const id = `closing-${key}`;
    const rowPattern = new RegExp(`(<div class="closing-item-row">\\s*<label)(?![^>]*\\bfor=)([^>]*>)([\\s\\S]*?<\\/label>[\\s\\S]*?<input)(?![^>]*\\bid=)([^>]*\\bdata-key=["']${key}["'])`, 'g');
    html = html.replace(rowPattern, `$1 for="${id}"$2$3 id="${id}"$4`);
  }
  return html;
}

let changed = 0;
for (const file of listPublicHtml()) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = ensureHeadAsset(html, '<link rel="stylesheet" href="/site-accessibility.css">');
  html = ensureHeadAsset(html, '<script src="/site-analytics.js" defer></script>');
  const relative = path.relative(root, file);
  html = ensureMainLandmark(html, relative);
  html = ensureSkipLink(html);
  html = ensureNavState(html);
  html = ensureNoopener(html);
  html = html.replace(/<meta\s+property=(["'])twitter:/gi, '<meta name=$1twitter:');

  if (relative === 'sell-with-intention.html') html = applyLabelMap(html, sellLabels);
  if (relative === 'buying-vs-renting.html') html = applyLabelMap(html, buyingLabels);
  if (relative === 'calculator.html') html = fixCalculatorClosingLabels(html);

  if (html !== before) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`Applied public site quality pass to ${changed} HTML file${changed === 1 ? '' : 's'}.`);
