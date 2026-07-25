(function (build) {
  'use strict';
  var option = build.option;
  var field = build.field;
  var help = build.help;
  var fullIntake = build.fullIntake;
  var purchase = build.purchase;
  var refinance = build.refinance;
  var yesNo = build.yesNo;
  var steps = build.steps;

  steps.push(
    {
      id: 'liabilities',
      section: 'Debts',
      type: 'liabilities',
      source: 'Scenario Desk - Page 1 - List all current liabilities',
      title: 'List all current liabilities:*',
      plain: 'Add each mortgage, HELOC, auto loan, student loan, credit card, personal loan, support obligation, or other debt. Utilities and normal monthly subscriptions do not belong here.',
      when: fullIntake,
      help: help(
        'Creditor is the company you pay. Rate is the interest rate. Balance is what remains owed. Principal and Interest is the monthly debt payment. Tax and Insurance applies mainly to mortgages. Payoff means whether this debt should be paid off as part of the strategy.',
        'Use your credit report and the most recent statement for each account. If the credit report is not available, use creditor websites or paper statements.',
        'Add one row per debt. You may choose I have no current liabilities.'
      )
    },

    /* Page 1 - Mortgage Information */
    {
      id: 'first_mortgage_gate',
      section: 'Mortgage details',
      type: 'choice',
      field: 'hasFirstMortgage',
      source: 'Routing question based on the Page 1 If First Mortgage section',
      title: 'Do you currently have a first mortgage?',
      plain: 'A first mortgage is the primary loan secured by a property you own.',
      when: fullIntake,
      help: help(
        'This is usually the main mortgage used to buy or refinance the property.',
        'Check your monthly mortgage statement or credit report.',
        'Choose Yes or No.'
      ),
      options: yesNo
    },
    {
      id: 'first_mortgage',
      section: 'Mortgage details',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - If First Mortgage',
      title: 'First mortgage information',
      plain: 'The original loan amount and start date usually come from your Closing Disclosure or promissory note.',
      when: function (state) { return fullIntake(state) && state.hasFirstMortgage === 'Yes'; },
      help: help(
        'Fixed means the interest rate does not change during the stated loan term. Adjustable means the rate can change after the initial fixed period. Interest only means the scheduled payment may not reduce principal during the interest-only period.',
        'Use the Closing Disclosure, promissory note, loan estimate, or current mortgage statement. Your servicer portal may also show the original amount and loan type.',
        'Enter the original amount, original start date, fixed or adjustable term and years, and whether the loan is interest only.'
      ),
      fields: [
        field('firstOriginalAmount', 'Original Loan Amount:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Original amount borrowed', allowUnknown: true }),
        field('firstStartDate', 'Original Start Date:', { required: true, placeholder: 'MM/DD/YYYY or Not sure', allowUnknown: true }),
        field('firstTermType', 'Fixed term or Adjustable term:', { required: true, type: 'select', choices: ['', 'Fixed term', 'Adjustable term', 'Not sure'] }),
        field('firstTermYears', 'Term: yrs', { required: true, suffix: 'yrs', inputmode: 'numeric', placeholder: 'For example: 30 or 5', allowUnknown: true }),
        field('firstInterestOnly', 'Interest only loan:', { required: true, type: 'select', choices: ['', 'Yes', 'No', 'Not sure'], full: true })
      ]
    },
    {
      id: 'second_mortgage_gate',
      section: 'Mortgage details',
      type: 'choice',
      field: 'hasSecondMortgage',
      source: 'Routing question based on the Page 1 If Second Mortgage section',
      title: 'Do you currently have a second mortgage or HELOC?',
      plain: 'A HELOC is a home equity line of credit secured by the property in addition to the first mortgage.',
      when: fullIntake,
      help: help(
        'A second mortgage can be a fixed loan or a reusable home equity line of credit.',
        'Check your credit report, monthly statement, or online account for any home-equity account.',
        'Choose Yes or No.'
      ),
      options: yesNo
    },
    {
      id: 'second_mortgage',
      section: 'Mortgage details',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - If Second Mortgage',
      title: 'Second mortgage information',
      plain: 'Identify whether the second lien is a fixed-term loan or a HELOC.',
      when: function (state) { return fullIntake(state) && state.hasSecondMortgage === 'Yes'; },
      help: help(
        'A fixed-term second mortgage has a set payoff schedule. A HELOC is a revolving line of credit that can usually be borrowed, repaid, and borrowed again during its draw period.',
        'Use the HELOC or second-mortgage statement, Closing Disclosure, promissory note, or online account.',
        'Choose the type, enter the fixed term in years when applicable, and provide the original amount and start date.'
      ),
      fields: [
        field('secondTermType', 'Fixed term or HELOC:', { required: true, type: 'select', choices: ['', 'Fixed term', 'HELOC', 'Not sure'] }),
        field('secondTermYears', 'Fixed term: yrs', { required: false, suffix: 'yrs', inputmode: 'numeric', placeholder: 'Leave blank for HELOC', allowUnknown: true }),
        field('secondOriginalAmount', 'Original Loan Amount:', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Original amount or line limit', allowUnknown: true }),
        field('secondStartDate', 'Original Start Date:', { required: true, placeholder: 'MM/DD/YYYY or Not sure', allowUnknown: true })
      ]
    },

    /* Page 2 - Information (Cont.) and Goals */
    {
      id: 'years_in_loan',
      section: 'Your goals',
      type: 'choice',
      field: 'yearsInLoan',
      source: 'Scenario Desk - Page 2 - Important Goals/Objectives',
      title: 'How many years do you think you will have this new loan, or live in this home?',
      plain: 'Use your best estimate. The answer helps compare upfront costs, loan terms, and break-even periods.',
      help: help(
        'This is your expected holding period for either the loan or the home. It does not have to be exact.',
        'No document is needed. Think about likely job, family, retirement, relocation, or investment plans.',
        'Choose the closest range.'
      ),
      twoColumn: true,
      options: [
        'Less than 1 year', '2-3 years', '4-5 years', '6-7 years', '8-10 years',
        '11-15 years', '16-20 years', '21-25 years', '26-30 years', 'More than 30 years'
      ].map(function (value) { return option(value, value); })
    },
    {
      id: 'payoff_timeline',
      section: 'Your goals',
      type: 'choice',
      field: 'payoffTimeline',
      source: 'Scenario Desk - Page 2 - Important Goals/Objectives',
      title: 'How soon would you like this home paid off?',
      plain: 'This asks about your ideal goal, not what you are required to do.',
      help: help(
        'Paying the home off means reducing the mortgage balance to zero.',
        'No document is needed. Choose the timeline that best reflects your preference.',
        'Choose one range, including Never if paying off the home is not a goal.'
      ),
      twoColumn: true,
      options: [
        'Less than 5 years', '6-10 years', '11-15 years', '16-20 years',
        '20-30 years', 'More than 30 years', 'Never'
      ].map(function (value) { return option(value, value); })
    },
    {
      id: 'liquid_assets',
      section: 'Assets',
      type: 'choice',
      field: 'liquidAssets',
      source: 'Scenario Desk - Page 2 - Information (Cont.)',
      title: 'What is the approximate combined value of all your liquid assets from bank accounts, mutual funds, CDs and securities?',
      plain: 'Liquid assets are funds that can generally be converted to cash without selling real estate.',
      when: fullIntake,
      help: help(
        'Include checking, savings, money-market accounts, certificates of deposit, and marketable investments. Do not include the value of your home.',
        'Use the latest bank, brokerage, mutual-fund, and CD statements. Add the current balances together.',
        'Choose the range containing the approximate total.'
      ),
      options: [
        option('$25,000 or less', '$25,000 or less'),
        option('$26,000-$125,000', '$26,000-$125,000'),
        option('$126,000 or above', '$126,000 or above')
      ]
    },
    {
      id: 'extra_debt',
      section: 'Your goals',
      type: 'choice',
      field: 'extraDebtPayments',
      source: 'Scenario Desk - Page 2 - Information (Cont.)',
      title: 'Are you making any additional monthly payments toward debt?',
      plain: 'This means paying more than the minimum or scheduled payment.',
      help: help(
        'Examples include extra mortgage principal, additional credit-card payments, or paying more than required on an auto or student loan.',
        'Compare your required payments with your actual bank payments or automatic transfers.',
        'Choose Yes or No.'
      ),
      options: yesNo
    },
    {
      id: 'extra_debt_amount',
      section: 'Your goals',
      type: 'fields',
      source: 'Scenario Desk - Page 2 - If yes, how much',
      title: 'If yes, how much?',
      plain: 'Enter the total extra amount you pay toward debt each month.',
      when: function (state) { return state.extraDebtPayments === 'Yes'; },
      help: help(
        'Only include the amount above required minimum payments.',
        'Use recent statements and bank activity.',
        'Enter one combined monthly dollar amount.'
      ),
      fields: [
        field('extraDebtAmount', 'Additional monthly debt payment: $', { required: true, prefix: '$', inputmode: 'decimal', full: true, placeholder: 'Extra amount each month', allowUnknown: true })
      ]
    },
    {
      id: 'major_purchases',
      section: 'Your goals',
      type: 'choice',
      field: 'majorPurchases',
      source: 'Scenario Desk - Page 2 - Information (Cont.)',
      title: 'Do you have any major purchases planned in the next 3 years?',
      plain: 'Examples include a renovation, tuition, business investment, vehicle, another property, wedding, or retirement transition.',
      help: help(
        'This helps protect cash that may be needed for another important goal.',
        'No document is required. Think about known or likely large expenses during the next three years.',
        'Choose Yes or No.'
      ),
      options: yesNo
    },
    {
      id: 'major_purchase_purpose',
      section: 'Your goals',
      type: 'text',
      field: 'majorPurchasePurpose',
      source: 'Scenario Desk - Page 2 - If yes, purpose',
      title: 'If yes, purpose:',
      plain: 'A short description is enough. Include timing and a rough amount if known.',
      when: function (state) { return state.majorPurchases === 'Yes'; },
      help: help(
        'The purpose tells Daryn what future cash need the mortgage strategy should protect.',
        'No document is required. Use your current plans or estimates.',
        'Describe the purchase, expected timing, and approximate amount if known.'
      ),
      placeholder: 'For example: $40,000 kitchen renovation in about 18 months'
    },
    {
      id: 'closing_costs',
      section: 'Loan preferences',
      type: 'choice',
      field: 'rollClosingCosts',
      source: 'Scenario Desk - Page 2 - Information (Cont.)',
      title: 'Roll closing costs into loan?',
      plain: 'This asks whether you prefer to reduce cash due at closing by financing eligible costs when the loan program allows it.',
      help: help(
        'Rolling costs into the loan can increase the loan balance and payment. On some transactions, similar cash savings may be achieved through lender or seller credits instead.',
        'No document is required. This is a preference, not a final loan decision.',
        'Choose Yes if minimizing cash due is the priority, or No if you prefer to pay costs separately.',
        'Availability depends on the transaction and loan program.'
      ),
      options: yesNo
    },
    {
      id: 'payment_preference',
      section: 'Loan preferences',
      type: 'choice',
      field: 'paymentPreference',
      source: 'Scenario Desk - Page 2 - Option 1 and Option 2',
      title: 'Select the option below that best describes your preference:',
      plain: 'Choose the approach that sounds closer to your priorities. Daryn will model the actual numbers before recommending a structure.',
      help: help(
        'Principal is the amount of the loan balance being paid down. A lower scheduled payment may reduce principal more slowly. A higher payment can reduce principal faster.',
        'No document is required. Choose based on your preference for monthly cash flow versus faster balance reduction.',
        'Select Option 1 or Option 2.',
        'The tax effect depends on your personal circumstances. This is not tax advice.'
      ),
      options: [
        option('Option 1', 'Option 1', 'Lower payment - Higher tax deduction - Pay little or no principal'),
        option('Option 2', 'Option 2', 'Higher payment - Lower tax deduction - Pay principal each month')
      ]
    },
    {
      id: 'risk_pyramid',
      section: 'Loan preferences',
      type: 'risk',
      field: 'riskPreference',
      source: 'Scenario Desk - Page 2 - Risk Pyramid',
      title: 'Please indicate the best match, based on your preference between a fixed and adjustable interest rate.',
      plain: 'A fixed rate stays the same for the stated term. An adjustable-rate mortgage, or ARM, can change after its initial period.',
      help: help(
        'Aggressive accepts more possible rate and payment change for a potentially lower starting payment. Moderate accepts limited or delayed change. Conservative favors payment stability.',
        'No document is required. Think about how you would feel if the payment could rise later and how long you expect to keep the loan.',
        'Choose A, B, or C. This identifies a preference; it does not commit you to a product.',
        'Even with a fixed interest rate, the total monthly payment can change if property taxes, homeowners insurance, mortgage insurance, or association dues change.'
      ),
      options: [
        option('A: Aggressive', 'A: Aggressive', 'Greater volatility - Lowest payment'),
        option('B: Moderate', 'B: Moderate', 'Predictable volatility - Intermediate payment'),
        option('C: Conservative', 'C: Conservative', 'No volatility - Highest payment')
      ]
    },
    {
      id: 'key_objectives',
      section: 'Your goals',
      type: 'text',
      field: 'keyObjectives',
      source: 'Scenario Desk - Page 2 - Important Goals/Objectives',
      title: 'My key objectives (e.g., "Pay off all debts and free up cash flow").',
      plain: 'List the outcomes you want the mortgage strategy to support. More than one objective is fine.',
      help: help(
        'Objectives can include payment comfort, preserving cash, paying debt, buying before selling, retiring, renovating, investing, or creating financial flexibility.',
        'No document is required. Use your own priorities.',
        'Write a short list or sentence in your own words.'
      ),
      placeholder: 'For example: keep six months of reserves, lower total debt payments, and pay the home off before retirement'
    },
    {
      id: 'one_thing',
      section: 'Your goals',
      type: 'text',
      field: 'oneThing',
      source: 'Scenario Desk - Page 2 - Important Goals/Objectives',
      title: 'If you could only accomplish one thing, what would it be?',
      plain: 'This answer becomes the main standard used to compare the available strategies.',
      help: help(
        'When goals compete, identifying the top priority helps decide which tradeoffs are acceptable.',
        'No document is required.',
        'Complete the sentence in one clear statement.'
      ),
      placeholder: 'The one outcome that matters most is...'
    },
    {
      id: 'review',
      section: 'Review',
      type: 'review',
      source: 'Advisor summary',
      title: 'Review your Scenario Desk responses'
    }
  );

  window.SCENARIO_DESK_CONFIG = { version: 'source-based-3.0', steps: steps };
})(window.SCENARIO_DESK_BUILD);
