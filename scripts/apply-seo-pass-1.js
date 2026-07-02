const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP_DIRS = new Set(['.git', 'node_modules', '__MACOSX', '.netlify', 'mnt']);
const DEFAULT_OG_IMAGE = 'https://darynfillis.com/og-home.jpg';

const DESCRIPTION_OVERRIDES = new Map([
  ['cal-condo-buyer.html', 'Free California condo buyer checklist: HOA red flags, reserve studies, warrantability, and loan options before writing an offer.'],
  ['cal-condo-seller.html', 'Free California condo seller checklist covering 2026 rule changes, SB 326, HOA documents, warrantability, and buyer loan options.'],
  ['faq.html', 'Clear answers to common LA mortgage questions: RSUs, relocation, jumbo loans, PMI, pre-approval, DSCR, refinancing, and offer strategy.'],
  ['rsu-strategy.html', 'How LA buyers can use RSU income to qualify for a mortgage, including vested shares, continuance rules, assets, and stock-based planning.'],
  ['relocation-strategy.html', 'Mortgage strategy for relocating to Los Angeles: offer-letter income, buying before selling, relo packages, and cross-state closing timelines.'],
  ['cal-condo.html', 'California condo financing guide for sellers, buyers, and agents: warrantability, 2026 rule changes, HOA red flags, and loan options.'],
  ['journey.html', 'Interactive homebuying journey map for LA buyers, homeowners, investors, and refinancers, built by Certified Mortgage Advisor Daryn Fillis.'],
  ['field-notes/the-ridge-line-june-2026.html', 'June 2026 California housing update: record median prices, rate direction, regional trends, and the next data points buyers should watch.'],
  ['neighborhoods.html', 'Los Angeles neighborhood mortgage guides for buyers, sellers, and agents covering local pricing, appraisal risk, cash-to-close, and offer strategy.'],
  ['neighborhoods/westchester.html', 'Westchester mortgage strategy for 90045 buyers, sellers, and agents: local pricing, appraisal risk, cash-to-close, and offer strength.'],
  ['glossary.html', 'Plain-English mortgage and real estate glossary for buyers, homeowners, investors, sellers, and agents covering loan, escrow, closing, and refinance terms.']
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getCanonical(html) {
  const match = html.match(/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["'])([^>]*?)>/i);
  if (!match) return '';
  const href = match[0].match(/\bhref=(["'])(.*?)\1/i);
  return href ? href[2] : '';
}

function hasMeta(html, key, name) {
  return new RegExp(`<meta\\b(?=[^>]*\\b${key}=["']${escapeRegExp(name)}["'])`, 'i').test(html);
}

function setMeta(html, key, name, content) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*\\b${key}=["']${escapeRegExp(name)}["'])(?=[^>]*\\bcontent=)([^>]*?)>`, 'i');
  if (pattern.test(html)) {
    return html.replace(pattern, tag => tag.replace(/\bcontent=(["'])(.*?)\1/i, `content=$1${content}$1`));
  }

  const tag = `<meta ${key}="${name}" content="${content}">`;
  if (key === 'property' && name.startsWith('og:')) {
    const ogAnchor = html.match(/<meta\b(?=[^>]*\bproperty=["']og:description["'])(?=[^>]*\bcontent=)[^>]*>/i);
    if (ogAnchor) return html.replace(ogAnchor[0], `${ogAnchor[0]}\n${tag}`);
  }
  if (key === 'name' && name.startsWith('twitter:')) {
    const twitterAnchor = html.match(/<meta\b(?=[^>]*\bname=["']twitter:description["'])(?=[^>]*\bcontent=)[^>]*>/i);
    if (twitterAnchor) return html.replace(twitterAnchor[0], `${twitterAnchor[0]}\n${tag}`);
  }
  return html.replace('</head>', `${tag}\n</head>`);
}

function cleanMalformedMeta(html) {
  return html.replace(/(<meta\b[^>]*>)>/g, '$1');
}

function syncPageIdentity(file, html) {
  const canonical = getCanonical(html);
  if (canonical) {
    html = setMeta(html, 'property', 'og:url', canonical);

    const isArticle = file.startsWith('field-notes/') && file !== 'field-notes.html';
    html = setMeta(html, 'property', 'og:type', isArticle ? 'article' : 'website');
  }

  if (!hasMeta(html, 'property', 'og:image')) {
    html = setMeta(html, 'property', 'og:image', DEFAULT_OG_IMAGE);
  }
  if (!hasMeta(html, 'name', 'twitter:image')) {
    html = setMeta(html, 'name', 'twitter:image', DEFAULT_OG_IMAGE);
  }

  return html;
}

function applyDescriptionOverride(file, html) {
  const description = DESCRIPTION_OVERRIDES.get(file);
  if (!description) return html;

  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'name', 'twitter:description', description);
  return html;
}

function ensureFooterLink(html) {
  return html.replace(/(<footer[\s\S]*?<\/footer>)/, footer => {
    if (footer.includes('href="/buying-vs-renting"')) return footer;
    const link = '\n      <a href="/buying-vs-renting">Buying vs Renting Calculator</a>';
    if (footer.includes('<a href="/calculator">Mortgage Calculator</a>')) {
      return footer.replace('      <a href="/calculator">Mortgage Calculator</a>', `      <a href="/calculator">Mortgage Calculator</a>${link}`);
    }
    if (footer.includes('<a href="/neighborhoods">Neighborhood Guides</a>')) {
      return footer.replace('      <a href="/neighborhoods">Neighborhood Guides</a>', `      <a href="/neighborhoods">Neighborhood Guides</a>${link}`);
    }
    return footer;
  });
}

function getSchemaType(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return '';
  return Array.isArray(data['@type']) ? data['@type'].join('|') : data['@type'] || '';
}

function dedupeBreadcrumbSchema(html) {
  const seen = new Set();
  return html.replace(/<script\s+type=["']application\/ld\+json["']>\s*([\s\S]*?)\s*<\/script>/gi, (match, body) => {
    try {
      const data = JSON.parse(body.trim());
      if (getSchemaType(data) !== 'BreadcrumbList') return match;
      const signature = JSON.stringify(data.itemListElement || []);
      if (seen.has(signature)) return '';
      seen.add(signature);
      return match;
    } catch {
      return match;
    }
  });
}

function updateHtmlFiles() {
  let changed = 0;
  for (const file of listHtmlFiles()) {
    let html = fs.readFileSync(filePath(file), 'utf8');
    const original = html;

    html = cleanMalformedMeta(html);
    html = syncPageIdentity(file, html);
    html = applyDescriptionOverride(file, html);
    html = ensureFooterLink(html);
    html = dedupeBreadcrumbSchema(html);

    if (html !== original) {
      fs.writeFileSync(filePath(file), html);
      changed += 1;
    }
  }
  return changed;
}

function removeSitemapUrl(xml, url) {
  const escaped = escapeRegExp(url);
  return xml.replace(new RegExp(`\\s*<url>\\s*<loc>${escaped}<\\/loc>[\\s\\S]*?<\\/url>`, 'g'), '');
}

function updateSitemap() {
  const file = 'sitemap.xml';
  let xml = fs.readFileSync(filePath(file), 'utf8');
  const original = xml;

  xml = removeSitemapUrl(xml, 'https://darynfillis.com/journey-v2');

  if (xml !== original) {
    fs.writeFileSync(filePath(file), xml);
    return true;
  }
  return false;
}

const changedHtml = updateHtmlFiles();
const changedSitemap = updateSitemap();
console.log(`SEO pass 1 applied. HTML files changed: ${changedHtml}. Sitemap changed: ${changedSitemap}.`);
