'use strict';

const PROPERTY_DEFAULT = 'demo-123-main-street';
const RIDER_DEFAULT = 'do-not-scan';

const RIDERS = {
  'do-not-scan': {
    number: '01',
    scanQuestion: 'Do not scan this QR code. ;-)',
    title: 'You ignored the instructions. Good.',
    lead: 'Major financial decisions deserve more than the conventional answer.',
    betterQuestion: 'What are you trying to make possible?',
    eyebrow: 'START HERE',
    experienceTitle: 'What would you like to understand about this home?',
    experienceLead: 'The listing tells you what the home is. These questions help you decide what owning it could mean.',
    primaryCta: 'Choose the question worth answering',
    formTitle: 'Ask the better question about this home.',
    formDescription: 'Tell me what caught your attention. I will help you identify the next useful question, not push you into an application.',
    formSubmit: 'Help me think this through',
    questionLabel: 'What are you trying to decide?',
    module: 'menu'
  },
  'get-rich-maybe': {
    number: '02',
    scanQuestion: 'Scan this QR code to get rich, maybe.',
    title: 'Could this home make you wealthier? Maybe.',
    lead: 'Buying a home does not automatically create wealth. The price, financing, time horizon, costs, and property all matter.',
    betterQuestion: 'What would have to be true for this home to build wealth?',
    eyebrow: 'THE WEALTH CASE',
    experienceTitle: 'A home creates wealth only when the full equation works.',
    experienceLead: 'Appreciation gets the attention. Principal reduction, cash invested, ownership costs, and selling costs determine more of the outcome than most buyers model.',
    primaryCta: 'See what has to happen',
    formTitle: 'Run the wealth case for me.',
    formDescription: 'I will model the property using a range of assumptions instead of pretending one forecast is certain.',
    formSubmit: 'Model this property for me',
    questionLabel: 'What would make this purchase feel financially worthwhile?',
    module: 'wealth-drivers'
  },
  'finance-smartly': {
    number: '03',
    scanQuestion: 'Are you sure you know how to finance this house smartly?',
    title: 'Smart financing starts with the tradeoffs.',
    lead: 'The lowest rate, largest down payment, and lowest monthly payment are not automatically the same decision.',
    betterQuestion: 'What does your money need to do after closing?',
    eyebrow: 'THREE WAYS TO LOOK AT IT',
    experienceTitle: 'Compare three ways to structure this home.',
    experienceLead: 'Each option gives you something and asks you to give up something. None is labeled best because the right answer depends on your goals.',
    primaryCta: 'Compare three strategies',
    formTitle: 'Build my strategy for this home.',
    formDescription: 'Choose the structure that feels closest to your priorities. I will pressure-test it against your actual numbers and goals.',
    formSubmit: 'Build my Property Strategy Brief',
    questionLabel: 'Which tradeoff matters most to you?',
    module: 'finance-smartly'
  },
  'wait-for-rates': {
    number: '04',
    scanQuestion: 'Should I wait for rates to fall?',
    title: 'Waiting only works when the full math improves.',
    lead: 'A lower future rate can help. Price movement, rent paid, available cash, and lost time can offset that benefit.',
    betterQuestion: 'What must happen for waiting to improve your position?',
    eyebrow: 'BUY NOW VS. WAIT',
    experienceTitle: 'Run the wait math for this property.',
    experienceLead: 'Change the assumptions. The goal is not to predict the market. It is to understand what your decision depends on.',
    primaryCta: 'Run the wait math',
    formTitle: 'Run this against my real situation.',
    formDescription: 'I will compare buying now with waiting using your rent, available cash, timing, and likely ownership horizon.',
    formSubmit: 'Compare buying now with waiting',
    questionLabel: 'What makes you think waiting may be the better move?',
    module: 'wait-calculator'
  },
  'today-tomorrow': {
    number: '05',
    scanQuestion: 'What does this decision give you today, and what might it take away tomorrow?',
    title: 'A good decision has to work on both sides.',
    lead: 'This home may create stability, space, control, and ownership. It may also reduce liquidity, mobility, and monthly flexibility.',
    betterQuestion: 'Which future options are you willing to exchange for this home today?',
    eyebrow: 'DECISION PRESSURE TEST',
    experienceTitle: 'Pressure-test the decision before you optimize the loan.',
    experienceLead: 'These questions do not tell you whether to buy. They reveal where the decision needs more thought.',
    primaryCta: 'Pressure-test the decision',
    formTitle: 'Help me pressure-test this decision.',
    formDescription: 'I will help you separate a financing problem from a life-planning problem before we structure the loan.',
    formSubmit: 'Review the pressure test with me',
    questionLabel: 'Which part of the decision feels least settled?',
    module: 'pressure-test'
  },
  'no-best-mortgage': {
    number: '06',
    scanQuestion: 'There is no best mortgage. There is only the best strategy for you based on your goals and needs.',
    title: 'Start with what matters. Then compare the loans.',
    lead: 'A mortgage cannot be evaluated in isolation from your cash flow, liquidity, income, plans, and tolerance for risk.',
    betterQuestion: 'Which outcome are you actually trying to improve?',
    eyebrow: 'YOUR PRIORITIES',
    experienceTitle: 'Choose the outcomes that matter most to you.',
    experienceLead: 'Select up to two priorities. The page will show which questions and structures deserve attention first.',
    primaryCta: 'Build around my priorities',
    formTitle: 'Build the strategy around my priorities.',
    formDescription: 'I will compare relevant structures based on the outcomes you selected, not on a generic definition of the best loan.',
    formSubmit: 'Build around my priorities',
    questionLabel: 'What else should the strategy account for?',
    module: 'priority-selector'
  },
  'access-to-money': {
    number: '07',
    scanQuestion: 'The best time to create access to money is before you need it.',
    title: 'Do not confuse a larger down payment with a safer plan.',
    lead: 'Putting more cash into the property can reduce the payment. Preserving cash can protect flexibility. Both choices have a cost.',
    betterQuestion: 'How much liquidity should remain after closing?',
    eyebrow: 'DOWN PAYMENT VS. LIQUIDITY',
    experienceTitle: 'Compare cash committed with cash kept available.',
    experienceLead: 'Adjust the cash available, then compare the estimated monthly cost and liquidity remaining across three down-payment choices.',
    primaryCta: 'Compare the liquidity choices',
    formTitle: 'Help me choose the right liquidity target.',
    formDescription: 'I will compare the payment benefit of more money down with the value of keeping cash available after closing.',
    formSubmit: 'Build my liquidity comparison',
    questionLabel: 'What might you need cash for after closing?',
    module: 'liquidity-calculator'
  },
  'five-year-wealth': {
    number: '08',
    scanQuestion: 'How much wealth could this home create in the next 5 years?',
    title: 'The five-year answer is a range, not a promise.',
    lead: 'The outcome depends on appreciation, principal reduction, selling costs, ownership costs, and the cash invested at closing.',
    betterQuestion: 'Which assumptions have to hold for the five-year outcome to work?',
    eyebrow: 'FIVE-YEAR MODEL',
    experienceTitle: 'Model the possible equity story for this home.',
    experienceLead: 'Change the time horizon, appreciation assumption, and down payment. The result separates principal reduction from appreciation.',
    primaryCta: 'Model the next five years',
    formTitle: 'Build the complete five-year comparison.',
    formDescription: 'I will add the costs this quick model leaves out, including interest, taxes, insurance, maintenance, and your alternative use of the cash.',
    formSubmit: 'Build my five-year property model',
    questionLabel: 'What would you compare this purchase against?',
    module: 'wealth-calculator'
  },
  'special-financing': {
    number: '09',
    scanQuestion: 'Special financing available for this property.',
    title: 'An incentive is only valuable when it improves your outcome.',
    lead: 'The question is not whether financing support exists. It is how the available support should be used for your plan.',
    betterQuestion: 'Which use of the incentive creates the most value for you?',
    eyebrow: 'PROPERTY-SPECIFIC FINANCING',
    experienceTitle: 'See how the available financing support could be used.',
    experienceLead: 'The examples below are illustrative. Final uses depend on the purchase agreement, loan program limits, eligibility, and underwriting approval.',
    primaryCta: 'See how the incentive could work',
    formTitle: 'Show me how the incentive could apply to me.',
    formDescription: 'I will compare eligible ways to use the property-specific financing support based on your priorities.',
    formSubmit: 'Review the financing opportunity',
    questionLabel: 'Which use of the incentive interests you most?',
    module: 'special-financing'
  }
};

const PRIORITIES = {
  'lower-payment': {
    label: 'Lower required payment',
    title: 'Payment-first lens',
    description: 'Compare down payment, mortgage insurance, rate strategy, and seller-credit use. Then confirm the cash required does not weaken your reserves.'
  },
  'preserve-cash': {
    label: 'Preserve cash',
    title: 'Liquidity-first lens',
    description: 'Compare what a smaller down payment costs each month with what the retained cash makes possible or protects after closing.'
  },
  'lower-five-year-cost': {
    label: 'Lower five-year cost',
    title: 'Time-horizon lens',
    description: 'Compare interest, mortgage insurance, points, credits, and expected refinance or sale timing. A lower payment is not always a lower five-year cost.'
  },
  'pay-off-sooner': {
    label: 'Pay the loan off sooner',
    title: 'Debt-reduction lens',
    description: 'Compare term, required payment, optional principal payments, and the opportunity cost of directing extra cash to the mortgage.'
  },
  'future-flexibility': {
    label: 'Maintain flexibility',
    title: 'Optionality lens',
    description: 'Preserve choices around future moves, renovations, career changes, investing, and refinancing instead of optimizing one number today.'
  },
  'variable-income': {
    label: 'Plan for variable income',
    title: 'Cash-flow resilience lens',
    description: 'Build the decision around conservative income, strong reserves, and a payment that remains manageable through uneven months or business cycles.'
  }
};

const state = {
  propertySlug: PROPERTY_DEFAULT,
  riderSlug: RIDER_DEFAULT,
  property: null,
  rider: null,
  selectedStrategy: '',
  interactionSummary: ''
};
