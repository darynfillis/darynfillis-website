import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const excluded = new Set(['.git', 'decks', 'node_modules', 'syg', 'time-log']);

function listPublicHtml(directory = root) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('.') || excluded.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return listPublicHtml(absolute);
    return entry.isFile() && entry.name.endsWith('.html') ? [absolute] : [];
  });
}

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

test('public pages load the shared accessibility and analytics layers', () => {
  for (const file of listPublicHtml()) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /href=["']\/site-accessibility\.css["']/, path.relative(root, file));
    assert.match(html, /src=["']\/site-analytics\.js["']/, path.relative(root, file));
  }
});

test('public content pages expose a skip link and target', () => {
  for (const file of listPublicHtml()) {
    const html = fs.readFileSync(file, 'utf8');
    if (!/<main\b/i.test(html)) continue;
    assert.match(html, /<a\b(?=[^>]*href=["']#main-content["'])[^>]*>\s*Skip to main content\s*<\/a>/i, path.relative(root, file));
    assert.match(html, /id=["']main-content["']/, path.relative(root, file));
  }
});

test('mobile navigation exposes its controlled state', () => {
  for (const file of listPublicHtml()) {
    const html = fs.readFileSync(file, 'utf8');
    const toggle = html.match(/<button\b[^>]*id=["']navToggle["'][^>]*>/i)?.[0];
    if (!toggle) continue;
    assert.match(toggle, /aria-controls=["']navLinks["']/i, path.relative(root, file));
    assert.match(toggle, /aria-expanded=["']false["']/i, path.relative(root, file));
  }
});

test('audited calculator controls have associated labels', () => {
  const pages = ['sell-with-intention.html', 'buying-vs-renting.html', 'calculator.html'];
  for (const page of pages) {
    const html = read(page);
    const controls = [...html.matchAll(/<(input|select)\b[^>]*(?:id=["']([^"']+)["'])[^>]*>/gi)]
      .map((match) => ({ tag: match[0], id: match[2] }))
      .filter(({ tag }) => !/type=["']hidden["']/i.test(tag));
    for (const { id } of controls) {
      assert.match(html, new RegExp(`<label[^>]*for=["']${id}["']`, 'i'), `${page}: ${id}`);
    }
  }
});

test('SEO cleanup is complete', () => {
  const sitemap = read('sitemap.xml');
  for (const route of [
    '/cal-condo-buyer', '/cal-condo-seller', '/condo-check', '/decks', '/field-notes/the-ridge-line-july-2026'
  ]) {
    assert.match(sitemap, new RegExp(`<loc>https://darynfillis\\.com${route}<\\/loc>`));
  }
  assert.match(read('condo-check.html'), /<link rel="canonical" href="https:\/\/darynfillis\.com\/condo-check">/);
  assert.doesNotMatch(read('ig.html'), /property=["']twitter:/i);
  assert.doesNotMatch(read('self-employed-playbook.html'), /property=["']twitter:/i);
});

test('agent presentation library is public and connects the presentation to its resources', () => {
  const library = read('decks/index.html');
  assert.match(library, /<meta name="robots" content="index, follow">/);
  assert.match(library, /href="third-borrower\.pdf" download/);
  assert.match(library, /href="\/california-condo-buyers-checklist\.pdf" download/);
  assert.match(library, /href="\/california-condo-sellers-checklist\.pdf" download/);
  assert.match(library, /href="move-up-method\.html\?mins=0"/);
  assert.match(library, /href="move-up-method\.pdf" download/);
  assert.match(library, /href="\/move-up-method"/);
  assert.match(library, /<h3 id="borrow-smart-title">The third side\.<\/h3>/);
  assert.match(library, /href="borrow-smart-university\.html\?mins=0"/);
  assert.match(library, /href="borrow-smart-university\.pdf" download/);
  assert.match(library, /href="https:\/\/www\.borrowsmartuniversity\.com\/"/);
  assert.doesNotMatch(library, /Private page|Just for me|Note to self/);

  const presentation = read('decks/third-borrower.html');
  assert.match(presentation, /@media print/);
  assert.match(presentation, /\.frag\{visibility:visible!important/);
  assert.match(presentation, /id="pvSlide" aria-label="Current slide preview"/);
  assert.match(presentation, /id="pipSlide" aria-label="Current slide preview"/);
  assert.match(presentation, /function renderSlidePreview\(target, i, previewHtml\)/);
  assert.match(presentation, /previewHtml:slides\[cur\]\.outerHTML/);
  assert.match(presentation, /A mortgage should create options, not pressure\./);

  const moveUpPresentation = read('decks/move-up-method.html');
  const moveUpPlayer = read('decks/move-up-method-live.js');
  const moveUpStyles = read('decks/move-up-method-live.css');
  assert.match(moveUpPresentation, /id="lobby"/);
  assert.match(moveUpPresentation, /id="notesBtn"/);
  assert.match(moveUpPresentation, /id="pipBtn"/);
  assert.match(moveUpPresentation, /The move-up<br><span class="b">method\.<\/span>/);
  assert.match(moveUpPresentation, /Daryn Fillis &nbsp;·&nbsp; NEO Home Loans &nbsp;·&nbsp; NMLS #1988371/);
  assert.match(moveUpPlayer, /window\.DECK_CHANNEL \|\| 'move-up-method-deck'/);
  assert.match(moveUpPlayer, /documentPictureInPicture/);
  assert.match(moveUpPlayer, /function startCountdown\(\)/);
  assert.match(moveUpPlayer, /manualMinutes === null\) manualMinutes = 5;/);
  assert.match(moveUpStyles, /h1\{font-weight:800;font-size:58px;line-height:1\.12;letter-spacing:-\.01em\}/);
  assert.match(moveUpStyles, /h2\{font-weight:800;font-size:44px;line-height:1\.15\}/);
  assert.match(moveUpStyles, /\.body\{font-size:20px;line-height:1\.55;color:var\(--pale\);font-weight:400\}/);
  assert.match(moveUpStyles, /\.brand-lens\{font-size:19px;line-height:1\.45;font-weight:600;/);
  assert.match(moveUpStyles, /@media print/);
  assert.match(moveUpStyles, /\.frag\{visibility:visible!important/);
  for (const asset of ['1.png', 'app-preview.png', 'app-qr.png', 'strategy-call-qr.png']) {
    assert.ok(fs.existsSync(path.join(root, 'decks/move-up-method', asset)), asset);
  }
  assert.ok(fs.existsSync(path.join(root, 'decks/move-up-method.pdf')));

  const borrowSmartPresentation = read('decks/borrow-smart-university.html');
  const borrowSmartPlayer = read('decks/borrow-smart-university-live.js');
  assert.match(borrowSmartPresentation, /<title>The third side\. \| Borrow Smart for real estate agents<\/title>/);
  assert.match(borrowSmartPresentation, /id="lobby"/);
  assert.match(borrowSmartPresentation, /Daryn Fillis &nbsp;·&nbsp; NEO Home Loans &nbsp;·&nbsp; NMLS #1988371/);
  assert.match(borrowSmartPresentation, /What are we trying to make possible\?/);
  assert.match(borrowSmartPresentation, /Life\. Property\. Position\. Path\./);
  assert.match(borrowSmartPresentation, /class="balance-triangle"/);
  assert.match(borrowSmartPresentation, /What belongs above them\?/);
  assert.match(borrowSmartPresentation, /Life at the center\./);
  const balanceRevealOrder = [
    'balance-node assets frag',
    'balance-node liabilities frag',
    'third-side-reveal frag',
    'triangle-center frag'
  ].map((className) => borrowSmartPresentation.indexOf(`class="${className}"`));
  assert.ok(balanceRevealOrder.every((index) => index >= 0));
  assert.deepEqual([...balanceRevealOrder].sort((a, b) => a - b), balanceRevealOrder);
  assert.equal((borrowSmartPresentation.match(/<section class="slide/g) || []).length, 24);
  assert.match(borrowSmartPlayer, /window\.DECK_CHANNEL = 'borrow-smart-university-deck'/);
  assert.match(borrowSmartPlayer, /\[STTS Step 1:/);
  assert.match(borrowSmartPlayer, /\[STTS Step 10:/);
  assert.match(borrowSmartPlayer, /\[Sources\]/);
  assert.doesNotMatch(borrowSmartPresentation + borrowSmartPlayer, /[\u2010-\u2015]|&(?:m|n)dash;/);
  for (const asset of ['1.png', 'strategy-call-qr.png']) {
    assert.ok(fs.existsSync(path.join(root, 'decks/borrow-smart-university', asset)), asset);
  }
  for (const asset of [
    'decks/borrow-smart-university.pdf',
    'decks/borrow-smart-university.pptx',
    'decks/borrow-smart-university-live.js'
  ]) {
    assert.ok(fs.existsSync(path.join(root, asset)), asset);
  }
});

test('conversion events cover the primary mortgage journeys', () => {
  const analytics = read('site-analytics.js');
  for (const eventName of [
    'cta_clicked', 'schedule_started', 'schedule_viewed', 'prequalification_started',
    'phone_contact_started', 'email_contact_started', 'lead_form_submitted',
    'lead_form_completed', 'calculator_started', 'calculator_result_viewed',
    'consultation_booked'
  ]) {
    assert.match(analytics, new RegExp(`['"]${eventName}['"]`), eventName);
  }
  assert.doesNotMatch(analytics, /\.value\b/, 'analytics must not read form field values');
});
