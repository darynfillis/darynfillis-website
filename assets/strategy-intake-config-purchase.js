(function () {
  'use strict';
  var build = window.SCENARIO_DESK_BUILD;
  if (!build) return;
  var option = build.option;
  var field = build.field;
  var help = build.help;
  var fullIntake = build.fullIntake;
  var purchase = build.purchase;
  var refinance = build.refinance;
  var yesNo = build.yesNo;
  build.steps.push(
    /* Purchase branch */
    {
      id: 'selling_home_gate',
      section: 'Purchase',
      type: 'choice',
      field: 'sellingHome',
      source: 'Routing question added for the Page 1 home-sale fields',
      title: 'Are you selling a home as part of this purchase?',
      plain: 'If you answer No, we will skip every question about the home being sold, including its expected sales price and Realtor fee.',
      when: purchase,
      help: help(
        'Choose Yes when a current home will be sold before, during, or shortly after this purchase and the sale is part of the financial plan. Choose No when no home sale is involved.',
        'No document is needed for this routing question.',
        'Choose Yes or No.'
      ),
      options: yesNo
    },
    {
      id: 'purchase_price',
      section: 'Purchase',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - New House Purchase Only',
      title: 'What is the purchase price?',
      plain: 'Use the contract price if you are under contract. If you are still shopping, use the target price you want us to model.',
      when: function (state) { return fullIntake(state) && purchase(state); },
      help: help(
        'The purchase price is the agreed or expected price of the home before your down payment.',
        'Use the signed purchase agreement, accepted offer, listing, or your target budget.',
        'Enter a dollar amount. An estimate is acceptable if you are not under contract.'
      ),
      fields: [
        field('purchasePrice', 'What is the purchase price? $', { required: true, prefix: '$', inputmode: 'decimal', full: true, placeholder: 'Purchase or target price', allowUnknown: true })
      ]
    },
    {
      id: 'sale_details_full',
      section: 'Purchase',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - New House Purchase Only',
      title: 'Home-sale details',
      plain: 'These figures help estimate how much cash may be available after the sale.',
      when: function (state) { return fullIntake(state) && purchase(state) && state.sellingHome === 'Yes'; },
      help: help(
        'The sales price is the expected gross price before the mortgage payoff, commissions, and other sale costs. Realtor fee is the percentage stated in your listing or brokerage agreement.',
        'Use a signed sale contract, agent comparative market analysis, listing agreement, or your agent\'s estimate.',
        'Enter the expected sales price and Realtor fee percentage. Type Not sure when needed.'
      ),
      fields: [
        field('sellingPrice', 'What is the sales price of the home you are selling? $', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Expected sale price', allowUnknown: true }),
        field('realtorFee', 'Realtor fee? %', { required: true, suffix: '%', inputmode: 'decimal', placeholder: 'For example: 5 or Not sure', allowUnknown: true })
      ]
    },
    {
      id: 'realtor_fee_only',
      section: 'Purchase',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Realtor fee',
      title: 'Realtor fee? %',
      plain: 'Your application may include the expected sale price, but it may not identify the fee percentage used for planning.',
      when: function (state) { return !fullIntake(state) && purchase(state) && state.sellingHome === 'Yes'; },
      help: help(
        'This is the percentage stated in the listing or brokerage agreement for the home you are selling.',
        'Use your listing agreement or ask your real estate agent.',
        'Enter the percentage or type Not sure.'
      ),
      fields: [
        field('realtorFee', 'Realtor fee? %', { required: true, suffix: '%', inputmode: 'decimal', full: true, placeholder: 'For example: 5 or Not sure', allowUnknown: true })
      ]
    },
    {
      id: 'additional_savings',
      section: 'Purchase',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - New House Purchase Only',
      title: 'What additional savings do you have available that you would consider utilizing for this purchase?',
      plain: 'This is not asking for every dollar you own. It is the additional amount you would realistically consider using.',
      when: purchase,
      help: help(
        'Think about checking, savings, money-market, brokerage, or other accessible funds you might use beyond the amount already planned.',
        'Use recent bank or brokerage statements. Do not include money you are unwilling to use or funds that must remain as emergency reserves.',
        'Enter the amount you would consider using, or 0 if none.'
      ),
      fields: [
        field('additionalSavings', 'Additional savings available for this purchase: $', { required: true, prefix: '$', inputmode: 'decimal', full: true, placeholder: 'Amount you would consider using', allowUnknown: true })
      ]
    },
    {
      id: 'ideal_down_payment',
      section: 'Purchase',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - New House Purchase Only',
      title: 'Ideally, what amount would you like to consider as your down payment for this purchase?',
      plain: 'This is your preferred amount, not necessarily the maximum amount you could use.',
      when: purchase,
      help: help(
        'The down payment is the part of the purchase price paid from your own funds rather than borrowed.',
        'No specific document is required. You can use your current plan, savings target, or the amount shown in your purchase strategy.',
        'Enter a preferred dollar amount. Type Not sure if you want Daryn to compare several options.'
      ),
      fields: [
        field('idealDownPayment', 'Ideal down payment: $', { required: true, prefix: '$', inputmode: 'decimal', full: true, placeholder: 'Preferred amount or Not sure', allowUnknown: true })
      ]
    },

    /* Refinance branch */
    {
      id: 'refinance_details',
      section: 'Refinance',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Existing House Refinance Only',
      title: 'Current value and cash-out request',
      plain: 'Enter 0 for cash out if you do not want to take money from the home.',
      when: function (state) { return fullIntake(state) && refinance(state); },
      help: help(
        'Current value means your best estimate of today\'s market value, not the county tax-assessed value. Cash out is the amount you want to receive from the new loan after existing liens are paid.',
        'Use a recent appraisal, agent comparative market analysis, or a reasonable market estimate. Use your own goal for the cash-out amount.',
        'Enter the current value, the cash-out amount, and the purpose. Use 0 and Not applicable when there is no cash out.'
      ),
      fields: [
        field('currentValue', 'Current value:* $', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Estimated current market value', allowUnknown: true }),
        field('cashOutRequested', 'Cash-out requested?: $', { required: true, prefix: '$', inputmode: 'decimal', placeholder: 'Enter 0 if none', allowUnknown: true }),
        field('cashOutPurpose', 'Purpose of cash out:', { required: true, full: true, placeholder: 'For example: renovation, debt payoff, reserves, or Not applicable' })
      ]
    },

    /* Page 1 - Cash Flow */
    {
      id: 'cash_out_purpose_only',
      section: 'Refinance',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Existing House Refinance Only - Purpose of cash out',
      title: 'Purpose of cash out:',
      plain: 'Your completed application may show the amount requested. This question explains what the money would be used for.',
      when: function (state) { return !fullIntake(state) && refinance(state); },
      help: help(
        'Cash out means receiving money from the equity in the home through the new loan. If you are not requesting cash out, enter Not applicable.',
        'No document is required. Use the purpose you discussed in the application or your current plan.',
        'Describe the purpose in a few words, such as renovation, debt payoff, reserves, another property, or Not applicable.'
      ),
      fields: [
        field('cashOutPurpose', 'Purpose of cash out:', { required: true, full: true, placeholder: 'For example: renovation, debt payoff, reserves, or Not applicable' })
      ]
    },

    {
      id: 'rent_collected',
      section: 'Cash flow',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Cash Flow',
      title: 'Do you collect rent on any properties?',
      plain: 'Enter the total gross rent received each month before expenses. Enter 0 if you do not collect rent.',
      when: fullIntake,
      help: help(
        'Gross rent is the rent paid by tenants before mortgage payments, taxes, insurance, repairs, management, or other expenses.',
        'Use current lease agreements, rent rolls, deposit records, or recent bank activity.',
        'Enter the combined monthly dollar amount, or 0.'
      ),
      fields: [
        field('rentCollected', 'Rent collected: $', { required: true, prefix: '$', inputmode: 'decimal', full: true, placeholder: 'Monthly gross rent; enter 0 if none', allowUnknown: true })
      ]
    },
    {
      id: 'monthly_prepayments',
      section: 'Cash flow',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Cash Flow',
      title: 'Do you make additional monthly prepayments?',
      plain: 'This means money paid above the required minimum payment, especially extra principal paid toward a mortgage. The original form asks a similar debt-payment question again on Page 2, so both questions are retained.',
      help: help(
        'For example, if your required mortgage payment is $3,000 and you normally pay $3,500, the additional prepayment is $500.',
        'Compare your required payment on the latest statement with the amount that leaves your bank account each month.',
        'Enter the extra monthly amount, or 0 if you do not make additional payments.'
      ),
      fields: [
        field('monthlyPrepayments', 'Additional monthly prepayments: $', { required: true, prefix: '$', inputmode: 'decimal', full: true, placeholder: 'Extra amount each month; enter 0 if none', allowUnknown: true })
      ]
    },
    {
      id: 'property_appreciation',
      section: 'Cash flow',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Cash Flow',
      title: 'What appreciation rate do you expect on any property you own?',
      plain: 'This is a planning assumption used to compare scenarios. It is not a forecast or promise.',
      help: help(
        'Appreciation is the estimated annual percentage change in property value.',
        'There is no required document. Use your own assumption, a conservative planning estimate, or type Not sure so Daryn can discuss it with you.',
        'Enter an annual percentage or Not sure.',
        'Future property values are uncertain.'
      ),
      fields: [
        field('propertyAppreciation', 'Expected property appreciation rate: %', { required: true, suffix: '%', inputmode: 'decimal', full: true, placeholder: 'Annual percentage or Not sure', allowUnknown: true })
      ]
    },
    {
      id: 'investment_appreciation',
      section: 'Cash flow',
      type: 'fields',
      source: 'Scenario Desk - Page 1 - Cash Flow',
      title: 'What appreciation rate do you expect on any investments you make?',
      plain: 'This is the return assumption used when comparing money placed into the home with money kept or invested elsewhere.',
      help: help(
        'This is a hypothetical annual return assumption, not a guaranteed investment result.',
        'There is no required document. You may use your own planning assumption, a statement projection, or type Not sure.',
        'Enter an annual percentage or Not sure.',
        'Investment returns are uncertain and this is not investment advice.'
      ),
      fields: [
        field('investmentAppreciation', 'Expected investment appreciation rate: %', { required: true, suffix: '%', inputmode: 'decimal', full: true, placeholder: 'Annual percentage or Not sure', allowUnknown: true })
      ]
    },
  );
})();
