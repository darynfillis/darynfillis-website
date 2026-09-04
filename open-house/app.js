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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOpenHouseExperience, { once: true });
} else {
  initOpenHouseExperience();
}
