import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const changed = new Set();

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function write(file, value) {
  fs.writeFileSync(path.join(root, file), value);
  changed.add(file);
}

function replaceRequired(file, from, to) {
  const source = read(file);
  if (source.includes(from)) {
    write(file, source.replaceAll(from, to));
    return;
  }
  if (!source.includes(to)) {
    throw new Error(`Missing expected copy in ${file}: ${from.slice(0, 90)}`);
  }
}

function replaceOptional(file, from, to) {
  const source = read(file);
  if (!source.includes(from)) return false;
  write(file, source.replaceAll(from, to));
  return true;
}

function htmlFiles(dir = root) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(absolute);
    return entry.isFile() && entry.name.endsWith('.html')
      ? [path.relative(root, absolute)]
      : [];
  });
}

const globalReplacements = [
  [
    'Mortgage strategy with a real advisor behind it.',
    'Start with the life. Then structure the loan.'
  ],
  [
    'I help Los Angeles buyers, homeowners, investors, and real estate partners structure financing around the full picture: offer strength, cash flow, equity, tax context, and what the mortgage should do for you after closing.',
    'I help Los Angeles buyers, homeowners, investors, and real estate partners see the full financial decision before choosing the mortgage: offer strength, cash flow, liquidity, equity, tax context, and what the loan should make possible after closing.'
  ],
  [
    'Certified Mortgage Advisor at NEO Home Loans. Strategic mortgage guidance for buyers, investors, and homeowners in Los Angeles.',
    'Certified Mortgage Advisor at NEO Home Loans. Helping Los Angeles buyers and homeowners make better mortgage decisions before and after closing.'
  ],
  [
    'Want to know your actual rate?',
    'What are you trying to make possible?'
  ],
  [
    "Online rate guesses are just that. A 15-minute conversation tells you what you'd actually be offered based on your specific credit, income, and the property you're looking at. Free. No commitment. No hard sell.",
    'Rate matters. So do cash flow, upfront cost, liquidity, timing, and what the decision affects next. A 15-minute conversation helps you see the tradeoffs and the structure that fits your life. Free. No commitment. No hard sell.'
  ],
  [
    'id="exitIntentCTA" style="display:block;background:#5bcbf5;color:#0A2540;text-align:center;padding:14px 24px;border-radius:8px;font-weight:800;font-size:0.95rem;letter-spacing:-0.01em;text-decoration:none;transition:transform 0.12s,box-shadow 0.12s" onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 8px 24px rgba(91,203,245,0.3)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'none\'">Book a 15-minute call</a>',
    'id="exitIntentCTA" style="display:block;background:#5bcbf5;color:#0A2540;text-align:center;padding:14px 24px;border-radius:8px;font-weight:800;font-size:0.95rem;letter-spacing:-0.01em;text-decoration:none;transition:transform 0.12s,box-shadow 0.12s" onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 8px 24px rgba(91,203,245,0.3)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'none\'">Talk through my options</a>'
  ],
  [
    'A no-cost refinance is a mortgage refinance where all closing costs are rolled into a slightly higher interest rate rather than paid upfront. You pay nothing at closing. Savings begin on day one. There is no break-even period to wait through.',
    'A no-cost refinance generally uses lender credits tied to a higher interest rate, or adds costs to the new loan balance. It reduces upfront cash but can increase payment, total interest, or reduce equity.'
  ]
];

for (const [from, to] of globalReplacements) {
  let matches = 0;
  for (const file of htmlFiles()) {
    if (replaceOptional(file, from, to)) matches += 1;
  }
  if (matches === 0) continue;
}

const pageReplacements = {
  'index.html': [
    [
      'Daryn Fillis helps LA buyers win competitive offers and build a long-term mortgage strategy. Certified Mortgage Advisor at NEO Home Loans.',
      'Daryn Fillis helps Los Angeles buyers and homeowners compare mortgage tradeoffs, strengthen offers, and manage the loan after closing. NEO Home Loans.'
    ],
    [
      "<h1>You're losing homes<br>you could have <em>won.</em></h1>",
      '<h1>Start with the life.<br>Then structure the <em>loan.</em></h1>'
    ],
    [
      "The financing was wrong before you ever made an offer. One conversation and you'll know exactly where you stand. I help Los Angeles buyers, homeowners, investors, and self-employed borrowers structure mortgages that win today and still make sense years from now.",
      'Most people begin with the rate, payment, or price. I begin with what you are trying to make possible—then structure the mortgage around the tradeoffs, timing, and long-term plan. For Los Angeles buyers and homeowners, that means stronger offers today and more options after closing.'
    ],
    ['Min to know your number', 'Min to map your options'],
    [
      "It wasn't the house. It was the financing — wrong structure, wrong advice, an advisor who disappeared the day after closing. There are five things I cover with every client that most advisors never bring up. They're the difference between a mortgage that builds your wealth and one that just gets you to closing.",
      'A mortgage can solve today\'s purchase and still create pressure tomorrow. I help clients compare the full structure—payment, cash to close, liquidity, time horizon, and the opportunities they want to preserve—before they choose. Better questions. Better decisions.'
    ],
    ["See what most advisors won't tell you →", 'See the questions behind the rate →'],
    ["The work most advisors won't do.", 'Questions worth asking before you choose a mortgage.'],
    [
      'Where the right strategy turns a good mortgage into the one that builds your wealth, not just gets you to closing.',
      'Start with the decision you are facing. Then compare the structure, tradeoffs, and next steps that fit the life you are building.'
    ],
    [
      'Win the home with a stronger offer, not a higher price. Fully underwritten pre-approvals close in 15 days.',
      'Strengthen your offer without automatically raising your price. Align underwriting, timing, and communication before you bid.'
    ],
    [
      'Refinance without closing costs. The bank covers them. You keep the savings.',
      'Compare lender credits, rate, savings, and time horizon to see whether a no-cost structure improves your position.'
    ],
    [
      "I watch your file for life. PMI removal, refi windows, equity strategy. Most advisors disappear after closing. I don't.",
      'Closing is the starting line. I monitor PMI, refinance, recast, and equity opportunities as your life and the market change.'
    ],
    [
      "PMI isn't permanent. The trick is knowing when you can remove it. I'll tell you the day, not the year.",
      'Compare the cost of PMI with the cost of waiting, then preserve or deploy cash where it serves the larger plan.'
    ],
    [
      "The lowest rate isn't always the lowest cost. Knowing the difference is the difference.",
      'What does the full structure cost—and what does it make possible?'
    ],
    [
      'What first-time buyers wish someone had told them sooner. Plain language, real numbers, the patient advisor you deserve.',
      'What first-time buyers wish someone had explained sooner. Plain language, real numbers, and better questions before you commit.'
    ],
    [
      'Zero down. No PMI. Sellers can pay all closing costs. The most powerful loan in housing — when the lender knows how to use it.',
      'See how zero down, no monthly PMI, seller-paid costs, and remaining entitlement may fit your full plan.'
    ],
    [
      "Buy your next home before you sell the current one. The strategy most advisors won't even discuss.",
      'Compare sell-first, buy-first, bridge, recast, and backup-offer paths before choosing the sequence.'
    ],
    [
      "Your restricted stock is real income. I'll show you how to use it to qualify for the home you actually want, not the one your base salary fits.",
      'Your RSUs may support qualification, liquidity, or both. Build the file around how your compensation and life actually work.'
    ],
    [
      "Most people don't lose homes because of price. They lose them because their financing wasn't set up to win, and nobody told them in time. The work I do is built around making sure that doesn't happen to you.",
      'People usually arrive with a number: a rate, a price, a payment, or an approval. My job is to help them see the questions underneath it and choose a structure that supports the rest of their life.'
    ],
    [
      "A client closed in 2022. By month 26, their equity had crossed 20%. I called them, walked them through PMI removal, saved them $280 a month. Six months later when rates dropped, I called again. We refinanced at no cost. Nobody else would have called them. I did.",
      'A client closed in 2022. By month 26, their equity had crossed 20%. I called them, walked them through PMI removal, and they saved $280 a month. Six months later, when rates dropped, I called again and we reviewed a no-cost refinance. That follow-up is part of the relationship, not a favor.'
    ],
    [
      "I'm a Certified Mortgage Advisor and Branch Lead at NEO Home Loans. The designation means I'm trained to look at your full financial picture, not just close your loan. Most advisors' job ends at the signing table. Mine is designed to start there.",
      "I'm a Certified Mortgage Advisor and Branch Lead at NEO Home Loans. The designation reflects how I work: understand the full financial picture, execute the loan cleanly, and keep managing the strategy after closing. The loan is temporary. The strategy lasts."
    ],
    ['Four steps. One standard.<br>No shortcuts.', 'Four steps. One strategy.<br>Built to continue.'],
    [
      'Every client goes through the same process — built to make sure the mortgage you get today still makes sense five, ten, and twenty years from now.',
      'Understand the life and goals. Build the strategy. Execute the financing. Keep managing the mortgage as life and the market change.'
    ],
    [
      "Before I recommend anything, I need to understand where you are financially and where you're trying to go. Most lenders skip this step. I don't.",
      'Before I recommend anything, I need to understand where you are financially, what you are trying to make possible, and what the decision must leave room for.'
    ],
    ['Wealth Maximization', 'Ongoing Strategy'],
    ['Closing is just the beginning.', 'Closing is the starting line.'],
    [
      'Find out what you qualify for<br>in 3 minutes.',
      'Know what you can qualify for—<br>and what you want to carry.'
    ],
    [
      "Soft credit check that protects your score. You'll have a real number before you finish your coffee.",
      'A soft credit check gives us a starting point. The strategy conversation turns that number into a plan.'
    ],
    ['A real qualifying number you can use today', 'A qualifying range to ground the conversation'],
    ['A real number — not an estimate, not a range', 'A starting point for payment, cash, and tradeoff planning'],
    [
      'Most people don\'t know what they can actually afford until they\'re already shopping. This changes that. Three minutes, no paperwork, real answers.',
      'Qualification answers what the system may allow. Strategy answers what supports the rest of your life. Start with the number, then decide what it should make possible.'
    ],
    [
      'In 15 minutes or less, you\'ll know your number.',
      'In 15 minutes, get clear on the decision—not just the number.'
    ]
  ],
  'about.html': [
    [
      'Most people don\'t lose homes because of price.<br>They lose them because their financing wasn\'t built to win.',
      'The mortgage is one decision.<br>The life around it is the point.'
    ],
    [
      "Most people find out their financing was wrong after it's already cost them. Here's how to make sure that doesn't happen to you.",
      'I work best with people who want to understand the tradeoffs, challenge conventional advice when it matters, and keep managing the strategy after closing.'
    ],
    ['What clients say after working<br>with someone else first.', 'What clients say when the strategy<br>finally makes sense.'],
    [
      "If you've ever left a mortgage conversation feeling like you were being processed, not advised, that's the problem this practice is built to solve.",
      'The people I work best with want to understand the decision, examine the tradeoffs, and choose the structure that fits the life they are building.'
    ],
    [
      "I'm a Certified Mortgage Advisor and Branch Lead at NEO Home Loans. The designation means I'm trained to look at your full financial picture: your goals, your timeline, your tax structure, your equity strategy. Not just close your loan. Most advisors' job ends at the signing table. Mine is designed to start there.",
      "I'm a Certified Mortgage Advisor and Branch Lead at NEO Home Loans. I look at the full financial picture: goals, timeline, cash flow, tax context, liquidity, and equity strategy. Then I stay involved after closing, because the mortgage is one decision inside a longer plan."
    ],
    ['Six months later when rates dropped, I called again. We refinanced at no cost. Nobody else would have called them.', 'Six months later, when rates dropped, I called again and we reviewed a no-cost refinance. That follow-up is part of Mortgage Under Management.'],
    [
      "A self-employed buyer came to me after two lenders had told them the deal couldn't be done. The buyer was qualified. The property was fine. The other lenders just didn't know how to structure the file for someone running their own business. We built the right loan around their tax returns and closed in 21 days. The buyer got the home. The other lenders got nothing.",
      'A self-employed buyer came to me after two lenders had declined the file. We reviewed the tax returns, matched the documentation to the right program, and closed in 21 days. The result came from structuring the file around how the business actually worked.'
    ],
    ['What goes wrong, and what I do instead.', 'The questions I help clients answer.'],
    [
      "81% of young homeowners have at least one regret about their mortgage. It's almost never about the house. Here's the pattern:",
      'Mortgage regret often starts with a tradeoff that was never made visible. Here are three decisions I slow down and model:'
    ],
    ['Wrong down payment structure.', 'How much cash should stay liquid?'],
    ['PMI that was avoided or mishandled.', 'Is PMI a cost worth accepting?'],
    [
      'PMI is a tool, not a penalty. In most LA neighborhoods, getting in two years earlier outperforms waiting to save 20%. I run that math with every client.',
      'I compare PMI with rent, reserves, price, and time horizon instead of treating 20% down as a universal rule.'
    ],
    ['The refinance nobody called them about.', 'What should be reviewed after closing?'],
    ['You can refinance a bad rate.<br>You can\'t undo a bad advisor.', 'The loan is temporary.<br>The strategy lasts.'],
    [
      'He specializes in helping buyers, homeowners, and investors in Southern California build long-term wealth through strategic mortgage planning.',
      'He helps buyers, homeowners, and investors in Southern California make informed mortgage decisions through strategic planning.'
    ]
  ],
  'for-agents.html': [
    [
      'Real estate agents in LA work better with a strategic mortgage advisor. Here is how I help your clients win more deals and close on time.',
      'I help Los Angeles agents improve client decisions before the offer, strengthen the financing, and execute the transaction cleanly.'
    ],
    [
      "Every deal you lose because of the lender<br>is a commission you don't get back.",
      'Better client decisions before the offer.<br>Clean execution after it.'
    ],
    [
      "Your reputation, your commission, and your next referral are tied to how the financing performs. Here's what a lender who actually protects all three looks like.",
      'I help your clients understand the full financial decision before they write—then strengthen the approval, communication, timing, and financing so the transaction can perform.'
    ],
    ['Close in 15 days or less', 'Build a close timeline the file can support'],
    [
      "Fully underwritten pre-approval means your client's income, assets, and credit are verified before they write an offer. Not an estimate. A real commitment. That's what lets us close in 15 days or less, and what gives sellers the certainty they need to say yes.",
      'A fully underwritten pre-approval means the client\'s income, assets, and credit are reviewed before the offer. That can support a shorter, more credible close timeline, subject to the property, appraisal, title, and remaining loan conditions.'
    ],
    ['Waive loan and appraisal contingencies', 'Evaluate contingencies with real underwriting evidence'],
    [
      'When the file genuinely supports it, your client can waive the loan and appraisal contingencies. That removes the two biggest objections sellers have to financed offers, and turns a solid buyer into the strongest offer in the room.',
      'When the file and property support it, the buyer and agent have better evidence for deciding whether any contingency adjustment is appropriate. The choice stays with the client and agent.'
    ],
    ['Zero surprises at the table', 'Clear status before it becomes urgent'],
    [
      "You'll always know where the file stands. I communicate proactively — no dropped balls, no last-minute discoveries, no calls the day before closing.",
      'I communicate proactively, surface conditions early, and make the next decision clear before it becomes urgent.'
    ],
    ['<div style="font-weight:800;font-size:clamp(2rem,4vw,3rem);color:var(--navy);letter-spacing:-0.04em;line-height:1">15</div>\n      <div style="font-weight:800;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--blue-dark);margin-top:4px">Days to close or less</div>\n      <p style="font-weight:200;font-size:0.78rem;color:var(--muted);line-height:1.6;margin-top:6px">Fully underwritten. Not estimated.</p>', '<div style="font-weight:800;font-size:clamp(2rem,4vw,3rem);color:var(--navy);letter-spacing:-0.04em;line-height:1">Full</div>\n      <div style="font-weight:800;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--blue-dark);margin-top:4px">Pre-approval</div>\n      <p style="font-weight:200;font-size:0.78rem;color:var(--muted);line-height:1.6;margin-top:6px">Income, assets, and credit reviewed before the offer.</p>'],
    ['Turn one listing into four to six deals.', 'Build more opportunities from every listing.'],
    ['Your clients deserve financing<br>that wins. Let\'s make that happen.', 'Better questions for your clients.<br>Financing built to execute.']
  ],
  'self-employed.html': [
    [
      'You don\'t need a different income.<br><em style="color:var(--blue);font-style:normal">You need a lender who knows what to do with the one you have.</em>',
      'You don\'t need a different income.<br><em style="color:var(--blue);font-style:normal">You need a structure that tells the story clearly.</em>'
    ],
    [
      "If you've been turned down, told to wait two years for new tax returns, or asked for \"just one more document\" three times in a row, you're not the problem. The lender was. I know because I built businesses for 18 years before I started writing loans. Your file isn't broken. It just needs the right person reading it.",
      'If you have been turned down, told to wait for new tax returns, or asked for another round of documents, start with the better question: which income method tells the story cleanly? I built businesses for 18 years before I started writing loans, so I understand both sides of that file.'
    ],
    ['The right loan exists. It\'s just not the one most lenders use.', 'The right path starts with how your income actually works.'],
    [
      'The buyer got the home. The other lenders got nothing.',
      'The buyer got the home because the documentation and program matched the business.'
    ],
    ['Why most lenders can\'t do these deals.', 'Why one income method does not fit every business.'],
    [
      "Big retail lenders run automated underwriting that's optimized for W-2 borrowers. Your file goes in, the system flags 14 issues, and a junior processor calls to ask for a 14th document. Six weeks later they tell you they can't make it work.",
      'Conventional underwriting works well when tax returns tell the full story. When they do not, bank statements, a P&amp;L, DSCR, or assets may tell it more clearly.'
    ],
    [
      "That's not because the deal can't be done. It's because their system isn't built to do it.",
      'The decision is not conventional versus alternative. It is which method creates the most accurate, supportable picture of the file.'
    ],
    ['You don\'t need to start over.<br>You need a lender who can read your file.', 'Start with how the business works.<br>Then structure the loan.']
  ],
  'move-up-method.html': [
    [
      "There are four real financing strategies that get your offer accepted, plus a backup offer layer for when your income makes carrying two homes hard to qualify for. Most advisors won't even discuss them.",
      'There are four financing strategies, plus a backup-offer layer when carrying two homes is hard to qualify for. Each has different cost, liquidity, timing, and approval tradeoffs.'
    ],
    ['Why most advisors won\'t even discuss this.', 'What the decision should protect.'],
    [
      'The right strategy depends on your numbers.',
      'The right strategy depends on what the move needs to preserve.'
    ],
    [
      'Most advisors recommend a contingent offer because it requires the least upfront work. Buy-before-you-sell strategies require more analysis, lender relationships that support multi-property structures, and the willingness to underwrite a more complex situation. They take more time and effort, so many advisors steer clients toward the simpler path of writing a contingent offer and hoping it gets accepted.',
      'A contingent offer is often the simplest and least expensive path, but it can weaken an offer in a competitive market. Buy-before-you-sell structures require more analysis because they change liquidity, carrying costs, qualification, and transaction risk.'
    ],
    [
      "The Move-Up Method takes more upfront work. Two transactions to coordinate, multiple lender products to evaluate, sometimes a backup offer partner to bring in. It is more time on my end. So most advisors don't offer it. They tell clients to write a contingent offer and hope, even when the math says that path will lose three or four homes before one accepts.",
      'The Move-Up Method takes more upfront work: two transactions to coordinate, multiple financing paths to evaluate, and sometimes a backup-offer partner. That work makes the cost, timing, liquidity, and offer-strength tradeoffs visible before you choose a sequence.'
    ]
  ],
  'rsu-strategy.html': [
    [
      'Your RSUs are real income. Most mortgage professionals don&rsquo;t know how to use them.',
      'Your RSUs are real compensation. The question is how to use them.'
    ],
    [
      'They can also be a meaningful piece of what you qualify for, when the loan is structured correctly.',
      'Depending on vesting and documentation, they may support qualifying income, reserves, down payment, or liquidity.'
    ],
    [
      'That income shows up on their pay stubs as something different from base salary, and most mortgage professionals either ignore it, miscount it, or apply it incorrectly.',
      'That compensation behaves differently from base salary, so the file has to distinguish what can count as income from what can count as an asset.'
    ],
    [
      'Done right, RSU income can be the difference between qualifying for the home you actually want and being told you only qualify for &ldquo;what fits your base salary.&rdquo; That answer is leaving real buying power on the table.',
      'The better question is not simply how much the RSUs add to qualification. It is how they should support the purchase without creating unnecessary concentration, tax, or liquidity pressure.'
    ],
    [
      'Conventional underwriting guidelines (Fannie Mae and Freddie Mac) treat RSUs as variable income. Two conditions generally have to be met before any of it counts toward what you qualify for:',
      'Conventional underwriting rules distinguish between time-based and performance-based restricted stock, how it is paid, and whether it has vested and been distributed. The current Fannie Mae framework starts with these questions:'
    ],
    ['1. A two-year history of receiving them.', '1. Is there an eligible history of vested, distributed restricted stock?'],
    [
      'Documented on your last two years of W-2s and recent pay stubs. New hires with first-year RSU income can sometimes qualify with offer-letter and grant-document underwriting, but the standard rule is two years.',
      'For time-based awards, Fannie Mae currently requires at least a 12-month history from the current employer. Documentation and calculation vary by award type and whether distributions are paid in shares or cash.'
    ],
    ['2. Reasonable expectation that they continue for at least three years after closing.', '2. Do the award terms satisfy the applicable continuance rules?'],
    [
      'Verified through your vesting schedule. If your grant docs show stock continuing to vest three years out, that requirement is met. If you&rsquo;re late in a grant cycle with nothing scheduled past two years, we have to work around it.',
      'A one-time time-based award generally must be expected to continue for at least three years from the note date. Recurring time-based and performance-based awards follow different continuance requirements.'
    ],
    [
      'When both conditions are met, we typically use a 24-month average of vested RSU value, often with a 10% discount applied to a recent stock price to account for volatility. Lender approaches vary on the exact valuation method, and choosing the right lender for an RSU-heavy file matters.',
      'For eligible income paid in shares, Fannie Mae uses a calculation based on the 200-day moving average and vested shares distributed over the applicable history. Income paid in cash uses distributed cash value. The exact file still depends on award type, history, documentation, and the selected loan program.'
    ],
    [
      'Your two-year average of vested RSUs, subject to the continuance rule, increases the loan amount you qualify for. This is where most of the leverage comes from for high-comp buyers.',
      'Eligible vested and distributed restricted-stock income may increase qualifying income when the history, calculation, and continuance requirements are met.'
    ],
    ['Timing and structure are where the right advisor earns their keep.', 'Timing and structure are where the real tradeoffs appear.'],
    ['⚠ What Most Mortgage Professionals Get Wrong', 'Documentation Risks to Catch Early'],
    [
      'Lazy underwriting that ignores the two-year history and continuance documentation. The right approach uses the actual guideline calculation, not a guess.',
      'The file should use the current guideline calculation for the award type, payment method, history, and continuance—not a blanket bonus-income assumption.'
    ],
    ['Most advisors don&rsquo;t ask.', 'Document this before the shares are needed for closing.'],
    [
      'Bring your most recent pay stubs and a copy of your RSU grant docs. In 15 minutes, you&rsquo;ll know exactly what you qualify for, what your real options are, and the timing that maximizes your buying power.',
      'Bring recent pay stubs and your RSU grant and vesting documents. We will map which amounts may count as income or assets, what still needs documentation, and which timing tradeoffs deserve a closer look.'
    ]
  ],
  'interest-rate-vs-cost.html': [
    [
      'Rate is not the most important number. Total cost is. Here is how to think about your mortgage as a long-term cost, not a monthly payment.',
      'Compare mortgage rate, points, fees, PMI, cash, and time horizon to understand total cost and choose the structure that fits your plan.'
    ],
    [
      "You've been shopping for the lowest rate.<br>That's not actually the goal.",
      'What&rsquo;s the rate?<br>Start there. Don&rsquo;t stop there.'
    ],
    [
      "Two loans with the same rate can leave you $40,000 apart after 7 years. The difference is in the structure — and most advisors never walk you through it. Here's what to look at instead.",
      'A lower rate can still cost more over the time you keep the loan. Compare points, fees, PMI, cash, and time horizon—then choose the structure that improves your full position.'
    ],
    [
      "The mortgage industry knows this. Most advisors sell on rate anyway — because it's simple, comparable, and the number buyers have been trained to shop on.",
      'Rate is useful because it is easy to compare. The decision improves when you compare it alongside the other costs and the time you expect to keep the loan.'
    ],
    [
      "That question can't be answered with a rate quote. It requires a Total Cost Analysis — a document that most advisors don't produce because it takes more work and sometimes points to a different product than the one that generates the most commission.",
      'That question cannot be answered with a rate quote alone. It requires a Total Cost Analysis that compares the available structures over the timeframes that could realistically apply to you.'
    ]
  ],
  'mortgage-under-management.html': [
    [
      'Most homeowners overpay their mortgage<br>for years after closing. Nobody tells them.',
      'Closing is the starting line.<br>The mortgage should keep being managed.'
    ],
    [
      "Missed refinance windows. PMI paid past the removal point. Rate drops nobody called about. Your mortgage doesn't stop working for or against you after you sign. I don't stop either.",
      'Your equity, PMI, refinance math, recast options, and next-purchase plan can change after closing. I keep reviewing the mortgage as your life and the market change.'
    ],
    ['Rate windows opened and closed twice since you bought. Did anyone call you?', 'What changed after you closed—and what should change next?'],
    [
      "Most lenders' business ends the day you sign. You get the keys, they get the commission, and the relationship is over. Your loan gets sold to a servicer. Nobody is watching it. Nobody is thinking about whether it still makes sense for you next year.",
      'Servicing keeps the loan running. Mortgage Under Management keeps the strategy under review: what has changed in your equity, credit, cash flow, goals, and available loan options since you signed?'
    ],
    ['The lender who closed your loan stopped thinking about it the day you signed. I haven\'t.', 'The loan is temporary. The strategy lasts.'],
    [
      'Mortgage under management means your mortgage advisor continues to actively monitor your loan after closing, watching rate movements, tracking your equity position, flagging PMI removal opportunities, and reaching out when a refinance or strategic move makes sense. Most lenders disappear after closing. Mortgage under management treats the loan as an ongoing financial asset to manage, not a transaction to complete.',
      'Mortgage under management means the strategy continues after closing: reviewing rate movements, equity, PMI eligibility, recast options, cash flow, and future plans as conditions change. It treats the loan as an ongoing financial decision, not a completed transaction.'
    ],
    [
      'Mortgage under management is an ongoing service model where the mortgage advisor continues to actively monitor your loan after closing. It includes tracking market rates for refinance opportunities, monitoring equity milestones and PMI removal eligibility, and conducting an annual review of your full financial picture. Most lenders disappear after closing. Mortgage under management treats the loan as an ongoing asset, not a completed transaction.',
      'Mortgage under management is an ongoing service model that reviews market rates, equity milestones, PMI eligibility, recast options, and the borrower\'s wider financial picture after closing. It treats the mortgage as an ongoing decision, not a completed transaction.'
    ],
    [
      'Three years pass. Rates drop. Your credit improves. Your home appreciates. You could remove PMI, refinance, or access equity strategically, but nobody tells you. The window comes and goes.',
      'Over time, rates, credit, equity, and life plans can change. A PMI request, refinance, recast, or equity decision may become worth reviewing—but only when the current numbers support it.'
    ],
    [
      "When you hit 20% equity, I flag it. Most homeowners keep paying PMI for years after they're eligible to remove it — because nobody told them.",
      'When the loan approaches a PMI milestone, I flag it so you can ask the servicer about eligibility, valuation, payment-history, and investor requirements.'
    ],
    [
      "A client closed in 2022 at 6.875%. In month 26 I flagged their equity had crossed 20% — they removed PMI and saved $287/month. Six months later rates dipped and I called with a no-cost refi analysis. They're now at 6.25% with no closing costs. Nobody would have called them. I did.",
      'A client closed in 2022 at 6.875%. In month 26, I flagged a potential PMI milestone; after the required review, they removed PMI and saved $287 per month. Six months later, we compared a lender-credit refinance and they chose a 6.25% structure with no upfront closing-cost payment.'
    ],
    [
      "Most lenders make money on the transaction. One deal, one commission, done. Mortgage under management changes the incentive structure — if your loan stops making sense for you, the right answer is to tell you, not to stay quiet and hope you don't notice.",
      'Mortgage Under Management makes the post-close review explicit. If the loan stops fitting the plan, the right next step is to compare the available choices and show the tradeoffs clearly.'
    ],
    [
      '"Most lenders\' business ends at your signature. Mine is designed to start there. The 81% regret statistic exists because most people are handed a loan and left alone with it. Mortgage under management is the alternative."',
      '"Closing is the starting line. Mortgage Under Management is how the strategy keeps adapting after the loan funds."'
    ],
    [
      'LA homeowners carry some of the largest average loan balances in the country. At $1M+, a 0.5% rate improvement saves roughly $420/month — over $5,000/year. Missing a single refinance window because nobody was watching is a five-figure mistake. LA also has significant appreciation cycles, which means equity builds faster here. That equity is a tool — for accessing capital, for funding a second property, for eliminating PMI ahead of schedule.',
      'Los Angeles homeowners often carry large loan balances, so even a modest change in rate, term, or mortgage insurance can materially affect cash flow. The exact benefit depends on the remaining balance, costs, hold period, and the options available at that time.'
    ],
    [
      "Most LA homeowners have substantial equity they're not using, because nobody has shown them how or when to access it strategically. Mortgage under management isn't a premium service in this market — it's the responsible default for anyone holding a seven-figure mortgage in an appreciating city.",
      'Equity can support a future purchase, renovation, debt decision, or simply remain untouched. The point is not to use it automatically; it is to understand the cost and consequence of each choice.'
    ],
    [
      'With a new appraisal, you can use current value rather than purchase price to establish 20% equity. Most homeowners keep paying PMI 12–24 months past eligibility, simply because nobody flagged it.',
      'Some investors and servicers allow borrower-requested PMI termination based on current value, subject to seasoning, valuation, payment history, and other requirements. Ask the servicer what applies to the specific loan.'
    ],
    [
      "Most homeowners don't. They check Zillow once a year and forget. But your home is your largest asset, and it's changing in value every month. Equity changes. Refi opportunities open and close. Local markets shift. Most lenders never tell you any of this.",
      'Home value estimates change, equity changes, and refinance opportunities open and close. A monthly estimate is a signal to review—not a substitute for an appraisal or a reason to borrow automatically.'
    ],
    [
      'You can request PMI removal once your loan balance reaches 80% of the original purchase price. Once the balance reaches 78%, the lender is legally required to automatically cancel PMI under federal law. However, many servicers do not act promptly, which means homeowners often continue paying PMI for 12 to 18 months past the point they were eligible to remove it.',
      'For many conventional principal-residence loans, a borrower may request PMI cancellation when the principal balance is scheduled to reach 80% of the home\'s original value if eligibility conditions are met. In general, automatic termination occurs when the balance is scheduled to reach 78% of original value and the loan is current. Investor, property, and loan rules vary.'
    ]
  ],
  'competitive-offer-strategy.html': [
    [
      "You're losing to cash offers<br>you could have beaten.",
      'The strongest offer starts<br>before you write it.'
    ],
    [
      'In LA, the deal is decided by the financing strategy you walked in with — not the offer you put on the table. Here are four ways financed buyers beat cash. One of them most buyers never know exists.',
      'What are you trying to make possible—and what risk does the seller need removed? Align underwriting, timing, contingencies, and communication before the right home appears.'
    ],
    ['A financed buyer can beat cash when the financing removes seller risk.', 'A financed buyer can compete with cash when the financing reduces seller risk.'],
    [
      '"Most advisors hand you a letter and call it done. I help you use financing as a competitive weapon."',
      '"The approval is only the starting point. The offer strategy should make the financing clear, credible, and responsive to the seller\'s real concerns."'
    ]
  ],
  'pmi-strategy.html': [
    [
      "Every month you wait to save 20% down,<br>the house you're saving for gets more expensive.",
      'Should you wait for 20% down—<br>or preserve cash and buy sooner?'
    ],
    [
      "PMI isn't the problem. Waiting is. Here's the math most buyers never run, and why getting in now with PMI often beats waiting by two or three years.",
      'The answer depends on PMI, price, reserves, rent, time horizon, and what else your money needs to accomplish. Run the comparison before choosing.'
    ],
    ['You\'ve been told to avoid PMI. Here\'s why that advice is costing you.', 'Is avoiding PMI actually the safer choice?'],
    [
      'In a market like LA, where appreciation has historically been significant, PMI is often the cost of entering the market years earlier, which means years more of equity growth, tax benefits, and locked-in pricing.',
      'In Los Angeles, PMI may be the cost of entering sooner—but appreciation, tax outcomes, and future prices are not guaranteed. The decision should be modeled across more than one scenario.'
    ],
    [
      'Private mortgage insurance typically costs between $150 and $300 per month on conventional loans in Los Angeles, depending on the loan amount, credit score, and down payment size. PMI is removed once the loan balance reaches 80% of the original purchase price, and is automatically cancelled by law at 78%.',
      'Private mortgage insurance cost varies by loan amount, credit profile, down payment, insurer, and coverage. For many conventional principal-residence loans, borrowers may request cancellation when the balance is scheduled to reach 80% of original value if conditions are met; automatic termination generally occurs at the scheduled 78% point when the loan is current.'
    ],
    [
      'PMI strategy is the strategic decision of when to pay Private Mortgage Insurance to enter the market earlier versus waiting to save a full 20% down payment. In most Los Angeles markets, paying $150 to $300 per month in PMI to buy two or three years earlier results in significantly more equity than waiting, because home appreciation typically exceeds the total cost of PMI over that timeframe.',
      'PMI strategy compares the premium and payment of buying with less than 20% down against waiting, renting, preserving reserves, and using cash elsewhere. Because appreciation and future rates are uncertain, the comparison should include more than one price and time-horizon scenario.'
    ],
    [
      'In appreciating markets like Los Angeles, the appreciation on the additional home value typically exceeds the PMI cost. Calculate both for your specific situation.',
      'Model several appreciation outcomes, including flat or declining values, and compare them with cumulative PMI, rent, reserves, and expected hold period.'
    ],
    [
      'On conventional loans, PMI automatically drops at 78% loan-to-value (22% equity). Estimate this date based on your down payment, mortgage principal payments, and expected appreciation.',
      'For many conventional loans, automatic termination generally occurs when the balance is scheduled to reach 78% of original value and the loan is current. Borrower-requested cancellation may be available earlier under applicable rules.'
    ],
    [
      "But PMI has one crucial feature that makes it a legitimate tool: it's temporary. Once your equity reaches 20%, it falls off. You're not paying it forever. And the cost of PMI for 3–4 years is usually far less than the cost of waiting 3–4 years to buy.",
      'PMI can be temporary, but it does not simply disappear whenever an estimate shows 20% equity. Cancellation timing and requirements depend on the loan, original or current value, payment history, servicer, and investor rules.'
    ],
    [
      'Buy today at current price. Pay PMI for 3 years (roughly $150–$300/month depending on loan size). Benefit from 3 years of appreciation. PMI falls off at 20% equity. In most LA scenarios: Scenario B wins.',
      'Buy today at the current price. Pay the quoted PMI and keep more cash outside the home. Model flat, rising, and falling values, then compare the result with waiting. Either scenario can win.'
    ],
    [
      '<strong>Private Mortgage Insurance (PMI) is not always the enemy. Used strategically, paying PMI to buy sooner with less down payment can be more profitable than waiting to save 20%.</strong> The math depends on home appreciation rates, your alternative investment returns, and how quickly you can remove PMI. In appreciating LA markets, every year you wait to save 20% down typically costs more than the cumulative PMI would have. PMI also drops automatically when you reach 22% equity on most conventional loans.',
      '<strong>PMI is a cost, not an automatic mistake.</strong> Compare the premium with rent, reserves, expected hold period, alternative uses of cash, and multiple home-price scenarios. For many conventional loans, automatic termination is tied to the scheduled 78% balance-to-original-value point and current payment status—not a general estimate of current equity.'
    ],
    [
      'Depending on your income and tax situation, PMI premiums may be deductible. This reduces the effective cost. Talk to your tax advisor — and factor this into the comparison before deciding a 20% down payment is automatically better.',
      'Tax treatment can change and depends on the household. Ask a qualified tax professional whether any mortgage-insurance deduction applies before including it in the comparison.'
    ],
    [
      "National PMI advice is calibrated to national median home prices — typically $350K–$450K. LA median prices are 2–3x higher. On a $900K purchase with 10% down, PMI might run $400–700/month. That's significant. But LA appreciation has historically been substantial — often 5–8% annually in strong cycles. Over 24 months on a $900K property, that's $90K–$144K in equity growth. The total PMI cost over the same period: $9,600–$16,800. The math still typically favors buying sooner.",
      'On a high-balance Los Angeles purchase, PMI can be material. Use an actual quote, then compare it with rent, reserves, cash invested elsewhere, and several home-price paths. Do not use a single appreciation assumption to justify the decision.'
    ],
    [
      'LA also tends to build equity toward PMI removal faster than other markets. A property bought in a strong LA neighborhood may already have enough appreciation to hit 20% equity for removal purposes — even before the scheduled amortization gets there. What we model: neighborhood appreciation trends, your specific timeline, and what you\'d otherwise do with the down payment capital.',
      'Current value may support an earlier borrower-requested PMI review for some loans, but seasoning, appraisal, payment-history, servicer, and investor rules can apply. Model the timeline without assuming appreciation will create eligibility.'
    ],
    [
      'In LA, the 20% target gets larger every year prices rise. Buyers who waited in 2019–2021 found themselves further from the goal in 2022 than when they started — despite saving aggressively. The PMI cost during those years would have been less than the missed appreciation.',
      'If prices rise while you wait, the target can move. If prices flatten or fall, waiting can help. Compare both outcomes before treating either path as the obvious answer.'
    ]
  ],
  'no-cost-refinance.html': [
    [
      'A no-cost refinance is not what most LOs say it is. Here is how the math actually works and when it is the right call in LA.',
      'See how lender credits, interest rate, monthly savings, and time horizon determine whether a no-cost refinance fits your plan.'
    ],
    [
      "Your last refinance probably cost you $8,000–$12,000 upfront.<br>Your next one doesn't have to cost a dollar.",
      'Should you pay refinance costs now—<br>or trade a higher rate for lender credits?'
    ],
    [
      "There's a structure that rolls all closing costs into the rate. You pay nothing to close. You save from day one. Here's exactly how it works.",
      'A no-cost refinance does not make costs disappear. It uses lender credits tied to a higher rate, or adds costs to the balance. Compare the tradeoffs before deciding.'
    ],
    [
      '<strong>No-Cost Refinance:</strong> A no-cost refinance is a mortgage refinance where all closing costs are rolled into a slightly higher interest rate rather than paid upfront. You pay nothing at closing. Savings begin on day one. There is no break-even period to wait through.',
      '<strong>No-Cost Refinance:</strong> A refinance advertised as no-cost or no-closing-cost generally covers upfront costs with lender credits tied to a higher interest rate, or adds the costs to the new loan balance. You pay less upfront, but the tradeoff can increase payment, total interest, or reduce equity.'
    ],
    ['A no-cost refinance only works when the break-even math works.', 'A no-cost refinance works only when the tradeoff fits your time horizon.'],
    [
      'When you refinance, there are two ways to handle closing costs: pay them out of pocket, or roll them into the loan. A no-cost refinance uses the second approach: the lender increases your interest rate slightly in exchange for covering the costs. You pay nothing at closing.',
      'Closing costs can be paid in cash, added to the new loan balance when permitted, or offset by lender credits tied to a higher interest rate. A no-cost refinance usually refers to one of the latter two structures.'
    ],
    [
      'Done correctly, this means you start saving immediately. There\'s no break-even period to wait through, no 30-month countdown before the refinance "pays for itself." Every month from day one, your payment is lower than it was.',
      'If the new payment is lower and lender credits cover the upfront costs, monthly savings may begin immediately. The tradeoff is that the rate is higher than the same refinance without credits, so the hold period still matters.'
    ],
    [
      '$0 closing costs. Slightly higher rate, but still lower than your current rate. You save from month one. Break-even: immediate.',
      'In this example, lender credits cover the upfront costs and the new payment is lower. Savings begin in month one, with a higher rate than the same refinance without credits.'
    ],
    [
      'If you plan to move, sell, or refinance again within 5–7 years, a no-cost structure almost always beats paying points. The break-even math rarely works in your favor with a short horizon.',
      'If you may move, sell, or refinance again within 5–7 years, compare lender credits with paying points across the shortest, longest, and most likely hold periods.'
    ],
    [
      'A no-cost refinance is a mortgage refinance where closing costs are rolled into the interest rate instead of being paid upfront at closing. You pay nothing out of pocket, your savings begin from day one, and there is no break-even period to wait through.',
      'A no-cost refinance generally offsets upfront costs with lender credits tied to a higher interest rate, or adds costs to the new balance. You pay less upfront, but the tradeoff may increase the payment, total interest, or loan balance.'
    ],
  [
    'A no-cost refinance is a mortgage refinance where all closing costs are rolled into a slightly higher interest rate rather than paid upfront. You pay nothing at closing. Savings begin on day one. There is no break-even period to wait through.',
    'A no-cost refinance generally uses lender credits tied to a higher interest rate, or adds costs to the new loan balance. It reduces upfront cash but can increase payment, total interest, or reduce equity.'
  ],
    [
      'A no-cost refinance rolls closing costs into the loan rate so you pay nothing upfront. Done correctly, you start saving immediately with no break-even period.',
      'A no-cost refinance reduces upfront cash by using lender credits tied to a higher rate, or by adding costs to the loan balance. Compare the tradeoff across realistic hold periods.'
    ],
    [
      "Most advisors don't lead with the no-cost structure because it produces a slightly smaller loan — and a slightly smaller commission. That's the real reason it's underused.",
      'A no-cost structure is one option, not the default. The right comparison is the same loan with and without credits across the time you may keep it.'
    ]
  ],
  'field-notes/no-cost-refinance.html': [
    [
      'A no-cost refinance works differently. Instead of paying closing costs upfront, you take a slightly higher interest rate and the lender uses the premium to cover those costs. You pay nothing at closing. Your savings start on day one. There is no break-even period to wait through.',
      'A no-cost refinance works differently. Instead of paying all closing costs upfront, lender credits tied to a higher interest rate may offset some or all of them, or permitted costs may be added to the new loan balance. You may pay less at closing, but the rate, payment, total interest, equity, and hold period still need to be compared.'
    ]
  ],
  'relocation-strategy.html': [
    [
      'Moving to LA for work? The mortgage is the part most people get wrong.',
      'Moving to LA for work? Build the financing around the move.'
    ],
    [
      'You have a new job, an offer letter, a relocation package, and maybe a home in another state you still need to sell. Plenty of moving parts, plenty of ways for a generic mortgage professional to mishandle them. I structure relocation loans for clients moving to El Segundo and the broader LA area constantly, and the financing has to be built around the relocation, not the other way around.',
      'You may have a new job, an offer letter, a relocation package, RSUs, and a home in another state to sell. Start with the life transition, then align income, timing, liquidity, and the loan around it.'
    ],
    ['⚠ What Most Mortgage Professionals Get Wrong', 'Relocation Risks to Resolve Early'],
    [
      'Most lenders default to "we need 30 days of paystubs." If your start date is two weeks away and your purchase is closing in three, that&rsquo;s a problem. The right lender uses offer-letter underwriting cleanly.',
      'Offer-letter income is not automatic. The start date, employment terms, loan type, reserves, and expected pay documentation need to fit the closing timeline.'
    ],
    [
      'You should know what your LA monthly payment looks like under offer-letter, dual-mortgage, departure-rental, and bridge structures, before you write the first offer. Most advisors just pick one and run.',
      'Compare the payment, cash, timing, and qualification impact of offer-letter, dual-mortgage, departure-rental, and bridge structures before writing the first offer.'
    ]
  ],
  'military-veterans.html': [
    [
      'VA loans are the most powerful loan in housing.<br><em style="color:var(--blue);font-style:normal">Most lenders bury them.</em>',
      'How should your VA benefit support<br><em style="color:var(--blue);font-style:normal">the life you are building?</em>'
    ],
    [
      "Zero down payment. No PMI ever. Competitive interest rates. Sellers can pay every dollar of your closing costs. The benefit can be used over and over again for life. And most lenders treat it like an inconvenience because they don't know how to work with it. I lead with it.",
      'For eligible borrowers, a VA-backed purchase loan may offer no down payment and no monthly PMI. Seller-paid costs, remaining entitlement, and repeat use can add flexibility. The right structure still depends on eligibility, appraisal, property, lender requirements, and any applicable funding fee.'
    ],
    ['Five things VA loans do that no other mortgage does.', 'Five VA loan features worth putting into the full plan.'],
    [
      'Up to the conforming loan limit, and beyond it in many cases. The benefit alone is worth tens of thousands of dollars compared to conventional loans that require 5% to 20% down.',
      'Eligible borrowers with sufficient entitlement may be able to buy with no down payment when the price does not exceed the appraised value. Loan size, entitlement, appraisal, and lender requirements still apply.'
    ],
    [
      "Conventional low-down loans charge $200 to $400 a month in private mortgage insurance. VA loans charge zero. Over a decade that's $24,000 to $48,000 you keep instead of pay.",
      'VA-backed loans do not require monthly PMI or MIP. Some borrowers may owe a one-time VA funding fee unless exempt, and every option should still be compared on total cost.'
    ],
    ['Most lenders treat VA loans like an inconvenience. I treat them like the gift they are.', 'The benefit is valuable. The strategy is deciding how to use it.'],
    ['Five things lenders say about VA loans that aren\'t true.', 'Five VA loan misconceptions to examine before choosing.'],
    ['No PMI ever', 'No monthly PMI'],
    [
      'A VA buyer can structure an offer where the seller pays every dollar of closing costs and prepaids. Combined with zero down, this means buyers can close on a home with truly minimal out-of-pocket cost.',
      'A seller may pay allowable closing costs, while separate seller concessions are subject to VA limits. Combined with zero down for an eligible borrower, that can reduce—but not always eliminate—cash needed at closing.'
    ],
    [
      'Your entitlement renews when a VA loan is paid off, meaning you can use the benefit again on your next home. In some cases you can even use it on two properties simultaneously through second-tier entitlement. Most lenders never explain this to their clients.',
      'Entitlement may be restored after a prior VA loan is paid off, and remaining entitlement may support another purchase in some cases. Ask for a calculation based on the Certificate of Eligibility, prior use, property, and loan amount.'
    ],
    [
      'The VA loan is one of the most powerful loans in housing — when the lender knows how to use it. Zero down payment. No PMI ever. Competitive interest rates. The seller can pay all your closing costs. Your full entitlement stays with you for life.',
      'A VA-backed loan can offer eligible borrowers no down payment, no monthly PMI, competitive terms, and seller-paid allowable costs. Eligibility, entitlement, appraisal, lender standards, closing costs, and any applicable funding fee still shape the final structure.'
    ],
    [
      'Most lenders treat VA loans like an inconvenience. I treat them like the gift they are.',
      'The benefit is valuable. The strategy is deciding how to use it without overlooking the tradeoffs.'
    ],
    [
      'VA buyers can structure offers where the seller pays every dollar of closing costs and prepaids, up to 4% of the loan amount in concessions. Combined with zero down, this can mean buying a home with truly minimal out-of-pocket cost.',
      'Sellers may pay allowable closing costs, and separate seller concessions are subject to VA rules. Combined with zero down for an eligible borrower, this can reduce the cash needed at closing.'
    ],
    [
      'Yes. Your VA loan entitlement is a lifetime benefit. Once a previous VA loan is paid off, the entitlement is restored and can be used again. In some cases entitlement can be used for multiple properties simultaneously through the second-tier entitlement program. Most lenders never explain this to clients.',
      'VA loan entitlement may be used again. Restoration and remaining-entitlement rules depend on prior use, payoff, property disposition, occupancy, loan amount, and the Certificate of Eligibility. Ask the lender to calculate the specific entitlement available.'
    ]
  ],
  'cal-condo.html': [
    [
      'The condo financing rules just changed. Most agents and sellers don&rsquo;t know yet.',
      'The condo financing rules changed. Does the project still fit the loan?'
    ],
    [
      'Either way, it&rsquo;s the version your loan officer should have given you. Choose the path that fits you.',
      'Either way, the goal is to see the project risk before it becomes a contract problem. Choose the path that fits you.'
    ]
  ],
  'faq.html': [
    [
      'No. Programs allow as little as 3% down for conventional loans, 3.5% for FHA, and 0% for VA and certain USDA loans. When you put down less than 20%, PMI applies — but PMI is a tool, not a penalty. In most LA neighborhoods, getting into a home two years earlier and building equity while paying PMI produces significantly better wealth outcomes than waiting to save a full 20%. The right strategy depends on your full financial picture, which is why we run the numbers first.',
      'No. Some programs allow low or no down payments for eligible borrowers, but minimums, mortgage insurance, fees, and property rules vary. Compare payment, reserves, PMI or other insurance, closing cash, and multiple price scenarios before deciding how much to put down.'
    ],
    [
      'Private Mortgage Insurance is a monthly premium paid when you put down less than 20%, protecting the lender in case of default. Typical cost is 0.5%–1.5% of the loan annually. PMI is temporary — it falls off once you reach 20% equity — and the cost is usually far less than the appreciation you\'d miss by waiting. In many LA scenarios, two years of home appreciation outpaces the total PMI paid. The decision isn\'t "avoid PMI at all costs" — it\'s "which approach produces the best outcome for your specific situation."',
      'PMI is generally required on conventional loans with less than 20% down, and cost varies by loan and borrower. For many principal-residence loans, you may request cancellation at the scheduled 80% balance-to-original-value point if conditions are met; automatic termination generally occurs at the scheduled 78% point when the loan is current. Compare the premium with rent, reserves, hold period, and several home-price scenarios.'
    ],
    [
      'This is the question I get most often, and the answer is almost always: no, if you\'re otherwise ready. You can refinance when rates drop — with a no-cost structure, potentially at no out-of-pocket expense. You cannot recover lost appreciation from years on the sidelines. In LA, median home values have increased significantly decade over decade despite rate cycles. The clients I\'ve seen hurt most by "waiting for rates" are the ones who waited and watched prices climb. Time in the market beats timing the market, even in real estate.',
      'There is no universal yes or no. Buying should fit the payment, cash reserves, expected hold period, and life plan at today\'s terms. Compare buying now with waiting scenarios, and do not assume a future rate, home price, or refinance will rescue the decision.'
    ],
    [
      'Almost always no if you are otherwise ready. You can refinance when rates drop — at no out-of-pocket expense with a no-cost structure. You cannot recover lost appreciation from years on the sidelines. Time in the market beats timing the market in real estate.',
      'There is no universal answer. Compare buying now with waiting based on payment, reserves, hold period, and several rate and home-price scenarios. Do not assume appreciation or a future refinance.'
    ],
    [
      'Private Mortgage Insurance is paid when you put down less than 20%. It is temporary, falls off at 20% equity, and the cost is usually far less than the appreciation missed by waiting. In many LA scenarios two years of appreciation outpaces the total PMI paid.',
      'PMI is generally required on conventional loans with less than 20% down. Borrower-requested and automatic cancellation rules differ, and appreciation is not guaranteed. Compare the quoted premium with rent, reserves, hold period, and several home-price scenarios.'
    ],
    [
      'Yes, and this matters a lot for clients at SpaceX, Aerospace Corp, Northrop, Boeing, Raytheon, Mattel, AT&T, and the other Fortune 500 employers in and around El Segundo. The general rule under conventional guidelines: RSUs can count as qualifying income if you have a documented two-year history of receiving them AND they are reasonably expected to continue for at least three years after closing, verified through your vesting schedule and grant documents. We typically use a two-year average of vested shares converted to dollars at a stable stock price. The strategy work is just as important: timing your application around upcoming vests, deciding whether to sell vested shares for down payment versus reserves, and structuring the loan to fit the lumpy nature of RSU income. Most mortgage professionals either ignore RSUs entirely or apply them incorrectly. I run this constantly for El Segundo tech and aerospace clients.',
      'Yes. RSUs may count as qualifying income when they have vested and been distributed and the applicable history, documentation, calculation, and continuance rules are met. Under Fannie Mae\'s March 2026 guidance, time-based awards generally require at least a 12-month history from the current employer; one-time time-based awards must be expected to continue for at least three years from the note date, while recurring and performance-based awards follow different rules. Vested shares may also count as assets.'
    ],
    [
      'Two different things and they are often confused. As income: your vested RSU history, averaged over two years, can count toward what you qualify for, subject to the continuance rule above. As assets: shares that have already vested (whether sold or held) can count toward down payment, closing costs, and reserves once we document the source and sale or transfer. Unvested future RSUs generally cannot be used as assets because you do not own them yet. Where the strategy gets interesting is the balance between selling vested shares to strengthen your loan position now versus holding them for upside, which is a real conversation we have based on your tax situation, the company outlook, and the loan structure that fits best.',
      'As income, eligible vested and distributed RSUs may count under the applicable history, calculation, and continuance rules. As assets, already-vested shares may support down payment, closing costs, or reserves once documented; unvested future shares generally are not available assets. The strategy is deciding what should support qualification, liquidity, or both.'
    ],
    [
      "A no-cost refinance rolls closing costs into the loan rate rather than charging them upfront. You take a slightly higher rate in exchange for paying nothing at closing. Done right — at the right rate spread and at the right time — you start saving immediately with no break-even period. This structure is especially powerful if you don't plan to stay in the home for 7+ years, or if you expect to refinance again when rates shift. I run the break-even analysis before recommending any refinance, period.",
      'A no-cost refinance generally reduces upfront cash by using lender credits tied to a higher interest rate, or by adding costs to the new balance. Compare the payment, total interest, loan balance, and likely hold period against the same refinance without credits before deciding.'
    ]
  ]
};

for (const [file, replacements] of Object.entries(pageReplacements)) {
  for (const [from, to] of replacements) replaceRequired(file, from, to);
}

console.log(`Updated ${changed.size} files:`);
for (const file of [...changed].sort()) console.log(`- ${file}`);
