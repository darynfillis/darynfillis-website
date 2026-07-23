window.STRATEGY_INTAKE_CONFIG = (function () {
  'use strict';

  var secureApplicationUrl = 'https://neohomeloans.com/start/r/130676';

  function option(value, title, description) {
    return { value: value, title: title, description: description || '' };
  }

  var steps = [
    {
      id: 'application_status',
      type: 'choice',
      field: 'applicationStatus',
      kicker: 'Start here',
      title: 'How far have you already gone with the secure NEO application?',
      description: 'Your answer controls what this intake skips. We will not ask you to re-enter information that already belongs in your loan file.',
      options: [
        option('complete', 'I completed the application and the credit report', 'Skip application-style questions and go directly to strategy.'),
        option('app_only', 'I completed the application, but not the credit report', 'Keep credit authorization in the secure application and continue with strategy here.'),
        option('not_started', 'I have not completed the application', 'Use this intake for strategy, then complete financial details securely.'),
        option('unsure', 'I am not sure', 'Keep this intake non-sensitive and let Daryn identify what is still needed.')
      ]
    },
    {
      id: 'application_note',
      type: 'notice',
      kicker: 'Keep sensitive data secure',
      title: 'This intake will not duplicate the mortgage application.',
      description: 'Identity, employment, income, assets, liabilities, real estate owned, and credit information belong in the secure application. This form captures the decisions and tradeoffs the application does not explain.',
      when: function (state) { return state.applicationStatus && state.applicationStatus !== 'complete'; },
      noticeTitle: 'What stays in the secure application',
      bullets: [
        'Social Security number and identity details',
        'Employment, income, assets, and liabilities',
        'Property and current mortgage details',
        'Credit authorization and the credit report'
      ],
      primaryAction: 'Continue with strategy',
      secondaryLink: { label: 'Open secure application', href: secureApplicationUrl }
    },
    {
      id: 'transaction',
      type: 'choice',
      field: 'transaction',
      kicker: 'Your scenario',
      title: 'What decision are we planning for?',
      description: 'Choose the closest fit. The next questions will adapt to the path you select.',
      twoColumn: true,
      options: [
        option('purchase', 'Buy a home'),
        option('refinance', 'Refinance a current mortgage'),
        option('move_up', 'Buy the next home while selling the current one'),
        option('equity', 'Access equity or explore a HELOC'),
        option('investment', 'Buy or refinance an investment property'),
        option('explore', 'Compare more than one path')
      ]
    },
    {
      id: 'primary_outcome',
      type: 'choice',
      field: 'primaryOutcome',
      kicker: 'Your top priority',
      title: 'If this strategy could accomplish one thing, what should it be?',
      description: 'This answer becomes the standard we use to compare every option.',
      options: [
        option('win', 'Put me in the strongest position to win the right property'),
        option('payment', 'Keep the monthly payment comfortable'),
        option('liquidity', 'Preserve cash and financial flexibility'),
        option('debt', 'Pay debt down faster and improve cash flow'),
        option('wealth', 'Maximize long-term net worth'),
        option('simplify', 'Simplify or stabilize my current mortgage'),
        option('compare', 'Show me the tradeoffs before I decide')
      ]
    },
    {
      id: 'time_horizon',
      type: 'choice',
      field: 'timeHorizon',
      kicker: 'Planning horizon',
      title: 'How long do you expect to keep this home or this loan?',
      description: 'The likely holding period changes the break-even math, cost strategy, and value of flexibility.',
      twoColumn: true,
      options: [
        option('under3', 'Less than 3 years'),
        option('three5', '3 to 5 years'),
        option('six10', '6 to 10 years'),
        option('eleven15', '11 to 15 years'),
        option('sixteen30', '16 to 30 years'),
        option('indefinite', 'Indefinitely or not sure')
      ]
    },
    {
      id: 'payoff_goal',
      type: 'choice',
      field: 'payoffGoal',
      kicker: 'Long-term direction',
      title: 'What role should mortgage payoff play in the plan?',
      description: 'This is a planning preference, not a commitment. It helps frame term, cash-flow, and prepayment options.',
      twoColumn: true,
      options: [
        option('under10', 'Paid off within 10 years'),
        option('fifteen', 'Paid off in about 15 years'),
        option('twenty', 'Paid off in about 20 years'),
        option('thirty', 'Paid off in about 30 years'),
        option('flexible', 'No fixed deadline; flexibility matters more'),
        option('not_priority', 'Paying it off is not a current priority')
      ]
    },
    {
      id: 'liquidity_tradeoff',
      type: 'choice',
      field: 'liquidityTradeoff',
      kicker: 'Cash versus payment',
      title: 'Which tradeoff sounds closest to your preference?',
      description: 'There is no universally correct answer. The right balance depends on reserves, opportunity cost, risk, and time horizon.',
      options: [
        option('preserve', 'Preserve more cash, even if the payment is somewhat higher'),
        option('deploy', 'Use more cash to reduce the payment and long-term loan cost'),
        option('balance', 'Balance liquidity and payment'),
        option('compare', 'Show me the side-by-side math first')
      ]
    },
    {
      id: 'purchase_cash',
      type: 'choice',
      field: 'purchaseCash',
      kicker: 'Purchase strategy',
      title: 'Approximately how much cash could be available for the purchase?',
      description: 'Use a broad range. Account-level balances stay in the secure application.',
      twoColumn: true,
      when: function (state) { return ['purchase', 'move_up', 'investment'].indexOf(state.transaction) !== -1; },
      options: [
        option('under100', 'Under $100,000'),
        option('one250', '$100,000 to $250,000'),
        option('two500', '$250,000 to $500,000'),
        option('fiveplus', '$500,000 or more'),
        option('custom', 'I would rather enter a specific amount later'),
        option('unknown', 'Not sure yet')
      ]
    },
    {
      id: 'reserves',
      type: 'choice',
      field: 'reserves',
      kicker: 'Financial flexibility',
      title: 'How much reserve would you prefer to keep after closing?',
      description: 'Think in months of total household expenses, not only mortgage payments.',
      when: function (state) { return ['purchase', 'move_up', 'investment'].indexOf(state.transaction) !== -1; },
      options: [
        option('three', 'About 3 months of total expenses'),
        option('six', 'About 6 months'),
        option('twelve', 'About 12 months'),
        option('more', 'More than 12 months'),
        option('optimize', 'Help me determine the right reserve level')
      ]
    },
    {
      id: 'down_payment',
      type: 'choice',
      field: 'downPaymentPreference',
      kicker: 'Down-payment strategy',
      title: 'How should we approach the down payment?',
      description: 'The final recommendation should compare payment, mortgage insurance, liquidity, and long-term cost.',
      when: function (state) { return ['purchase', 'move_up', 'investment'].indexOf(state.transaction) !== -1; },
      options: [
        option('minimum', 'Use the lowest practical down payment'),
        option('twenty', 'Target 20% down if the math supports it'),
        option('payment', 'Use enough to reach a specific payment'),
        option('compare', 'Compare several down-payment levels')
      ]
    },
    {
      id: 'sale_dependency',
      type: 'choice',
      field: 'saleDependency',
      kicker: 'Current home',
      title: 'Does this purchase depend on selling another home?',
      description: 'This changes timing, liquidity, contingency, and buy-before-sell strategy.',
      when: function (state) { return ['purchase', 'move_up'].indexOf(state.transaction) !== -1; },
      options: [
        option('no', 'No, the purchase does not depend on a sale'),
        option('yes_first', 'Yes, I expect to sell before buying'),
        option('overlap', 'Possibly; compare buy-before-sell options'),
        option('already', 'The current home is already listed or under contract')
      ]
    },
    {
      id: 'refinance_outcome',
      type: 'choice',
      field: 'refinanceOutcome',
      kicker: 'Refinance strategy',
      title: 'What should a refinance or equity strategy accomplish?',
      description: 'Select the primary reason. We can compare secondary benefits later.',
      when: function (state) { return ['refinance', 'equity'].indexOf(state.transaction) !== -1; },
      options: [
        option('payment', 'Lower the monthly payment'),
        option('term', 'Pay the loan off sooner'),
        option('stabilize', 'Move to a more predictable loan structure'),
        option('cash', 'Access cash for a specific purpose'),
        option('debt', 'Consolidate higher-cost debt'),
        option('remove_mi', 'Remove mortgage insurance'),
        option('compare', 'Determine whether refinancing is worth doing at all')
      ]
    },
    {
      id: 'cash_out_purpose',
      type: 'text',
      field: 'cashOutPurpose',
      kicker: 'Use of equity',
      title: 'What would the equity be used for?',
      description: 'Describe the purpose, approximate timing, and what a successful outcome would look like. Do not enter account numbers.',
      placeholder: 'For example: remodel in the next 12 months, consolidate specific debt, fund another property, or create a reserve...',
      optional: true,
      when: function (state) {
        return state.transaction === 'equity' || state.refinanceOutcome === 'cash' || state.refinanceOutcome === 'debt';
      }
    },
    {
      id: 'extra_debt',
      type: 'choice',
      field: 'extraDebtPayments',
      kicker: 'Debt strategy',
      title: 'Are you currently paying more than the required amount toward any debt?',
      description: 'The application shows balances and payments. This tells us how you are intentionally directing cash flow.',
      options: [
        option('no', 'No'),
        option('yes', 'Yes'),
        option('sometimes', 'Sometimes')
      ]
    },
    {
      id: 'extra_debt_amount',
      type: 'text',
      field: 'extraDebtAmount',
      kicker: 'Debt strategy',
      title: 'About how much extra do you pay, and toward which debt?',
      description: 'A rough monthly amount is enough. Do not include account numbers.',
      placeholder: 'For example: about $1,000 per month toward the mortgage, or an extra $500 toward student loans...',
      optional: true,
      when: function (state) { return state.extraDebtPayments === 'yes' || state.extraDebtPayments === 'sometimes'; }
    },
    {
      id: 'major_purchase',
      type: 'choice',
      field: 'majorPurchase',
      kicker: 'Next three years',
      title: 'Do you expect a major use of cash in the next three years?',
      description: 'Planning around the next decision can be more important than optimizing only today\'s payment.',
      options: [
        option('no', 'No major use of cash expected'),
        option('yes', 'Yes'),
        option('unsure', 'Possibly or not sure')
      ]
    },
    {
      id: 'major_purchase_details',
      type: 'text',
      field: 'majorPurchaseDetails',
      kicker: 'Protect future liquidity',
      title: 'What might the cash be needed for?',
      description: 'Examples include renovation, education, business investment, another property, retirement transition, or family support.',
      placeholder: 'Describe the likely purpose, timing, and rough magnitude...',
      optional: true,
      when: function (state) { return state.majorPurchase === 'yes' || state.majorPurchase === 'unsure'; }
    },
    {
      id: 'income_outlook',
      type: 'choice',
      field: 'incomeOutlook',
      kicker: 'Income planning',
      title: 'How do you expect household income to behave over the next two years?',
      description: 'We are looking for direction and variability, not asking you to repeat income figures from the application.',
      options: [
        option('stable', 'Fairly stable and predictable'),
        option('variable', 'Variable, commission-based, bonus-based, or self-employed'),
        option('increase', 'Likely to increase materially'),
        option('decrease', 'May decrease or pause'),
        option('change', 'A job, business, retirement, or household change is likely')
      ]
    },
    {
      id: 'rate_risk',
      type: 'choice',
      field: 'rateRisk',
      kicker: 'Payment stability',
      title: 'How much payment or rate variability are you comfortable considering?',
      description: 'This replaces the outdated fixed-versus-ARM pyramid with a direct risk preference.',
      options: [
        option('fixed', 'I value a predictable payment and prefer little or no rate risk'),
        option('capped', 'I can accept limited, clearly capped variability for meaningful savings'),
        option('open', 'I am open to more variability if the long-term math is compelling'),
        option('compare', 'Compare fixed and adjustable structures without assuming my answer')
      ]
    },
    {
      id: 'closing_costs',
      type: 'choice',
      field: 'closingCosts',
      kicker: 'Cost strategy',
      title: 'How should we compare closing-cost options?',
      description: 'Rather than assuming costs should be rolled into the loan, compare cash needed, credits, payment, and break-even time.',
      options: [
        option('minimize_cash', 'Minimize cash due at closing'),
        option('pay_upfront', 'Pay costs upfront when it lowers long-term cost'),
        option('credits', 'Use seller or lender credits where they make sense'),
        option('compare', 'Show no-cost, low-cost, and upfront-cost options side by side')
      ]
    },
    {
      id: 'assumptions',
      type: 'choice',
      field: 'assumptions',
      kicker: 'Planning assumptions',
      title: 'How should hypothetical planning assumptions be handled?',
      description: 'Appreciation and investment-return inputs are not forecasts or promises. They are variables used to test the strategy.',
      options: [
        option('standard', 'Use Daryn\'s conservative planning assumptions'),
        option('custom', 'I want to provide custom assumptions'),
        option('discuss', 'Discuss assumptions with me before modeling')
      ]
    },
    {
      id: 'custom_assumptions',
      type: 'assumptions',
      kicker: 'Planning assumptions',
      title: 'What hypothetical assumptions should we test?',
      description: 'Enter annual percentages only. These figures are for scenario analysis and are not predictions.',
      when: function (state) { return state.assumptions === 'custom'; }
    },
    {
      id: 'additional_context',
      type: 'text',
      field: 'additionalContext',
      kicker: 'Before we talk',
      title: 'What else should Daryn understand before building the strategy?',
      description: 'Use this for concerns, competing goals, family context, timing, past experiences, or a decision that feels unresolved.',
      placeholder: 'Anything that would help make the strategy more useful...',
      optional: true
    },
    {
      id: 'contact_match',
      type: 'contact',
      kicker: 'Match this to your file',
      title: function (state) {
        return state.applicationStatus === 'complete' || state.applicationStatus === 'app_only'
          ? 'What email did you use for the secure application?'
          : 'Where should the strategy follow-up go?';
      },
      description: function (state) {
        return state.applicationStatus === 'complete' || state.applicationStatus === 'app_only'
          ? 'This single identifier can match the intake to the correct loan file without repeating the rest of your application.'
          : 'Only basic contact information belongs here. Detailed financial information stays in the secure application.';
      }
    },
    { id: 'review', type: 'review', kicker: 'Review' }
  ];

  var labels = {};
  steps.forEach(function (step) {
    if (!step.field || !step.options) return;
    labels[step.field] = {};
    step.options.forEach(function (item) { labels[step.field][item.value] = item.title; });
  });

  return {
    version: 'mockup-1.0',
    secureApplicationUrl: secureApplicationUrl,
    steps: steps,
    labels: labels
  };
})();
