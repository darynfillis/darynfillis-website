(function () {
  'use strict';

  var config = window.SCENARIO_DESK_CONFIG;
  if (!config || !Array.isArray(config.steps)) return;

  var steps = config.steps;
  var MAX_PROPERTIES = 10;

  function option(value, title, description) {
    return { value: value, title: title, description: description || '' };
  }

  function field(name, label, settings) {
    settings = settings || {};
    settings.name = name;
    settings.label = label;
    return settings;
  }

  function fullIntake(state) {
    return state.applicationStatus !== 'complete';
  }

  function purchase(state) {
    return state.transactionType === 'purchase';
  }

  function refinance(state) {
    return state.transactionType === 'refinance';
  }

  function propertyCount(state) {
    if (state.existingPropertyCount === '10plus') return MAX_PROPERTIES;
    var count = Number(state.existingPropertyCount || 0);
    return Number.isFinite(count) ? count : 0;
  }

  function propertyActive(index) {
    return function (state) {
      return fullIntake(state) && propertyCount(state) >= index;
    };
  }

  function sourceForProperty(index) {
    return index === 1
      ? 'Scenario Desk - Page 1 - Property, Cash Flow, Refinance, and Mortgage Information; expanded for multiple properties'
      : 'Scenario Desk - Page 1 - Property, Cash Flow, and Mortgage Information; repeated for an additional property';
  }

  function propertyProfileStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_profile',
      section: 'Existing real estate - Property ' + index,
      type: 'fields',
      source: sourceForProperty(index),
      title: function (state) {
        return refinance(state) && index === 1
          ? 'Property being refinanced'
          : 'Existing property ' + index;
      },
      plain: 'Keep the property facts, rental income, and property-specific assumptions together. Enter 0 for monthly rent when the property is not rented.',
      when: propertyActive(index),
      help: {
        meaning: 'Type of property describes the building. Type of residence describes how you use it. Current value is your best estimate of today\'s market value. Rent is the gross monthly amount received before expenses. The appreciation rate is a self-reported planning input, not a forecast.',
        where: 'Use a mortgage statement, property tax bill, lease, appraisal, real estate agent estimate, online property record, or your best reasonable estimate.',
        enter: 'Enter the property address, property type, use, current value, monthly rent received, and the annual appreciation rate you want recorded. Use the cannot-find option instead of guessing.',
        note: 'The intake records these answers only. It does not calculate equity, cash flow, return, or a recommendation.'
      },
      fields: [
        field(prefix + 'Address', 'Property ' + index + ' address or identifying description:*', { required: true, full: true, placeholder: 'Street address, city, state, ZIP or a clear description', allowUnknown: true }),
        field(prefix + 'Type', 'Property ' + index + ' - Type of property?', { required: true, type: 'select', choices: ['', 'Single family', 'Condo', 'Townhouse', 'Cooperative', '1-4 unit', 'Not sure'] }),
        field(prefix + 'ResidenceType', 'Property ' + index + ' - Type of residence?', { required: true, type: 'select', choices: ['', 'Primary', 'Vacation', 'Investment', 'Not sure'] }),
        field(prefix + 'CurrentValue', 'Property ' + index + ' - Current value: $', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Estimated current market value', allowUnknown: true }),
        field(prefix + 'MonthlyRent', 'Property ' + index + ' - Rent collected each month: $', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Enter 0 if no rent is collected', allowUnknown: true }),
        field(prefix + 'AppreciationRate', 'Property ' + index + ' - Expected appreciation rate: %', { required: true, suffix: '%', inputmode: 'decimal', placeholder: 'Annual percentage or Not sure', allowUnknown: true })
      ]
    };
  }

  function refinanceDetailsStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_refinance_details',
      section: 'Existing real estate - Property ' + index,
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Existing House Refinance Only',
      title: 'Cash-out information for the property being refinanced',
      plain: 'This step appears only for Property 1 on the refinance route.',
      when: function (state) {
        return fullIntake(state) && refinance(state) && index === 1 && propertyCount(state) >= 1;
      },
      help: {
        meaning: 'Cash out is the amount you want to receive from the new loan after existing liens are paid. Enter 0 when no cash out is requested.',
        where: 'Use the amount discussed in your refinance plan or your current goal. No document is required for the purpose of cash out.',
        enter: 'Enter the requested dollar amount and describe what the funds would be used for. Enter 0 and Not applicable when no cash out is requested.',
        note: 'This intake records the request and purpose only. It does not determine eligibility or recommend an amount.'
      },
      fields: [
        field(prefix + 'CashOutRequested', 'Cash-out requested?: $', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Enter 0 if none', allowUnknown: true }),
        field(prefix + 'CashOutPurpose', 'Purpose of cash out:', { required: true, full: true, placeholder: 'For example: renovation, debt payoff, reserves, or Not applicable' })
      ]
    };
  }

  function firstMortgageGateStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_first_mortgage_gate',
      section: 'Existing real estate - Property ' + index,
      type: 'choice',
      field: prefix + 'HasFirstMortgage',
      source: 'Routing question for Scenario Desk - Page 1 - If First Mortgage',
      title: 'Does Property ' + index + ' have a first mortgage?',
      plain: 'A first mortgage is the primary loan secured by this property.',
      when: propertyActive(index),
      help: {
        meaning: 'This is usually the main mortgage used to buy or refinance the property.',
        where: 'Check the property\'s mortgage statement, online servicer account, or credit report.',
        enter: 'Choose Yes or No for this property.'
      },
      options: [option('Yes', 'Yes'), option('No', 'No')]
    };
  }

  function firstMortgageFieldsStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_first_mortgage',
      section: 'Existing real estate - Property ' + index,
      type: 'fields',
      source: 'Scenario Desk - Page 1 - If First Mortgage',
      title: 'Property ' + index + ' - First mortgage information',
      plain: 'Keep the first-mortgage details with the property they belong to.',
      when: function (state) {
        return fullIntake(state) && propertyCount(state) >= index && state[prefix + 'HasFirstMortgage'] === 'Yes';
      },
      help: {
        meaning: 'Fixed means the interest rate stays the same for the stated term. Adjustable means it can change. Interest only means scheduled payments may not reduce principal during the interest-only period.',
        where: 'Use the Closing Disclosure, promissory note, current mortgage statement, or online servicer account for this property.',
        enter: 'Enter the original amount, original start date, fixed or adjustable term, term in years, and whether it is interest only. Use the cannot-find option instead of guessing.'
      },
      fields: [
        field(prefix + 'FirstOriginalAmount', 'Property ' + index + ' - First mortgage original loan amount:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Original amount borrowed', allowUnknown: true }),
        field(prefix + 'FirstStartDate', 'Property ' + index + ' - First mortgage original start date:', { required: true, placeholder: 'MM/DD/YYYY or Not sure', allowUnknown: true }),
        field(prefix + 'FirstTermType', 'Property ' + index + ' - Fixed term or Adjustable term:', { required: true, type: 'select', choices: ['', 'Fixed term', 'Adjustable term', 'Not sure'] }),
        field(prefix + 'FirstTermYears', 'Property ' + index + ' - First mortgage term: yrs', { required: true, suffix: 'yrs', inputmode: 'numeric', placeholder: 'For example: 30 or 5', allowUnknown: true }),
        field(prefix + 'FirstInterestOnly', 'Property ' + index + ' - Interest only loan:', { required: true, type: 'select', choices: ['', 'Yes', 'No', 'Not sure'], full: true })
      ]
    };
  }

  function secondMortgageGateStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_second_mortgage_gate',
      section: 'Existing real estate - Property ' + index,
      type: 'choice',
      field: prefix + 'HasSecondMortgage',
      source: 'Routing question for Scenario Desk - Page 1 - If Second Mortgage',
      title: 'Does Property ' + index + ' have a second mortgage or HELOC?',
      plain: 'A HELOC is a home equity line of credit secured by this property in addition to the first mortgage.',
      when: propertyActive(index),
      help: {
        meaning: 'A second mortgage can be a fixed-term loan or a revolving home equity line of credit.',
        where: 'Check the property\'s HELOC or second-mortgage statement, online account, or credit report.',
        enter: 'Choose Yes or No for this property.'
      },
      options: [option('Yes', 'Yes'), option('No', 'No')]
    };
  }

  function secondMortgageFieldsStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_second_mortgage',
      section: 'Existing real estate - Property ' + index,
      type: 'fields',
      source: 'Scenario Desk - Page 1 - If Second Mortgage',
      title: 'Property ' + index + ' - Second mortgage or HELOC information',
      plain: 'Keep the second-lien details with the property they belong to.',
      when: function (state) {
        return fullIntake(state) && propertyCount(state) >= index && state[prefix + 'HasSecondMortgage'] === 'Yes';
      },
      help: {
        meaning: 'A fixed-term second mortgage has a set repayment term. A HELOC is a revolving line of credit secured by the property.',
        where: 'Use the HELOC or second-mortgage statement, Closing Disclosure, promissory note, or online account for this property.',
        enter: 'Choose fixed term or HELOC, enter the fixed term in years when applicable, and provide the original amount and start date.'
      },
      fields: [
        field(prefix + 'SecondTermType', 'Property ' + index + ' - Fixed term or HELOC:', { required: true, type: 'select', choices: ['', 'Fixed term', 'HELOC', 'Not sure'] }),
        field(prefix + 'SecondTermYears', 'Property ' + index + ' - Fixed term: yrs', { required: false, suffix: 'yrs', inputmode: 'numeric', placeholder: 'Leave blank for HELOC', allowUnknown: true }),
        field(prefix + 'SecondOriginalAmount', 'Property ' + index + ' - Second mortgage original loan amount:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Original amount or line limit', allowUnknown: true }),
        field(prefix + 'SecondStartDate', 'Property ' + index + ' - Second mortgage original start date:', { required: true, placeholder: 'MM/DD/YYYY or Not sure', allowUnknown: true })
      ]
    };
  }

  var removeIds = {
    property_and_residence: true,
    sale_details_full: true,
    refinance_details: true,
    rent_collected: true,
    property_appreciation: true,
    first_mortgage_gate: true,
    first_mortgage: true,
    second_mortgage_gate: true,
    second_mortgage: true
  };

  steps = steps.filter(function (step) { return !removeIds[step.id]; });
  config.steps = steps;

  var purchaseSubjectStep = {
    id: 'purchase_subject_property',
    section: 'New home purchase',
    type: 'fields',
    source: 'Scenario Desk - Page 1 - Type of property and Type of residence',
    title: 'The home you are buying',
    plain: 'These questions describe the new property, not real estate you already own.',
    when: function (state) { return fullIntake(state) && purchase(state); },
    help: {
      meaning: 'Type of property describes the building. Type of residence describes how you plan to use the new home.',
      where: 'Use the listing, purchase contract, appraisal, HOA documents, or your current plan.',
      enter: 'Choose one property type and one residence type. Select Not sure when the answer is not yet known.'
    },
    fields: [
      field('propertyType', 'Type of property?', { required: true, type: 'select', choices: ['', 'Single family', 'Condo', 'Townhouse', 'Cooperative', '1-4 unit', 'Not sure'] }),
      field('residenceType', 'Type of residence?', { required: true, type: 'select', choices: ['', 'Primary', 'Vacation', 'Investment', 'Not sure'] })
    ]
  };

  var countOptionsPurchase = [
    option('0', 'I do not currently own real estate'),
    option('1', '1 property'),
    option('2', '2 properties'),
    option('3', '3 properties'),
    option('4', '4 properties'),
    option('5', '5 properties'),
    option('6', '6 properties'),
    option('7', '7 properties'),
    option('8', '8 properties'),
    option('9', '9 properties'),
    option('10', '10 properties'),
    option('10plus', 'More than 10 properties')
  ];

  var countOptionsWithMinimumOne = countOptionsPurchase.slice(1);

  var realEstateSteps = [
    purchaseSubjectStep,
    {
      id: 'existing_property_count_purchase',
      section: 'Existing real estate',
      type: 'choice',
      field: 'existingPropertyCount',
      source: 'Routing question added to support multiple properties',
      title: 'How many properties do you currently own?',
      plain: 'We will repeat the same property, rent, appreciation, and mortgage questions for each property you own.',
      when: function (state) { return fullIntake(state) && purchase(state) && state.sellingHome !== 'Yes'; },
      help: {
        meaning: 'Count homes, vacation properties, rental properties, and 1-4 unit properties you currently own.',
        where: 'Use your own records or credit report if needed.',
        enter: 'Choose the total number of existing properties. Do not include the new home you are purchasing.'
      },
      twoColumn: true,
      options: countOptionsPurchase
    },
    {
      id: 'existing_property_count_purchase_selling',
      section: 'Existing real estate',
      type: 'choice',
      field: 'existingPropertyCount',
      source: 'Routing question added to support multiple properties',
      title: 'How many properties do you currently own?',
      plain: 'Because you indicated that a home is being sold, the count must include that property.',
      when: function (state) { return fullIntake(state) && purchase(state) && state.sellingHome === 'Yes'; },
      help: {
        meaning: 'Count the home being sold and every other property you currently own.',
        where: 'Use your own records or credit report if needed.',
        enter: 'Choose the total number of existing properties. Do not include the new home you are purchasing.'
      },
      twoColumn: true,
      options: countOptionsWithMinimumOne
    },
    {
      id: 'existing_property_count_refinance',
      section: 'Existing real estate',
      type: 'choice',
      field: 'existingPropertyCount',
      source: 'Routing question added to support multiple properties',
      title: 'How many properties do you currently own?',
      plain: 'Property 1 will be treated as the property being refinanced. The same information can then be captured for every additional property.',
      when: function (state) { return fullIntake(state) && refinance(state); },
      help: {
        meaning: 'Count the property being refinanced and all other real estate you currently own.',
        where: 'Use your own records or credit report if needed.',
        enter: 'Choose the total number of existing properties.'
      },
      twoColumn: true,
      options: countOptionsWithMinimumOne
    }
  ];

  for (var i = 1; i <= MAX_PROPERTIES; i += 1) {
    realEstateSteps.push(propertyProfileStep(i));
    realEstateSteps.push(refinanceDetailsStep(i));
    realEstateSteps.push(firstMortgageGateStep(i));
    realEstateSteps.push(firstMortgageFieldsStep(i));
    realEstateSteps.push(secondMortgageGateStep(i));
    realEstateSteps.push(secondMortgageFieldsStep(i));
  }

  realEstateSteps.push({
    id: 'additional_properties_over_ten',
    section: 'Existing real estate - Additional properties',
    type: 'text',
    field: 'additionalPropertyDetails',
    source: 'Usability extension for clients with more than 10 properties',
    title: 'List the remaining properties not entered above',
    plain: 'For each additional property, include the address, property type, use, current value, monthly rent, expected appreciation, and first- and second-mortgage information.',
    when: function (state) { return fullIntake(state) && state.existingPropertyCount === '10plus'; },
    help: {
      meaning: 'This preserves information for properties beyond the ten structured property sections.',
      where: 'Use property records, lease agreements, and mortgage or HELOC statements.',
      enter: 'Use one paragraph or line per additional property. Include every item requested in the prompt.'
    },
    placeholder: 'Property 11: address | type/use | current value | monthly rent | appreciation rate | first mortgage details | second mortgage or HELOC details'
  });

  realEstateSteps.push({
    id: 'home_sale_details_grouped',
    section: 'Existing real estate - Home being sold',
    type: 'fields',
    source: 'Scenario Desk - Page 1 - New House Purchase Only',
    title: 'The home you are selling',
    plain: 'These fields appear only when a current property is being sold as part of the purchase.',
    when: function (state) { return fullIntake(state) && purchase(state) && state.sellingHome === 'Yes'; },
    help: {
      meaning: 'The sales price is the expected gross price before mortgage payoff, commissions, and other sale costs. Realtor fee is the percentage in the listing or brokerage agreement.',
      where: 'Use the signed sale contract, comparative market analysis, listing agreement, or your real estate agent\'s estimate.',
      enter: 'Identify the property being sold, enter the expected sales price, and enter the Realtor fee percentage. Use the cannot-find option instead of guessing.'
    },
    fields: [
      field('sellingPropertyAddress', 'Address or description of the home being sold:*', { required: true, full: true, placeholder: 'Identify which existing property is being sold', allowUnknown: true }),
      field('sellingPrice', 'What is the sales price of the home you are selling? $', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Expected sale price', allowUnknown: true }),
      field('realtorFee', 'Realtor fee? %', { required: true, suffix: '%', inputmode: 'decimal', placeholder: 'For example: 5 or Not sure', allowUnknown: true })
    ]
  });

  var insertIndex = config.steps.findIndex(function (step) { return step.id === 'purchase_price'; });
  if (insertIndex === -1) {
    insertIndex = config.steps.findIndex(function (step) { return step.id === 'tax_bracket_only'; });
  }
  config.steps.splice.apply(config.steps, [insertIndex + 1, 0].concat(realEstateSteps));

  var liabilities = config.steps.find(function (step) { return step.id === 'liabilities'; });
  if (liabilities) {
    liabilities.plain = 'List every current liability that was not already captured with an existing property. Mortgages and HELOCs stay with their property; add auto loans, student loans, credit cards, personal loans, support obligations, and other debts here.';
    liabilities.help = {
      meaning: 'The paper form asks for all current liabilities. This online version keeps property-secured debts in the Existing real estate section and captures all remaining debts here.',
      where: 'Use your credit report and the most recent statement for each non-property debt. If a debt is secured by a property, confirm that it was entered with that property instead.',
      enter: 'Add one row per remaining debt. You may choose I have no other current liabilities.'
    };
  }
})();
