window.SCENARIO_DESK_BUILD = (function () {
  'use strict';

  function option(value, title, description) {
    return { value: value, title: title, description: description || '' };
  }

  function field(name, label, settings) {
    settings = settings || {};
    settings.name = name;
    settings.label = label;
    return settings;
  }

  function help(meaning, where, enter, note) {
    return {
      meaning: meaning || '',
      where: where || '',
      enter: enter || '',
      note: note || ''
    };
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

  var yesNo = [
    option('Yes', 'Yes'),
    option('No', 'No')
  ];

  var steps = [
    {
      id: 'application_status',
      section: 'Start',
      type: 'choice',
      field: 'applicationStatus',
      source: 'Routing question added for this online version',
      title: 'Have you already completed the online mortgage application and credit report?',
      plain: 'Your answer determines whether we skip information that should already be in your loan file.',
      help: help(
        'Choose Yes only when both the application and the credit report are complete.',
        'Look for the application-complete confirmation or sign in to your NEO application portal. If you are unsure, choose Not sure and we will show the full form.',
        'Select the answer that best describes where you are now.'
      ),
      options: [
        option('complete', 'Yes, both are complete', 'Skip standard application and credit-file questions.'),
        option('not_complete', 'No, one or both are not complete', 'Show every applicable question from the Scenario Desk form.'),
        option('unsure', 'I am not sure', 'Show the full form so nothing is missed.')
      ]
    },
    {
      id: 'transaction_type',
      section: 'Start',
      type: 'choice',
      field: 'transactionType',
      source: 'Routing question based on the two Page 1 sections',
      title: 'Which situation are we planning for?',
      plain: 'The original form has one section for a new purchase and another for refinancing a home you already own.',
      help: help(
        'A purchase means you are financing a home you plan to buy. A refinance means you are replacing or changing a mortgage on a home you already own.',
        'No document is needed.',
        'Choose New House Purchase or Existing House Refinance.'
      ),
      options: [
        option('purchase', 'New House Purchase'),
        option('refinance', 'Existing House Refinance')
      ]
    },
    {
      id: 'prep_notice',
      section: 'Start',
      type: 'notice',
      source: 'Preparation guidance added for clarity',
      title: 'A few documents can make this much easier.',
      plain: function (state) {
        return fullIntake(state)
          ? 'You do not need perfect numbers. Recent statements and reasonable estimates are enough for this first strategy conversation.'
          : 'Because your application and credit report are complete, most document-based questions will be skipped.';
      },
      bullets: function (state) {
        if (!fullIntake(state)) {
          return [
            'You may want your latest mortgage statement for any extra-payment questions.',
            'Have a rough idea of future purchases, savings you would use, and your preferred down payment.',
            'For questions that are estimates or preferences, there is no document to find.'
          ];
        }
        return [
          'A recent pay stub, W-2, tax return, or current profit-and-loss statement.',
          'Recent bank, brokerage, debt, and mortgage statements.',
          purchase(state)
            ? 'Your purchase contract or target price, plus any estimate for a home you may sell.'
            : 'A recent appraisal, agent value estimate, or your best estimate of the home value.',
          'It is acceptable to enter Not sure when you cannot find a number.'
        ];
      },
      help: help(
        'The form combines facts from documents with personal preferences and future goals.',
        'Gather only what you already have. Do not delay the form to obtain perfect figures.',
        'Use the most recent information available and label an estimate when needed.'
      )
    },

    /* Page 1 - Information */
    {
      id: 'primary_borrower',
      section: 'About you',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Information',
      title: 'Primary borrower information',
      plain: 'Use the legal name and date of birth that would appear on the mortgage application.',
      when: fullIntake,
      help: help(
        'The borrower is the person whose name and finances will be used for the loan.',
        'Use a government-issued photo ID, passport, or the information entered on your mortgage application.',
        'Enter the full legal name and date of birth.'
      ),
      fields: [
        field('borrower1Name', 'Name:*', { required: true, autocomplete: 'name', placeholder: 'Full legal name' }),
        field('borrower1Dob', 'Date of birth:', { type: 'date', autocomplete: 'bday' })
      ]
    },
    {
      id: 'second_borrower_gate',
      section: 'About you',
      type: 'choice',
      field: 'hasSecondBorrower',
      source: 'Routing question added for the second Name and Date of birth lines on Page 1',
      title: 'Will there be a second borrower on the loan?',
      plain: 'This could be a spouse, partner, family member, or anyone else applying with you.',
      when: fullIntake,
      help: help(
        'A second borrower is someone whose income, credit, assets, or debts will be included in the loan decision.',
        'No document is needed.',
        'Choose Yes only if another person will be an applicant on the loan.'
      ),
      options: yesNo
    },
    {
      id: 'second_borrower',
      section: 'About you',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - second Name and Date of birth',
      title: 'Second borrower information',
      plain: 'Use the second borrower\'s legal name and date of birth.',
      when: function (state) { return fullIntake(state) && state.hasSecondBorrower === 'Yes'; },
      help: help(
        'This is the other person applying for the loan.',
        'Use their government-issued photo ID, passport, or the information entered on the mortgage application.',
        'Enter their full legal name and date of birth.'
      ),
      fields: [
        field('borrower2Name', 'Name:*', { required: true, autocomplete: 'name', placeholder: 'Full legal name' }),
        field('borrower2Dob', 'Date of birth:', { type: 'date', autocomplete: 'bday' })
      ]
    },
    {
      id: 'current_address',
      section: 'About you',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Address, City, State, ZIP code, County',
      title: 'Current home address',
      plain: 'Enter the address where you currently live, not the property you may be buying.',
      when: fullIntake,
      help: help(
        'The county is the county for your current home address.',
        'Use your driver\'s license, utility bill, lease, mortgage statement, or bank statement. If the county is not shown, search the address online or use the county assessor website.',
        'Enter the complete current address, including county.'
      ),
      fields: [
        field('address', 'Address:*', { required: true, full: true, autocomplete: 'street-address', placeholder: 'Street address' }),
        field('city', 'City:*', { required: true, autocomplete: 'address-level2' }),
        field('state', 'State:*', { required: true, autocomplete: 'address-level1', placeholder: 'CA' }),
        field('zip', 'ZIP code:*', { required: true, autocomplete: 'postal-code', inputmode: 'numeric' }),
        field('county', 'County:*', { required: true, placeholder: 'For example: Los Angeles County' })
      ]
    },
    {
      id: 'email_address',
      section: 'About you',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Email Address(es)',
      title: 'Email Address(es):*',
      plain: 'Use the email address you monitor most often. Add a second email if another borrower should receive updates.',
      when: fullIntake,
      help: help(
        'This is the email address used for mortgage communication.',
        'No document is needed.',
        'Enter the primary email address. Add a second email address if another borrower should receive updates.'
      ),
      fields: [
        field('email1', 'Primary email address:*', { required: true, type: 'email', autocomplete: 'email', placeholder: 'you@example.com' }),
        field('email2', 'Second email address (optional)', { type: 'email', autocomplete: 'email', placeholder: 'second@example.com' })
      ]
    },
    {
      id: 'property_and_residence',
      section: 'Property',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Type of property and Type of residence',
      title: 'Property type and how the home will be used',
      plain: 'These are two separate questions: what kind of property it is, and whether it will be your primary, vacation, or investment home.',
      when: fullIntake,
      help: help(
        'A condo usually has individual unit ownership and an HOA. A cooperative is owned through shares in a corporation. A 1-4 unit property contains two to four separate living units.',
        'Check the listing, purchase contract, appraisal, HOA documents, or property tax record. Your intended use is your own plan.',
        'Choose one property type and one residence type.'
      ),
      fields: [
        field('propertyType', 'Type of property?', {
          required: true,
          type: 'select',
          choices: ['', 'Single family', 'Condo', 'Townhouse', 'Cooperative', '1-4 unit', 'Not sure']
        }),
        field('residenceType', 'Type of residence?', {
          required: true,
          type: 'select',
          choices: ['', 'Primary', 'Vacation', 'Investment', 'Not sure']
        })
      ]
    },
    {
      id: 'tax_and_income',
      section: 'Income',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Combined tax bracket and Most recent gross income',
      title: 'Tax bracket and gross income',
      plain: 'Gross income means income before taxes, insurance, retirement contributions, or other deductions.',
      when: fullIntake,
      help: help(
        'The combined tax bracket is an estimate of your federal and state marginal tax rates. It is not the percentage of tax you paid on all income. Most people do not know this number without checking.',
        'For gross income, use a recent pay stub, W-2, tax return, Social Security or pension statement, or current profit-and-loss statement. For the tax bracket, use your last tax return or ask your tax professional.',
        'Enter gross income before deductions and include the time period, such as $120,000 per year or $10,000 per month. Type Not sure when needed.',
        'This form does not provide tax advice.'
      ),
      fields: [
        field('taxBracket', 'Combined tax bracket:', { required: true, suffix: '%', inputmode: 'decimal', placeholder: 'For example: 35 or Not sure', allowUnknown: true }),
        field('grossIncome', 'Most recent gross income:*', { required: true, prefix: '$', placeholder: 'For example: 120,000 per year', allowUnknown: true })
      ]
    },

    {
      id: 'tax_bracket_only',
      section: 'Income',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Combined tax bracket',
      title: 'Combined tax bracket:',
      plain: 'Your completed application usually does not identify the combined federal and state marginal tax bracket used for planning.',
      when: function (state) { return !fullIntake(state); },
      help: help(
        'The combined tax bracket is an estimate of your federal and state marginal tax rates. It is not the percentage of tax paid on all income.',
        'Use your most recent tax return or ask your tax professional. If you do not know it, type Not sure.',
        'Enter a percentage or Not sure.',
        'This form does not provide tax advice.'
      ),
      fields: [
        field('taxBracket', 'Combined tax bracket: %', { required: true, suffix: '%', inputmode: 'decimal', full: true, placeholder: 'For example: 35 or Not sure', allowUnknown: true })
      ]
    },
  ];

  return { option: option, field: field, help: help, fullIntake: fullIntake, purchase: purchase, refinance: refinance, yesNo: yesNo, steps: steps };
})();
