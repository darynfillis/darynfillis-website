window.SCENARIO_DESK_CONFIG = (function () {
  'use strict';

  function option(value, title, description) {
    return { value: value, title: title, description: description || '' };
  }

  function field(name, label, type, options) {
    return { name: name, label: label, type: type || 'text', options: options || {} };
  }

  var yesNo = [option('Yes', 'Yes'), option('No', 'No')];

  return {
    version: 'source-based-2.0',
    steps: [
      {
        id: 'application_status',
        type: 'choice',
        field: 'applicationComplete',
        kicker: 'Routing question',
        title: 'Have you already completed the online application and credit report?',
        description: 'This is the only added question used to skip information already expected in the application and credit file.',
        options: [
          option('Yes', 'Yes', 'Both the online application and credit report are complete.'),
          option('No', 'No', 'One or both are not complete.')
        ]
      },
      {
        id: 'transaction_type',
        type: 'choice',
        field: 'transactionType',
        kicker: 'Routing question',
        title: 'Is this for a New House Purchase or Existing House Refinance?',
        description: 'These are the two scenario sections shown on Page 1 of the source form.',
        options: [
          option('New House Purchase', 'New House Purchase'),
          option('Existing House Refinance', 'Existing House Refinance')
        ]
      },
      {
        id: 'filtered_notice',
        type: 'notice',
        kicker: 'Application fields skipped',
        title: 'We will not ask for information already expected in the application and credit file.',
        description: 'The remaining questions below are taken from the supplied Scenario Desk form.',
        when: function (s) { return s.applicationComplete === 'Yes'; },
        bullets: [
          'Skipped: identity and contact information, gross income, property and occupancy, transaction facts, rental income, liquid assets, liabilities, and current mortgage details.',
          'Retained: source-form planning and preference questions not treated as standard application facts in this mockup.',
          'The exact skip map can be refined against the actual online application before deployment.'
        ]
      },
      {
        id: 'full_notice',
        type: 'notice',
        kicker: 'Page 1 included',
        title: 'We will complete the applicable Page 1 sections before continuing to Page 2.',
        description: 'All client-facing questions remain based on the supplied form.',
        when: function (s) { return s.applicationComplete === 'No'; },
        bullets: [
          'General borrower, property, income, cash-flow, liability, and mortgage information.',
          'The New House Purchase or Existing House Refinance section selected above.',
          'Important Goals/Objectives from Page 2.'
        ]
      },
      {
        id: 'borrower_information',
        type: 'group',
        kicker: 'Page 1 - Information',
        title: 'Information',
        when: function (s) { return s.applicationComplete === 'No'; },
        fields: [
          field('borrower1Name', 'Name:*', 'text', { required: true }),
          field('borrower1Dob', 'Date of birth:', 'date'),
          field('borrower2Name', 'Name:* (second borrower, if applicable)'),
          field('borrower2Dob', 'Date of birth: (second borrower)', 'date'),
          field('address', 'Address:*', 'text', { required: true, full: true }),
          field('email', 'Email Address(es):*', 'email', { required: true, full: true }),
          field('city', 'City:*', 'text', { required: true }),
          field('state', 'State:*', 'text', { required: true }),
          field('zip', 'ZIP code:*', 'text', { required: true }),
          field('county', 'County:*', 'text', { required: true })
        ]
      },
      {
        id: 'property_income',
        type: 'group',
        kicker: 'Page 1 - Information',
        title: 'Property and income information',
        when: function (s) { return s.applicationComplete === 'No'; },
        fields: [
          field('propertyType', 'Type of property?', 'select', { choices: ['', 'Single family', 'Condo', 'Townhouse', 'Cooperative', '1-4 unit'] }),
          field('residenceType', 'Type of residence?', 'select', { choices: ['', 'Primary', 'Vacation', 'Investment'] }),
          field('taxBracket', 'Combined tax bracket:', 'number', { suffix: '%' }),
          field('grossIncome', 'Most recent gross income:*', 'number', { prefix: '$', required: true })
        ]
      },
      {
        id: 'purchase_details',
        type: 'group',
        kicker: 'Page 1 - New House Purchase Only',
        title: 'New House Purchase Only:',
        when: function (s) { return s.applicationComplete === 'No' && s.transactionType === 'New House Purchase'; },
        fields: [
          field('purchasePrice', 'What is the purchase price?', 'number', { prefix: '$' }),
          field('sellingPrice', 'What is the sales price of the home you are selling?', 'number', { prefix: '$' }),
          field('realtorFee', 'Realtor fee?', 'number', { suffix: '%' }),
          field('additionalSavings', 'What additional savings do you have available that you would consider utilizing for this purchase?', 'number', { prefix: '$' }),
          field('idealDownPayment', 'Ideally, what amount would you like to consider as your down payment for this purchase?', 'number', { prefix: '$', full: true })
        ]
      },
      {
        id: 'purchase_planning',
        type: 'group',
        kicker: 'Page 1 - New House Purchase Only',
        title: 'New House Purchase Only:',
        description: 'These source-form planning fields remain after the application questions are filtered out.',
        when: function (s) { return s.applicationComplete === 'Yes' && s.transactionType === 'New House Purchase'; },
        fields: [
          field('realtorFee', 'Realtor fee?', 'number', { suffix: '%' }),
          field('additionalSavings', 'What additional savings do you have available that you would consider utilizing for this purchase?', 'number', { prefix: '$' }),
          field('idealDownPayment', 'Ideally, what amount would you like to consider as your down payment for this purchase?', 'number', { prefix: '$', full: true })
        ]
      },
      {
        id: 'refinance_details',
        type: 'group',
        kicker: 'Page 1 - Existing House Refinance Only',
        title: 'Existing House Refinance Only:',
        when: function (s) { return s.applicationComplete === 'No' && s.transactionType === 'Existing House Refinance'; },
        fields: [
          field('currentValue', 'Current value:*', 'number', { prefix: '$', required: true }),
          field('cashOutRequested', 'Cash-out requested?:', 'number', { prefix: '$' }),
          field('cashOutPurpose', 'Purpose of cash out:', 'text', { full: true })
        ]
      },
      {
        id: 'cash_flow',
        type: 'group',
        kicker: 'Page 1 - Cash Flow',
        title: 'Cash Flow:',
        when: function (s) { return s.applicationComplete === 'No'; },
        fields: [
          field('rentCollected', 'Do you collect rent on any properties?', 'number', { prefix: '$' }),
          field('monthlyPrepayments', 'Do you make additional monthly prepayments?', 'number', { prefix: '$' }),
          field('propertyAppreciation', 'What appreciation rate do you expect on any property you own?', 'number', { suffix: '%' }),
          field('investmentAppreciation', 'What appreciation rate do you expect on any investments you make?', 'number', { suffix: '%' })
        ]
      },
      {
        id: 'retained_page1',
        type: 'group',
        kicker: 'Page 1 - Planning Questions',
        title: 'Planning questions retained from Page 1',
        description: 'These are source-form questions not treated as standard application or credit-report fields in this mockup.',
        when: function (s) { return s.applicationComplete === 'Yes'; },
        fields: [
          field('taxBracket', 'Combined tax bracket:', 'number', { suffix: '%' }),
          field('monthlyPrepayments', 'Do you make additional monthly prepayments?', 'number', { prefix: '$' }),
          field('propertyAppreciation', 'What appreciation rate do you expect on any property you own?', 'number', { suffix: '%' }),
          field('investmentAppreciation', 'What appreciation rate do you expect on any investments you make?', 'number', { suffix: '%' })
        ]
      },
      {
        id: 'liabilities',
        type: 'text',
        field: 'liabilities',
        kicker: 'Page 1 - Current Liabilities',
        title: 'List all current liabilities:*',
        description: 'For each liability, include Type, Creditor, Rate, Balance, Prin. & Interest, Tax & Insurance, and whether it will be paid off.',
        placeholder: 'Example: Auto loan | Creditor | 6.5% | $18,000 | $425 | $0 | Payoff: No',
        when: function (s) { return s.applicationComplete === 'No'; }
      },
      {
        id: 'mortgage_information',
        type: 'group',
        kicker: 'Page 1 - Mortgage Information',
        title: 'Mortgage Information',
        description: 'Leave the First Mortgage or Second Mortgage fields blank if they do not apply.',
        when: function (s) { return s.applicationComplete === 'No'; },
        fields: [
          field('firstOriginalAmount', 'If First Mortgage - Original Loan Amount:', 'number', { prefix: '$' }),
          field('firstStartDate', 'If First Mortgage - Original Start Date:', 'date'),
          field('firstTermType', 'If First Mortgage - Fixed term or Adjustable term:', 'select', { choices: ['', 'Fixed term', 'Adjustable term'] }),
          field('firstTermYears', 'If First Mortgage - Term:', 'number', { suffix: 'yrs' }),
          field('firstInterestOnly', 'If First Mortgage - Interest only loan:', 'select', { choices: ['', 'Yes', 'No'] }),
          field('secondTermType', 'If Second Mortgage - Fixed term or HELOC:', 'select', { choices: ['', 'Fixed term', 'HELOC'] }),
          field('secondTermYears', 'If Second Mortgage - Fixed term:', 'number', { suffix: 'yrs' }),
          field('secondOriginalAmount', 'If Second Mortgage - Original Loan Amount:', 'number', { prefix: '$' }),
          field('secondStartDate', 'If Second Mortgage - Original Start Date:', 'date')
        ]
      },
      {
        id: 'years_in_loan',
        type: 'choice',
        field: 'yearsInLoan',
        kicker: 'Page 2 - Important Goals/Objectives',
        title: 'How many years do you think you will have this new loan, or live in this home?',
        twoColumn: true,
        options: ['Less than 1 year','2-3 years','4-5 years','6-7 years','8-10 years','11-15 years','16-20 years','21-25 years','26-30 years','More than 30 years'].map(function (v) { return option(v, v); })
      },
      {
        id: 'payoff_timeline',
        type: 'choice',
        field: 'payoffTimeline',
        kicker: 'Page 2 - Important Goals/Objectives',
        title: 'How soon would you like this home paid off?',
        twoColumn: true,
        options: ['Less than 5 years','6-10 years','11-15 years','16-20 years','20-30 years','More than 30 years','Never'].map(function (v) { return option(v, v); })
      },
      {
        id: 'liquid_assets',
        type: 'choice',
        field: 'liquidAssets',
        kicker: 'Page 2 - Information (Cont.)',
        title: 'What is the approximate combined value of all your liquid assets from bank accounts, mutual funds, CDs and securities?',
        when: function (s) { return s.applicationComplete === 'No'; },
        options: ['$25,000 or less','$26,000-$125,000','$126,000 or above'].map(function (v) { return option(v, v); })
      },
      {
        id: 'extra_debt',
        type: 'choice',
        field: 'extraDebtPayments',
        kicker: 'Page 2 - Information (Cont.)',
        title: 'Are you making any additional monthly payments toward debt?',
        options: yesNo
      },
      {
        id: 'extra_debt_amount',
        type: 'text',
        field: 'extraDebtAmount',
        kicker: 'Page 2 - Information (Cont.)',
        title: 'If yes, how much:',
        placeholder: '$',
        when: function (s) { return s.extraDebtPayments === 'Yes'; }
      },
      {
        id: 'major_purchases',
        type: 'choice',
        field: 'majorPurchases',
        kicker: 'Page 2 - Information (Cont.)',
        title: 'Do you have any major purchases planned in the next 3 years?',
        options: yesNo
      },
      {
        id: 'major_purchase_purpose',
        type: 'text',
        field: 'majorPurchasePurpose',
        kicker: 'Page 2 - Information (Cont.)',
        title: 'If yes, purpose:',
        when: function (s) { return s.majorPurchases === 'Yes'; }
      },
      {
        id: 'closing_costs',
        type: 'choice',
        field: 'rollClosingCosts',
        kicker: 'Page 2 - Information (Cont.)',
        title: 'Roll closing costs into loan?',
        options: yesNo
      },
      {
        id: 'payment_preference',
        type: 'choice',
        field: 'paymentPreference',
        kicker: 'Page 2 - Information (Cont.)',
        title: 'Select the option below that best describes your preference:',
        options: [
          option('Option 1', 'Option 1', 'Lower payment - Higher tax deduction - Pay little or no principal'),
          option('Option 2', 'Option 2', 'Higher payment - Lower tax deduction - Pay principal each month')
        ]
      },
      {
        id: 'risk_pyramid',
        type: 'choice',
        field: 'riskPreference',
        kicker: 'Page 2 - Risk Pyramid',
        title: 'Please indicate the best match, based on your preference between a fixed and adjustable interest rate.',
        options: [
          option('A: Aggressive', 'A: Aggressive', 'Greater volatility - Lowest payment'),
          option('B: Moderate', 'B: Moderate', 'Predictable volatility - Intermediate payment'),
          option('C: Conservative', 'C: Conservative', 'No volatility - Highest payment')
        ]
      },
      {
        id: 'key_objectives',
        type: 'text',
        field: 'keyObjectives',
        kicker: 'Page 2 - Important Goals/Objectives',
        title: 'My key objectives (e.g., “Pay off all debts and free up cash flow”).',
        placeholder: 'Type your response...'
      },
      {
        id: 'one_thing',
        type: 'text',
        field: 'oneThing',
        kicker: 'Page 2 - Important Goals/Objectives',
        title: 'If you could only accomplish one thing, what would it be?',
        placeholder: 'Type your response...'
      },
      { id: 'review', type: 'review', kicker: 'Review' }
    ]
  };
})();
