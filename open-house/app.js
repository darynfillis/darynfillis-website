(function () {
  'use strict';

  const dependencies = [
    '/open-house/app-data.js',
    '/open-house/app-utils.js',
    '/open-house/app-modules.js',
    '/open-house/app-interactions.js'
  ];

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error(`Unable to load ${src}`));
      };
      document.head.appendChild(script);
    });
  }

  function initOpenHouseExperience() {
    const route = routeState();
    const properties = window.OPEN_HOUSE_PROPERTIES || {};
    state.propertySlug = route.propertySlug;
    state.riderSlug = route.riderSlug;
    state.property = properties[state.propertySlug] || properties[PROPERTY_DEFAULT];
    state.rider = RIDERS[state.riderSlug] || RIDERS[RIDER_DEFAULT];

    updateMetadata();
    updatePropertyContent();
    updateRiderContent();
    updateContactLinks();
    updateHiddenFields();
    renderExperience();
    bindForm();
    bindHero();

    track('open_house_rider_viewed', {
      rider_question: state.rider.scanQuestion,
      property_address: state.property.address,
      demo_property: Boolean(state.property.demo)
    });
  }

  async function boot() {
    try {
      for (const dependency of dependencies) {
        await loadScript(dependency);
      }
      initOpenHouseExperience();
    } catch (error) {
      console.error('Open-house experience failed to initialize.', error);
      const root = document.getElementById('experienceRoot');
      if (root) {
        root.innerHTML = '<div class="module-callout"><strong>This experience could not load.</strong><p>Please text Daryn at 424-396-6967 and include the property address.</p></div>';
      }
    }
  }

  boot();
}());
