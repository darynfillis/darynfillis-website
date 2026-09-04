function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMoney(value, options) {
  const config = Object.assign({ maximumFractionDigits: 0 }, options || {});
  if (!Number.isFinite(value)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: config.maximumFractionDigits,
    minimumFractionDigits: config.minimumFractionDigits || 0
  }).format(value);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value, digits) {
  if (!Number.isFinite(value)) return '0%';
  return `${(value * 100).toFixed(digits == null ? 2 : digits)}%`;
}

function monthlyPrincipalAndInterest(principal, annualRate, years) {
  const months = (years || 30) * 12;
  const monthlyRate = annualRate / 12;
  if (principal <= 0) return 0;
  if (monthlyRate === 0) return principal / months;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function remainingBalance(principal, annualRate, monthsPaid, years) {
  const totalMonths = (years || 30) * 12;
  const monthlyRate = annualRate / 12;
  const months = Math.min(Math.max(monthsPaid, 0), totalMonths);
  if (principal <= 0) return 0;
  if (monthlyRate === 0) return principal * (1 - months / totalMonths);
  const payment = monthlyPrincipalAndInterest(principal, annualRate, years || 30);
  return principal * Math.pow(1 + monthlyRate, months) - payment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function scenarioMetrics(property, downPaymentRate, interestRate, pmiAnnualRate, sellerCredit, priceOverride) {
  const price = priceOverride || property.price;
  const downPayment = price * downPaymentRate;
  const loanAmount = price - downPayment;
  const principalAndInterest = monthlyPrincipalAndInterest(loanAmount, interestRate, 30);
  const propertyTax = price * property.taxRate / 12;
  const insurance = property.annualInsurance / 12;
  const hoa = property.hoaMonthly || 0;
  const pmi = pmiAnnualRate ? loanAmount * pmiAnnualRate / 12 : 0;
  const totalMonthly = principalAndInterest + propertyTax + insurance + hoa + pmi;
  const credit = Math.max(0, sellerCredit || 0);
  const cashToClose = Math.max(0, downPayment + property.estimatedClosingCosts - credit);
  return {
    price,
    downPayment,
    loanAmount,
    principalAndInterest,
    propertyTax,
    insurance,
    hoa,
    pmi,
    totalMonthly,
    cashToClose,
    sellerCredit: credit
  };
}

function fiveYearModel(property, downPaymentRate, annualRate, years, appreciationRate) {
  const metrics = scenarioMetrics(property, downPaymentRate, annualRate, downPaymentRate < 0.20 ? 0.0035 : 0, property.financing.sellerCredit);
  const months = years * 12;
  const futureValue = property.price * Math.pow(1 + appreciationRate, years);
  const balance = remainingBalance(metrics.loanAmount, annualRate, months, 30);
  const principalReduction = metrics.loanAmount - balance;
  const appreciation = futureValue - property.price;
  const grossEquity = futureValue - balance;
  const sellingCosts = futureValue * property.estimatedSellingCostRate;
  const netSaleProceeds = grossEquity - sellingCosts;
  const startingCash = metrics.cashToClose;
  const netPositionChange = netSaleProceeds - startingCash;
  return {
    metrics,
    futureValue,
    balance,
    principalReduction,
    appreciation,
    grossEquity,
    sellingCosts,
    netSaleProceeds,
    startingCash,
    netPositionChange
  };
}

function breakEvenRate(principal, targetPayment) {
  let low = 0.001;
  let high = 0.18;
  for (let index = 0; index < 80; index += 1) {
    const mid = (low + high) / 2;
    const payment = monthlyPrincipalAndInterest(principal, mid, 30);
    if (payment > targetPayment) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}

function routeState() {
  const params = new URLSearchParams(window.location.search);
  const parts = window.location.pathname.split('/').filter(Boolean);
  let propertySlug = params.get('property') || PROPERTY_DEFAULT;
  let riderSlug = params.get('rider') || RIDER_DEFAULT;

  if (parts[0] === 'homes') {
    propertySlug = parts[1] || propertySlug;
    riderSlug = parts[2] || riderSlug;
  }

  const properties = window.OPEN_HOUSE_PROPERTIES || {};
  if (!properties[propertySlug]) propertySlug = PROPERTY_DEFAULT;
  if (!RIDERS[riderSlug]) riderSlug = RIDER_DEFAULT;

  return { propertySlug, riderSlug };
}

function propertyUrl(riderSlug) {
  return `/homes/${encodeURIComponent(state.propertySlug)}/${encodeURIComponent(riderSlug)}`;
}

function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = value;
}

function setMeta(selectorId, attribute, value) {
  const element = byId(selectorId);
  if (element) element.setAttribute(attribute, value);
}

function updateMetadata() {
  const property = state.property;
  const rider = state.rider;
  const canonical = `https://darynfillis.com${propertyUrl(state.riderSlug)}`;
  const title = `${rider.scanQuestion.replace(/;\-\)/g, '').trim()} | ${property.address} | Daryn Fillis`;
  const description = `${rider.lead} Explore the financing tradeoffs for ${property.address}.`;
  const image = property.photo && property.photo.startsWith('http') ? property.photo : `https://darynfillis.com${property.photo || '/og-home.jpg'}`;

  document.title = title;
  setMeta('metaDescription', 'content', description);
  setMeta('canonicalLink', 'href', canonical);
  setMeta('ogUrl', 'content', canonical);
  setMeta('ogTitle', 'content', title);
  setMeta('ogDescription', 'content', description);
  setMeta('ogImage', 'content', image);
  setMeta('twitterTitle', 'content', title);
  setMeta('twitterDescription', 'content', description);
  setMeta('twitterImage', 'content', image);
}

function updatePropertyContent() {
  const property = state.property;
  const agent = property.listingAgent || {};
  const location = [property.city, property.state, property.zip].filter(Boolean).join(', ').replace(', ' + property.zip, ' ' + property.zip);
  const factParts = [
    property.beds ? `${property.beds} beds` : '',
    property.baths ? `${property.baths} baths` : '',
    property.sqft ? `${formatNumber(property.sqft)} sq. ft.` : ''
  ].filter(Boolean);

  setText('propertyStatus', property.status || 'For sale');
  setText('propertyAddress', property.address);
  setText('propertyLocation', location);
  setText('propertyPrice', formatMoney(property.price));
  setText('propertyFacts', factParts.join(' | '));
  setText('openHouseTime', property.openHouse || 'By appointment');
  setText('propertyType', property.propertyType || 'Residential property');
  setText('propertyHoa', property.hoaMonthly ? `${formatMoney(property.hoaMonthly)}/month` : 'None');

  const photo = byId('propertyPhoto');
  if (photo) {
    const safePhoto = String(property.photo || '/og-home.jpg').replace(/["')]/g, '');
    photo.style.backgroundImage = `linear-gradient(180deg, rgba(6,26,46,0.05) 0%, rgba(6,26,46,0.45) 100%), url('${safePhoto}')`;
    photo.setAttribute('aria-label', property.photoAlt || `Photo of ${property.address}`);
  }

  const demoBadge = byId('demoBadge');
  if (demoBadge) demoBadge.hidden = !property.demo;

  setText('agentName', agent.name || 'Listing agent');
  setText('agentCompany', [agent.brokerage, agent.license].filter(Boolean).join(' | '));
  renderAgentActions(agent);
}

function updateRiderContent() {
  const rider = state.rider;
  setText('riderNumber', `RIDER ${rider.number}`);
  setText('scanQuestion', rider.scanQuestion);
  setText('heroTitle', rider.title);
  setText('heroLead', rider.lead);
  setText('betterQuestionStrip', rider.betterQuestion);
  setText('experienceEyebrow', rider.eyebrow);
  setText('experienceTitle', rider.experienceTitle);
  setText('experienceLead', rider.experienceLead);
  setText('formTitle', rider.formTitle);
  setText('formDescription', rider.formDescription);
  setText('formSubmitLabel', rider.formSubmit);
  setText('questionLabel', rider.questionLabel);

  const primary = byId('heroPrimary');
  if (primary) {
    const span = primary.querySelector('span');
    if (span) span.textContent = rider.primaryCta;
  }
}

function renderAgentActions(agent) {
  const root = byId('agentActions');
  if (!root) return;
  const actions = [];
  if (agent.phone) actions.push(`<a href="tel:${escapeHtml(agent.phone.replace(/[^+\d]/g, ''))}">Call ${escapeHtml(agent.name.split(' ')[0])}</a>`);
  if (agent.email) actions.push(`<a href="mailto:${escapeHtml(agent.email)}">Email agent</a>`);
  if (agent.website) actions.push(`<a href="${escapeHtml(agent.website)}" target="_blank" rel="noopener noreferrer">Property details</a>`);
  root.innerHTML = actions.length ? actions.join('') : '<span class="partner-placeholder">Agent contact details are added for each property.</span>';
}

function smsHref() {
  const body = `Hi Daryn, I scanned the "${state.rider.scanQuestion}" sign at ${state.property.address}. I would like help thinking through this property.`;
  return `sms:+14243966967?&body=${encodeURIComponent(body)}`;
}

function updateContactLinks() {
  ['topbarSms', 'advisorSms', 'mobileSms'].forEach(function (id) {
    const element = byId(id);
    if (element) element.setAttribute('href', smsHref());
  });
}

function hiddenField(id, value) {
  const element = byId(id);
  if (element) element.value = value || '';
}

function updateHiddenFields() {
  const params = new URLSearchParams(window.location.search);
  hiddenField('formPropertySlug', state.propertySlug);
  hiddenField('formPropertyAddress', `${state.property.address}, ${state.property.city}, ${state.property.state} ${state.property.zip}`);
  hiddenField('formRiderSlug', state.riderSlug);
  hiddenField('formRiderQuestion', state.rider.scanQuestion);
  hiddenField('formSelectedStrategy', state.selectedStrategy);
  hiddenField('formInteractionSummary', state.interactionSummary);
  hiddenField('formListingAgent', state.property.listingAgent ? state.property.listingAgent.name : '');
  hiddenField('formPageUrl', window.location.href);
  hiddenField('formReferrer', document.referrer);
  hiddenField('formUtmSource', params.get('utm_source'));
  hiddenField('formUtmMedium', params.get('utm_medium'));
  hiddenField('formUtmCampaign', params.get('utm_campaign'));
  hiddenField('formUtmContent', params.get('utm_content'));
  hiddenField('formUtmTerm', params.get('utm_term'));
}

function track(eventName, parameters) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, Object.assign({
    property_slug: state.propertySlug,
    rider_slug: state.riderSlug
  }, parameters || {}));
}
