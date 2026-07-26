(function () {
  'use strict';

  if (window.SCENARIO_REAL_ESTATE_CONFIG_APPLIED) return;
  window.SCENARIO_REAL_ESTATE_CONFIG_APPLIED = true;

  var config = window.SCENARIO_DESK_CONFIG;
  if (!config || !Array.isArray(config.steps)) return;

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

  function securedDebtFields(prefix, label) {
    return [
      field(prefix + 'Creditor', label + ' - Creditor or servicer:', { required: true, placeholder: 'Company you make payments to', allowUnknown: true }),
      field(prefix + 'Rate', label + ' - Current interest rate:', { required: true, suffix: '%', inputmode: 'decimal', placeholder: 'Current rate', allowUnknown: true }),
      field(prefix + 'Balance', label + ' - Current balance:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Amount currently owed', allowUnknown: true }),
      field(prefix + 'PrincipalInterest', label + ' - Monthly principal and interest:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Monthly P&I payment', allowUnknown: true }),
      field(prefix + 'TaxInsurance', label + ' - Monthly tax and insurance:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Enter 0 if not included', allowUnknown: true }),
      field(prefix + 'Payoff', label + ' - Pay off as part of this strategy?', { required: true, type: 'select', choices: ['', 'Yes', 'No', 'Not sure'], full: true })
    ];
  }

  function propertyProfileStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_profile',
      section: 'Existing real estate - Property ' + index,
      type: 'fields',
      source: index === 1
        ? 'Scenario Desk - Page 1 - Property, Cash Flow, Refinance, and Mortgage Information; grouped by property'
        : 'Scenario Desk - Page 1 - Property, Cash Flow, and Mortgage Information; repeated for an additional property',
      title: function (state) {
        return refinance(state) && index === 1 ? 'Property being refinanced' : 'Existing property ' + index;
      },
      plain: 'The property facts, rent, appreciation input, and all loans secured by this property stay together in the same property section.',
      when: propertyActive(index),
      help: {
        meaning: 'Property type describes the building. Residence type describes how you use it. Current value is your estimate of today\'s market value. Rent is the gross monthly amount received before expenses. Appreciation is a self-reported planning input.',
        where: 'Use a property tax bill, lease, appraisal, real estate agent estimate, online property record, or your best reasonable estimate.',
        enter: 'Enter the address, property type, use, current value, monthly rent, and annual appreciation input. Enter 0 for rent when the property is not rented. Use the cannot-find option instead of guessing.',
        note: 'The intake records the information only. It does not calculate equity, cash flow, return, or a recommendation.'
      },
      fields: [
        field(prefix + 'Address', 'Property ' + index + ' address or identifying description:*', { required: true, full: true, placeholder: 'Street address, city, state, ZIP or a clear description', allowUnknown: true }),
        field(prefix + 'Type', 'Property ' + index + ' - Type of property?', { required: true, type: 'select', choices: ['', 'Single family', 'Condo', 'Townhouse', 'Cooperative', '1-4 unit', 'Not sure'] }),
        field(prefix + 'ResidenceType', 'Property ' + index + ' - Type of residence?', { required: true, type: 'select', choices: ['', 'Primary', 'Vacation', 'Investment', 'Not sure'] }),
        field(prefix + 'CurrentValue', 'Property ' + index + ' - Current value:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Estimated current market value', allowUnknown: true }),
        field(prefix + 'MonthlyRent', 'Property ' + index + ' - Rent collected each month:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Enter 0 if no rent is collected', allowUnknown: true }),
        field(prefix + 'AppreciationRate', 'Property ' + index + ' - Expected appreciation rate:', { required: true, suffix: '%', inputmode: 'decimal', placeholder: 'Annual percentage or Not sure', allowUnknown: true })
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
      plain: 'This appears only for Property 1 on the refinance route.',
      when: function (state) {
        return fullIntake(state) && refinance(state) && index === 1 && propertyCount(state) >= 1;
      },
      help: {
        meaning: 'Cash out is the amount you want to receive from the new loan after existing liens are paid.',
        where: 'Use the amount discussed in your refinance plan or your current goal.',
        enter: 'Enter the requested amount and its purpose. Enter 0 and Not applicable when no cash out is requested.',
        note: 'This records the request only. It does not determine eligibility or recommend an amount.'
      },
      fields: [
        field(prefix + 'CashOutRequested', 'Cash-out requested?:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Enter 0 if none', allowUnknown: true }),
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
    var prefix = 'property' + index + 'First';
    var propertyPrefix = 'property' + index;
    return {
      id: propertyPrefix + '_first_mortgage',
      section: 'Existing real estate - Property ' + index,
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Current liabilities and If First Mortgage',
      title: 'Property ' + index + ' - First mortgage information',
      plain: 'This combines the first-mortgage fields with the liability-table details for the same loan.',
      when: function (state) {
        return fullIntake(state) && propertyCount(state) >= index && state[propertyPrefix + 'HasFirstMortgage'] === 'Yes';
      },
      help: {
        meaning: 'Current balance and payment information comes from the liability table. Original amount, start date, loan term, and interest-only status come from the mortgage-information section.',
        where: 'Use the current mortgage statement or servicer portal, plus the Closing Disclosure or promissory note when needed.',
        enter: 'Complete the current creditor, rate, balance, payment, tax and insurance, payoff preference, and original loan details. Use the cannot-find option instead of guessing.'
      },
      fields: securedDebtFields(prefix, 'Property ' + index + ' first mortgage').concat([
        field(prefix + 'OriginalAmount', 'Property ' + index + ' - First mortgage original loan amount:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Original amount borrowed', allowUnknown: true }),
        field(prefix + 'StartDate', 'Property ' + index + ' - First mortgage original start date:', { required: true, placeholder: 'MM/DD/YYYY or Not sure', allowUnknown: true }),
        field(prefix + 'TermType', 'Property ' + index + ' - Fixed term or Adjustable term:', { required: true, type: 'select', choices: ['', 'Fixed term', 'Adjustable term', 'Not sure'] }),
        field(prefix + 'TermYears', 'Property ' + index + ' - First mortgage term:', { required: true, suffix: 'yrs', inputmode: 'numeric', placeholder: 'For example: 30 or 5', allowUnknown: true }),
        field(prefix + 'InterestOnly', 'Property ' + index + ' - Interest only loan:', { required: true, type: 'select', choices: ['', 'Yes', 'No', 'Not sure'], full: true })
      ])
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

  function secondMortgageTypeStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_second_mortgage_type',
      section: 'Existing real estate - Property ' + index,
      type: 'choice',
      field: prefix + 'SecondTermType',
      source: 'Scenario Desk - Page 1 - If Second Mortgage',
      title: 'Is Property ' + index + '\'s second lien a fixed-term loan or a HELOC?',
      plain: 'This determines whether a fixed term in years applies.',
      when: function (state) {
        return fullIntake(state) && propertyCount(state) >= index && state[prefix + 'HasSecondMortgage'] === 'Yes';
      },
      help: {
        meaning: 'A fixed-term second mortgage has a set repayment term. A HELOC is a revolving line of credit.',
        where: 'Use the second-mortgage or HELOC statement, promissory note, or online account.',
        enter: 'Choose Fixed term, HELOC, or Not sure.'
      },
      options: [
        option('Fixed term', 'Fixed term'),
        option('HELOC', 'HELOC'),
        option('Not sure', 'Not sure')
      ]
    };
  }

  function secondMortgageFieldsStep(index) {
    var prefix = 'property' + index + 'Second';
    var propertyPrefix = 'property' + index;
    return {
      id: propertyPrefix + '_second_mortgage',
      section: 'Existing real estate - Property ' + index,
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Current liabilities and If Second Mortgage',
      title: 'Property ' + index + ' - Second mortgage or HELOC information',
      plain: 'This combines the second-mortgage fields with the liability-table details for the same account.',
      when: function (state) {
        return fullIntake(state) && propertyCount(state) >= index && state[propertyPrefix + 'HasSecondMortgage'] === 'Yes';
      },
      help: {
        meaning: 'The current rate, balance, payment, tax and insurance, and payoff preference come from the liability table. Original amount and start date come from the mortgage-information section.',
        where: 'Use the current second-mortgage or HELOC statement, online account, Closing Disclosure, or promissory note.',
        enter: 'Complete the current account details and original loan information. Use the cannot-find option instead of guessing.'
      },
      fields: securedDebtFields(prefix, 'Property ' + index + ' second mortgage or HELOC').concat([
        field(prefix + 'OriginalAmount', 'Property ' + index + ' - Second mortgage original loan amount or HELOC limit:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Original amount or line limit', allowUnknown: true }),
        field(prefix + 'StartDate', 'Property ' + index + ' - Second mortgage original start date:', { required: true, placeholder: 'MM/DD/YYYY or Not sure', allowUnknown: true })
      ])
    };
  }

  function secondMortgageTermStep(index) {
    var prefix = 'property' + index;
    return {
      id: prefix + '_second_mortgage_term',
      section: 'Existing real estate - Property ' + index,
      type: 'fields',
      source: 'Scenario Desk - Page 1 - If Second Mortgage - Fixed term: yrs',
      title: 'Property ' + index + ' - Second mortgage fixed term',
      plain: 'This appears only when the second mortgage is a fixed-term loan.',
      when: function (state) {
        return fullIntake(state) && propertyCount(state) >= index && state[prefix + 'HasSecondMortgage'] === 'Yes' && state[prefix + 'SecondTermType'] === 'Fixed term';
      },
      help: {
        meaning: 'The fixed term is the original repayment period stated in years.',
        where: 'Use the promissory note, Closing Disclosure, or second-mortgage statement.',
        enter: 'Enter the fixed term in years. Use the cannot-find option instead of guessing.'
      },
      fields: [
        field(prefix + 'SecondTermYears', 'Property ' + index + ' - Fixed term:', { required: true, suffix: 'yrs', inputmode: 'numeric', full: true, placeholder: 'For example: 10, 15, or 20', allowUnknown: true })
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

  config.steps = config.steps.filter(function (step) {
    return !removeIds[step.id];
  });

  var purchaseSubjectStep = {
    id: 'purchase_subject_property',
    section: 'New home purchase',
    type: 'fields',
    source: 'Scenario Desk - Page 1 - Type of property and Type of residence',
    title: 'The home you are buying',
    plain: 'These questions describe the new property, not real estate you already own.',
    when: function (state) { return fullIntake(state) && purchase(state); },
    help: {
      meaning: 'Property type describes the building. Residence type describes how you plan to use the new home.',
      where: 'Use the listing, purchase contract, appraisal, HOA documents, or your current plan.',
      enter: 'Choose one property type and one residence type. Select Not sure when the answer is not yet known.'
    },
    fields: [
      field('propertyType', 'Type of property?', { required: true, type: 'select', choices: ['', 'Single family', 'Condo', 'Townhouse', 'Cooperative', '1-4 unit', 'Not sure'] }),
      field('residenceType', 'Type of residence?', { required: true, type: 'select', choices: ['', 'Primary', 'Vacation', 'Investment', 'Not sure'] })
    ]
  };

  var countOptions = [
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

  var countOptionsMinimumOne = countOptions.slice(1);
  var realEstateSteps = [
    purchaseSubjectStep,
    {
      id: 'existing_property_count_purchase',
      section: 'Existing real estate',
      type: 'choice',
      field: 'existingPropertyCount',
      source: 'Routing question added to support multiple properties',
      title: 'How many properties do you currently own?',
      plain: 'The same property, rent, appreciation, and mortgage questions will repeat for each property.',
      when: function (state) { return fullIntake(state) && purchase(state) && state.sellingHome !== 'Yes'; },
      help: {
        meaning: 'Count homes, vacation properties, rental properties, and 1-4 unit properties you currently own.',
        where: 'Use your own records or credit report if needed.',
        enter: 'Choose the total number of existing properties. Do not include the new home you are purchasing.'
      },
      twoColumn: true,
      options: countOptions
    },
    {
      id: 'existing_property_count_purchase_selling',
      section: 'Existing real estate',
      type: 'choice',
      field: 'existingPropertyCount',
      source: 'Routing question added to support multiple properties',
      title: 'How many properties do you currently own?',
      plain: 'Because a home is being sold, the count must include that property.',
      when: function (state) { return fullIntake(state) && purchase(state) && state.sellingHome === 'Yes'; },
      help: {
        meaning: 'Count the home being sold and every other property you currently own.',
        where: 'Use your own records or credit report if needed.',
        enter: 'Choose the total number of existing properties. Do not include the new home you are purchasing.'
      },
      twoColumn: true,
      options: countOptionsMinimumOne
    },
    {
      id: 'existing_property_count_refinance',
      section: 'Existing real estate',
      type: 'choice',
      field: 'existingPropertyCount',
      source: 'Routing question added to support multiple properties',
      title: 'How many properties do you currently own?',
      plain: 'Property 1 will be the property being refinanced. The same information will repeat for every additional property.',
      when: function (state) { return fullIntake(state) && refinance(state); },
      help: {
        meaning: 'Count the property being refinanced and all other real estate you currently own.',
        where: 'Use your own records or credit report if needed.',
        enter: 'Choose the total number of existing properties.'
      },
      twoColumn: true,
      options: countOptionsMinimumOne
    }
  ];

  for (var i = 1; i <= MAX_PROPERTIES; i += 1) {
    realEstateSteps.push(propertyProfileStep(i));
    realEstateSteps.push(refinanceDetailsStep(i));
    realEstateSteps.push(firstMortgageGateStep(i));
    realEstateSteps.push(firstMortgageFieldsStep(i));
    realEstateSteps.push(secondMortgageGateStep(i));
    realEstateSteps.push(secondMortgageTypeStep(i));
    realEstateSteps.push(secondMortgageFieldsStep(i));
    realEstateSteps.push(secondMortgageTermStep(i));
  }

  realEstateSteps.push({
    id: 'additional_properties_over_ten',
    section: 'Existing real estate - Additional properties',
    type: 'text',
    field: 'additionalPropertyDetails',
    source: 'Usability extension for clients with more than 10 properties',
    title: 'List the remaining properties not entered above',
    plain: 'For each additional property, include the address, type, use, value, rent, appreciation input, and all mortgage or HELOC information.',
    when: function (state) { return fullIntake(state) && state.existingPropertyCount === '10plus'; },
    help: {
      meaning: 'This preserves the same property-level information for properties beyond the ten structured sections.',
      where: 'Use property records, leases, and mortgage or HELOC statements.',
      enter: 'Use one paragraph or line per additional property and include every item requested.'
    },
    placeholder: 'Property 11: address | type/use | value | rent | appreciation | first mortgage | second mortgage or HELOC'
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
      field('sellingPrice', 'What is the sales price of the home you are selling?', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Expected sale price', allowUnknown: true }),
      field('realtorFee', 'Realtor fee?', { required: true, suffix: '%', inputmode: 'decimal', placeholder: 'For example: 5 or Not sure', allowUnknown: true })
    ]
  });

  var insertIndex = config.steps.findIndex(function (step) {
    return step.id === 'purchase_price';
  });
  if (insertIndex === -1) {
    insertIndex = config.steps.findIndex(function (step) {
      return step.id === 'tax_bracket_only';
    });
  }
  config.steps.splice.apply(config.steps, [insertIndex + 1, 0].concat(realEstateSteps));

  var liabilities = config.steps.find(function (step) {
    return step.id === 'liabilities';
  });
  if (liabilities) {
    liabilities.title = 'List all other current liabilities:*';
    liabilities.plain = 'Mortgages and HELOCs stay with the property they secure. Add every remaining debt here, including auto loans, student loans, credit cards, personal loans, and support obligations.';
    liabilities.help = {
      meaning: 'The paper form asks for all current liabilities. This online version groups property-secured debts with their property and captures every other debt here.',
      where: 'Use your credit report and the most recent statement for each non-property debt.',
      enter: 'Add one row per remaining debt. If every current debt is already listed with a property, choose the no-current-liabilities option.'
    };
  }
})();
