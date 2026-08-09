(function () {
  'use strict';

  const GA_ID = 'G-HNXGMCM9L5';
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

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

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

  document.addEventListener('submit', function (event) {
    const form = event.target;
    send('lead_form_submitted', {
      form_name: cleanText(form.getAttribute('name') || form.id || 'unnamed_form')
    });
  });

  if (thankYouTypes[pagePath]) {
    send('lead_form_completed', { lead_type: thankYouTypes[pagePath] });
  }

  if (pagePath === '/schedule') {
    const bookingConfirmed = new URLSearchParams(window.location.search).get('booking') === 'confirmed';
    if (bookingConfirmed) {
      send('consultation_booked', { provider: 'youcanbookme' });
    } else {
      send('schedule_viewed', {});
    }
    const schedulingFrame = document.querySelector('iframe[src*="youcanbook.me"]');
    if (schedulingFrame) {
      schedulingFrame.addEventListener('load', function () {
        send('schedule_widget_loaded', { provider: 'youcanbookme' });
      }, { once: true });
    }
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
