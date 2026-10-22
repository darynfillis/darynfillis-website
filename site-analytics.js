(function () {
  'use strict';

  // The current darynfillis.com GA4 property. Older page-level tags remain in
  // place during the migration so historical collection is not interrupted.
  const GA_ID = 'G-QC0YG2MK2P';
  const pagePath = window.location.pathname.replace(/\/$/, '') || '/';
  const calculatorPaths = new Set([
    '/buying-vs-renting',
    '/calculator',
    '/condo-check',
    '/sell-with-intention'
  ]);
  const thankYouTypes = {
    '/thanks-condo-buyer-guide': 'condo_buyer_guide',
    '/thanks-condo-seller-guide': 'condo_seller_guide',
    '/thanks-mortgage-strategy-digest': 'mortgage_strategy_digest',
    '/thanks-partnership': 'partnership',
    '/thanks-playbook': 'self_employed_playbook',
    '/thanks-rate-watch': 'rate_watch',
    '/thanks-wealth-digest': 'wealth_digest'
  };
  const formIntents = {
    'cal-condo-buyer': 'condo_buyer_checklist',
    'cal-condo-seller': 'condo_seller_checklist',
    'condo-check': 'condo_project_check',
    'condo-project-check-buyer': 'condo_project_check',
    'condo-project-check-seller': 'condo_project_check',
    'decode-2026': 'homebuyer_strategy',
    'mortgage-strategy-digest': 'mortgage_strategy_digest',
    'partnership-plus-download': 'realtor_partnership',
    'refi-rate-watch': 'refinance_rate_watch',
    'self-employed-playbook': 'self_employed_playbook',
    'wealth-digest': 'wealth_digest'
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const queryParams = new URLSearchParams(window.location.search);
  const attributionStorageKey = 'daryn_website_attribution_v1';

  function cleanAttributionValue(value) {
    return String(value || '').replace(/[^a-zA-Z0-9._ -]/g, '').trim().slice(0, 100);
  }

  function referrerDomain() {
    try {
      const domain = new URL(document.referrer).hostname;
      return domain === window.location.hostname ? '' : cleanAttributionValue(domain);
    } catch (error) {
      return '';
    }
  }

  function savedAttribution() {
    try {
      return JSON.parse(window.localStorage.getItem(attributionStorageKey) || '{}');
    } catch (error) {
      return {};
    }
  }

  const suppliedAttribution = {
    source: cleanAttributionValue(queryParams.get('source') || queryParams.get('utm_source')),
    medium: cleanAttributionValue(queryParams.get('utm_medium')),
    campaign: cleanAttributionValue(queryParams.get('utm_campaign')),
    content: cleanAttributionValue(queryParams.get('utm_content')),
    term: cleanAttributionValue(queryParams.get('utm_term')),
    landingPath: pagePath,
    referrer: referrerDomain()
  };
  const storedAttribution = savedAttribution();
  const hasNewAttribution = Object.values(suppliedAttribution).some(Boolean) && Boolean(
    suppliedAttribution.source || suppliedAttribution.medium || suppliedAttribution.campaign ||
    suppliedAttribution.content || suppliedAttribution.term
  );
  const firstTouch = storedAttribution.firstTouch || (hasNewAttribution ? suppliedAttribution : {
    source: 'direct', medium: '', campaign: '', content: '', term: '', landingPath: pagePath, referrer: referrerDomain()
  });
  const latestTouch = hasNewAttribution ? suppliedAttribution : (storedAttribution.latestTouch || firstTouch);
  const websiteSource = latestTouch.source || 'direct';

  try {
    window.localStorage.setItem(attributionStorageKey, JSON.stringify({ firstTouch, latestTouch }));
  } catch (error) {
    // Attribution is helpful but must never interfere with the visitor journey.
  }

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_ID}"]`)) {
    const googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(googleTag);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  }

  function send(eventName, parameters) {
    window.gtag('event', eventName, {
      page_path: pagePath,
      page_title: document.title,
      transport_type: 'beacon',
      ...parameters
    });
  }

  function formName(form) {
    return cleanText(form.getAttribute('name') || form.id || 'unnamed_form');
  }

  function formIntent(form) {
    return formIntents[formName(form)] || formName(form);
  }

  function addHiddenField(form, name, value) {
    if (!value || form.querySelector(`[name="${name}"]`)) return;
    const field = document.createElement('input');
    field.type = 'hidden';
    field.name = name;
    field.setAttribute('value', value);
    form.appendChild(field);
  }

  function addLeadAttribution(form) {
    if (!form.matches('form[data-netlify="true"], form[data-netlify], form[netlify]')) return;
    const metadata = {
      website_lead_source: firstTouch.source || 'direct',
      website_lead_medium: firstTouch.medium,
      website_lead_campaign: firstTouch.campaign,
      website_landing_page: firstTouch.landingPath,
      website_referrer_domain: firstTouch.referrer,
      website_submission_page: pagePath,
      website_funnel_intent: formIntent(form)
    };
    Object.entries(metadata).forEach(([name, value]) => addHiddenField(form, name, value));
  }

  document.querySelectorAll('form').forEach(addLeadAttribution);

  function ctaLocation(element) {
    const region = element.closest('header, nav, main, section, aside, footer');
    if (!region) return 'page';
    return region.id || cleanText(region.getAttribute('aria-label')) || region.tagName.toLowerCase();
  }

  function linkType(href) {
    if (/^tel:/i.test(href)) return 'phone';
    if (/^mailto:/i.test(href)) return 'email';
    if (/neohomeloans\.com\/start/i.test(href)) return 'prequalification';
    if (/\/schedule(?:[/?#]|$)|youcanbook\.me/i.test(href)) return 'schedule';
    return 'general';
  }

  document.addEventListener('click', function (event) {
    const target = event.target.closest('a, button');
    if (!target) return;

    const href = target.getAttribute('href') || '';
    const type = linkType(href);
    const details = {
      cta_text: cleanText(target.getAttribute('aria-label') || target.textContent),
      cta_location: ctaLocation(target),
      destination_type: type
    };

    if (type === 'schedule') send('schedule_started', details);
    if (type === 'prequalification') send('prequalification_started', details);
    if (type === 'phone') send('phone_contact_started', details);
    if (type === 'email') send('email_contact_started', details);

    const promotion = target.closest('[data-promotion]');
    if (promotion) {
      send('promotion_cta_clicked', {
        promotion_name: cleanText(promotion.getAttribute('data-promotion')),
        ...details
      });
    }

    if (
      type !== 'general' ||
      target.matches('.btn, .nav-cta, .nav-continue, .hero-cta, [data-analytics-cta]')
    ) {
      send('cta_clicked', details);
    }

    if (calculatorPaths.has(pagePath) && target.matches('#seemore, .print-btn, [data-calculator-result]')) {
      send('calculator_result_viewed', {
        calculator_name: pagePath.slice(1),
        action: target.matches('.print-btn') ? 'export' : 'results'
      });
    }
  });

  const startedForms = new WeakSet();

  document.addEventListener('focusin', function (event) {
    const form = event.target.closest('form');
    if (!form || startedForms.has(form)) return;
    startedForms.add(form);
    send('lead_form_started', {
      form_name: formName(form),
      lead_type: formIntent(form),
      website_source: websiteSource
    });
  });

  document.addEventListener('submit', function (event) {
    const form = event.target;
    send('lead_form_submitted', {
      form_name: formName(form),
      lead_type: formIntent(form),
      website_source: websiteSource
    });
  });

  if (thankYouTypes[pagePath]) {
    send('lead_form_completed', { lead_type: thankYouTypes[pagePath], website_source: websiteSource });
    send('generate_lead', { lead_type: thankYouTypes[pagePath], website_source: websiteSource });
  }

  if (pagePath === '/schedule') {
    const bookingConfirmed = queryParams.get('booking') === 'confirmed';
    if (bookingConfirmed) {
      send('consultation_booked', { provider: 'youcanbookme', website_source: websiteSource });
    } else {
      send('schedule_viewed', { website_source: websiteSource });
    }
    const schedulingFrame = document.querySelector('iframe[src*="youcanbook.me"]');
    if (schedulingFrame) {
      schedulingFrame.addEventListener('load', function () {
        send('schedule_widget_loaded', { provider: 'youcanbookme' });
      }, { once: true });
    }
  }

  if (pagePath === '/booking-confirmed') {
    send('consultation_booked', { provider: 'youcanbookme', website_source: websiteSource });
  }

  const promotionView = document.querySelector('[data-promotion-view]');
  if (promotionView) {
    send('promotion_viewed', {
      promotion_name: cleanText(promotionView.getAttribute('data-promotion-view')),
      promotion_location: ctaLocation(promotionView)
    });
  }

  if (calculatorPaths.has(pagePath)) {
    let started = false;
    let resultTimer;
    const calculatorName = pagePath.slice(1);

    function recordCalculatorUse(event) {
      if (!event.target.matches('input:not([type="hidden"]), select, .opt, .program-btn')) return;
      if (!started) {
        started = true;
        send('calculator_started', { calculator_name: calculatorName });
      }
      window.clearTimeout(resultTimer);
      resultTimer = window.setTimeout(function () {
        send('calculator_result_viewed', {
          calculator_name: calculatorName,
          action: 'updated'
        });
      }, 1200);
    }

    document.addEventListener('input', recordCalculatorUse);
    document.addEventListener('change', recordCalculatorUse);
    document.addEventListener('click', recordCalculatorUse);
  }

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.setAttribute('aria-controls', 'navLinks');
    navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open') ? 'true' : 'false');
    navToggle.addEventListener('click', function () {
      window.requestAnimationFrame(function () {
        navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open') ? 'true' : 'false');
      });
    });
    navLinks.addEventListener('click', function (event) {
      if (!event.target.closest('a')) return;
      window.requestAnimationFrame(function () {
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !navLinks.classList.contains('open')) return;
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    });
  }

  document.querySelectorAll('[data-tooltip]').forEach(function (tooltip) {
    if (!tooltip.hasAttribute('aria-label')) {
      tooltip.setAttribute('aria-label', cleanText(tooltip.getAttribute('data-tooltip')));
    }
  });
}());
