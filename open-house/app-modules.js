function menuModule() {
  const items = [
    ['get-rich-maybe', 'What actually creates wealth', 'See the four drivers that determine whether ownership improves your position.'],
    ['finance-smartly', 'Finance it smartly', 'Compare payment, liquidity, and flexibility across three structures.'],
    ['wait-for-rates', 'Wait or buy now', 'See what must happen for waiting to improve the numbers.'],
    ['today-tomorrow', 'Pressure-test the decision', 'See what the home gives you today and may limit tomorrow.'],
    ['no-best-mortgage', 'Build around your priorities', 'Start with the outcome you care about before choosing a loan.'],
    ['access-to-money', 'Protect liquidity', 'Compare what more money down saves with what cash retained protects.'],
    ['five-year-wealth', 'Model the next five years', 'Separate appreciation, principal reduction, and estimated selling costs.'],
    ['special-financing', 'Use the available financing', 'Understand the property-specific incentive and compare eligible uses.']
  ];

  return `<div class="decision-menu">${items.map(function (item, index) {
    return `<a class="decision-menu-card" href="${propertyUrl(item[0])}" data-question-route="${escapeHtml(item[0])}">
      <div>
        <span>QUESTION ${String(index + 1).padStart(2, '0')}</span>
        <h3>${escapeHtml(item[1])}</h3>
        <p>${escapeHtml(item[2])}</p>
      </div>
      <strong>Explore this question</strong>
    </a>`;
  }).join('')}</div>
  <div class="module-callout">
    <strong>The better question is rarely, “What is the rate?”</strong>
    <p>The rate belongs in the decision. So do the down payment, cash remaining, five-year cost, future plans, and the options you may need later.</p>
  </div>`;
}

function wealthDriversModule(property) {
  const model = fiveYearModel(property, 0.20, property.defaultRate, 5, property.defaultAppreciationRate);
  return `<div class="module-grid module-grid-4">
    <article class="module-card">
      <span class="module-number">DRIVER 01</span>
      <h3>Price movement</h3>
      <p>Appreciation can create equity, but it is not guaranteed and it varies by property, neighborhood, and time horizon.</p>
    </article>
    <article class="module-card">
      <span class="module-number">DRIVER 02</span>
      <h3>Principal reduction</h3>
      <p>Part of each principal-and-interest payment reduces the loan balance and becomes equity you own.</p>
    </article>
    <article class="module-card">
      <span class="module-number">DRIVER 03</span>
      <h3>Cash invested</h3>
      <p>The down payment and closing costs have an opportunity cost. That cash could have remained liquid or been used elsewhere.</p>
    </article>
    <article class="module-card">
      <span class="module-number">DRIVER 04</span>
      <h3>Ownership and exit costs</h3>
      <p>Interest, taxes, insurance, maintenance, HOA costs, and future selling costs belong in the wealth calculation.</p>
    </article>
  </div>
  <div class="metric-grid">
    <div class="metric"><span>Illustrative appreciation</span><strong>${formatMoney(model.appreciation)}</strong><small>${formatPercent(property.defaultAppreciationRate, 1)} annually for five years</small></div>
    <div class="metric"><span>Principal reduction</span><strong>${formatMoney(model.principalReduction)}</strong><small>Estimated after 60 payments</small></div>
    <div class="metric"><span>Estimated selling costs</span><strong>-${formatMoney(model.sellingCosts)}</strong><small>${formatPercent(property.estimatedSellingCostRate, 1)} of the projected value</small></div>
    <div class="metric metric-dark"><span>Equity created before carrying costs</span><strong>${formatMoney(model.appreciation + model.principalReduction)}</strong><small>Not a forecast or guaranteed return</small></div>
  </div>
  <div class="module-callout">
    <strong>One number is not the answer.</strong>
    <p>This quick view leaves out interest, taxes, insurance, maintenance, tax effects, and what your starting cash could earn elsewhere. The useful next step is a range of outcomes, not a promise.</p>
  </div>
  <div class="module-action-row">
    <a class="button button-primary" href="${propertyUrl('five-year-wealth')}" data-analytics-cta>Build the five-year model</a>
    <button class="button button-secondary module-action" type="button" data-scroll-form data-strategy="Five-year wealth analysis">Run the complete comparison</button>
  </div>`;
}

function financeSmartlyModule(property) {
  const scenarios = property.financing.scenarios || [];
  return `<div class="strategy-grid">${scenarios.map(function (scenario) {
    const metrics = scenarioMetrics(property, scenario.downPaymentRate, scenario.interestRate, scenario.pmiAnnualRate, scenario.sellerCredit);
    return `<article class="strategy-option" data-strategy-card="${escapeHtml(scenario.id)}">
      <span class="strategy-label">${escapeHtml(scenario.label)}</span>
      <h3>${escapeHtml(scenario.title)}</h3>
      <div class="strategy-numbers">
        <div><span>Estimated cash to close</span><strong>${formatMoney(metrics.cashToClose)}</strong></div>
        <div><span>Estimated monthly cost</span><strong>${formatMoney(metrics.totalMonthly)}</strong></div>
        <div><span>Down payment</span><strong>${formatPercent(scenario.downPaymentRate, 0)}</strong></div>
        <div><span>Cash retained*</span><strong>${formatMoney(Math.max(0, property.illustrativeBuyerCash - metrics.cashToClose))}</strong></div>
      </div>
      <div class="tradeoff"><span>What it gives you</span><p>${escapeHtml(scenario.gives)}</p></div>
      <div class="tradeoff cost"><span>What it asks you to accept</span><p>${escapeHtml(scenario.costs)}</p></div>
      <button class="strategy-select" type="button" data-select-strategy="${escapeHtml(scenario.id)}" data-strategy-label="${escapeHtml(scenario.title)}">Use this as my starting point</button>
    </article>`;
  }).join('')}</div>
  <p class="assumption-note">Illustrations assume the demo purchase price, estimated taxes and insurance, a 30-year fixed loan, and the listed seller credit applied to eligible costs. Rates and mortgage insurance are illustrative, not live quotes. *Cash retained uses the demo starting-cash assumption of ${formatMoney(property.illustrativeBuyerCash)}.</p>
  <div class="module-callout">
    <strong>None of these is the “best mortgage.”</strong>
    <p>The better structure depends on what your money needs to do after closing, how long you expect to own the home, and how much flexibility you value.</p>
  </div>`;
}

function waitCalculatorModule(property) {
  return `<div class="calculator-shell">
    <div class="calculator-controls">
      <h3>Change the assumptions</h3>
      <p>This is a decision model, not a market forecast.</p>
      <div class="control-stack">
        <div class="control">
          <label for="waitMonths">Months you might wait <span class="control-output" id="waitMonthsOutput">6 months</span></label>
          <input id="waitMonths" type="range" min="3" max="24" step="1" value="6">
        </div>
        <div class="control">
          <label for="futureRate">Possible future rate</label>
          <input id="futureRate" type="number" min="2" max="12" step="0.125" value="6.000">
        </div>
        <div class="control">
          <label for="priceChange">Expected annual price change</label>
          <input id="priceChange" type="number" min="-15" max="20" step="0.5" value="3.0">
        </div>
        <div class="control">
          <label for="monthlyRent">Monthly rent while waiting</label>
          <input id="monthlyRent" type="number" min="0" max="25000" step="100" value="4500">
        </div>
        <div class="control">
          <label for="waitDownPayment">Down payment in both cases</label>
          <select id="waitDownPayment"><option value="0.10">10%</option><option value="0.15">15%</option><option value="0.20" selected>20%</option></select>
        </div>
      </div>
    </div>
    <div class="calculator-results">
      <h3>What waiting would need to overcome</h3>
      <p>The numbers below compare principal and interest using the same down-payment percentage.</p>
      <div class="metric-grid">
        <div class="metric"><span>Buy-now P&amp;I</span><strong id="buyNowPayment">$0</strong><small>At the demo current rate</small></div>
        <div class="metric"><span>Future purchase price</span><strong id="futurePrice">$0</strong><small id="futurePriceNote">After six months</small></div>
        <div class="metric"><span>Future P&amp;I</span><strong id="futurePayment">$0</strong><small>At your future-rate assumption</small></div>
        <div class="metric metric-dark"><span>Rent paid while waiting</span><strong id="rentSpent">$0</strong><small>Before moving costs or rent increases</small></div>
      </div>
      <div class="result-note" id="waitResultNote">Change the assumptions to see what the decision depends on.</div>
      <p class="assumption-note" id="breakEvenNote"></p>
    </div>
  </div>
  <div class="module-action-row"><button class="button button-primary module-action" type="button" data-scroll-form data-strategy="Buy now versus wait comparison">Run this against my real situation</button></div>`;
}

function pressureTestModule() {
  const questions = [
    ['time-horizon', 'Could you realistically own this home for at least five years?', 'A shorter horizon gives transaction costs less time to be absorbed.'],
    ['reserves', 'Would meaningful reserves remain after closing?', 'Liquidity protects the plan from repairs, income changes, and the unexpected.'],
    ['payment', 'Would the payment still feel responsible during a difficult year?', 'Qualification is not the same as comfort or resilience.'],
    ['future-plans', 'Does this home support the major plans already on your horizon?', 'Career changes, family plans, renovations, and another move can change the right structure.'],
    ['life-fit', 'Does the home improve the life you are trying to build?', 'The financial plan should serve the life decision, not replace it.']
  ];

  return `<div class="pressure-test">${questions.map(function (question, index) {
    return `<article class="pressure-question" data-pressure-question="${escapeHtml(question[0])}">
      <div><h3>${index + 1}. ${escapeHtml(question[1])}</h3><p>${escapeHtml(question[2])}</p></div>
      <div class="answer-buttons" role="group" aria-label="Answer question ${index + 1}">
        <button class="answer-button" type="button" data-pressure-answer="2">Yes</button>
        <button class="answer-button" type="button" data-pressure-answer="1">Not sure</button>
        <button class="answer-button" type="button" data-pressure-answer="0">No</button>
      </div>
    </article>`;
  }).join('')}</div>
  <div class="pressure-result" id="pressureResult">
    <span>YOUR CURRENT SIGNAL</span>
    <h3>Answer the five questions to reveal where the decision needs more work.</h3>
    <p>The result will not tell you to buy or walk away. It will show whether the next step is loan optimization or better decision clarity.</p>
  </div>
  <div class="module-action-row"><button class="button button-primary module-action" type="button" data-scroll-form data-strategy="Decision pressure test">Review this with me</button></div>`;
}

function prioritySelectorModule() {
  return `<div class="priority-grid">${Object.keys(PRIORITIES).map(function (key, index) {
    const item = PRIORITIES[key];
    return `<button class="priority-button" type="button" data-priority="${escapeHtml(key)}"><span>PRIORITY ${String(index + 1).padStart(2, '0')}</span>${escapeHtml(item.label)}</button>`;
  }).join('')}</div>
  <div class="priority-result" id="priorityResult">
    <span>YOUR STARTING LENS</span>
    <h3>Select one or two priorities.</h3>
    <p>The goal is not to choose a product yet. It is to identify which tradeoffs deserve to be compared.</p>
  </div>
  <div class="module-action-row"><button class="button button-primary module-action" type="button" data-scroll-form data-strategy="Priority-based mortgage strategy">Build around these priorities</button></div>`;
}

function liquidityCalculatorModule(property) {
  return `<div class="calculator-shell">
    <div class="calculator-controls">
      <h3>How much cash is available?</h3>
      <p>Use a rough number. This does not need to include retirement accounts or emergency funds you do not plan to touch.</p>
      <div class="control-stack">
        <div class="control">
          <label for="availableCash">Available cash for the decision</label>
          <input id="availableCash" type="number" min="0" max="5000000" step="5000" value="${Math.round(property.illustrativeBuyerCash)}">
        </div>
      </div>
      <div class="result-note">The safer-looking payment is not always the more resilient balance sheet. The comparison needs both.</div>
    </div>
    <div class="calculator-results">
      <h3>Three liquidity choices</h3>
      <p>Select a row as the starting point for your Property Strategy Brief.</p>
      <div id="liquidityTableWrap"></div>
      <p class="assumption-note">Monthly estimates include principal, interest, estimated taxes, insurance, HOA, and illustrative mortgage insurance. The seller credit is assumed to offset eligible closing costs.</p>
    </div>
  </div>`;
}

function wealthCalculatorModule(property) {
  return `<div class="calculator-shell">
    <div class="calculator-controls">
      <h3>Build the range</h3>
      <p>Small changes in appreciation and timing can materially change the result.</p>
      <div class="control-stack">
        <div class="control">
          <label for="wealthYears">Ownership period</label>
          <select id="wealthYears"><option value="3">3 years</option><option value="5" selected>5 years</option><option value="7">7 years</option><option value="10">10 years</option></select>
        </div>
        <div class="control">
          <label for="wealthAppreciation">Annual appreciation <span class="control-output" id="wealthAppreciationOutput">3.0%</span></label>
          <input id="wealthAppreciation" type="range" min="-3" max="8" step="0.25" value="3">
        </div>
        <div class="control">
          <label for="wealthDownPayment">Down payment</label>
          <select id="wealthDownPayment"><option value="0.10">10%</option><option value="0.15">15%</option><option value="0.20" selected>20%</option></select>
        </div>
        <div class="control">
          <label for="wealthRate">Illustrative interest rate</label>
          <input id="wealthRate" type="number" min="2" max="12" step="0.125" value="${(property.defaultRate * 100).toFixed(3)}">
        </div>
      </div>
    </div>
    <div class="calculator-results">
      <h3>Estimated equity story</h3>
      <p>This separates price movement from principal reduction and estimates selling costs.</p>
      <div class="metric-grid">
        <div class="metric"><span>Projected property value</span><strong id="wealthFutureValue">$0</strong><small id="wealthFutureValueNote">At year five</small></div>
        <div class="metric"><span>Principal reduction</span><strong id="wealthPrincipal">$0</strong><small>Estimated loan balance reduction</small></div>
        <div class="metric"><span>Estimated appreciation</span><strong id="wealthAppreciationValue">$0</strong><small>Not guaranteed</small></div>
        <div class="metric metric-dark"><span>Net sale proceeds</span><strong id="wealthNetProceeds">$0</strong><small>After estimated loan payoff and selling costs</small></div>
      </div>
      <div class="result-note" id="wealthResultNote">Change the assumptions to see the range.</div>
      <p class="assumption-note">This quick model does not deduct interest, property taxes, insurance, HOA, maintenance, improvements, tax effects, or the alternative return on your starting cash. Those belong in the complete comparison.</p>
    </div>
  </div>
  <div class="module-action-row"><button class="button button-primary module-action" type="button" data-scroll-form data-strategy="Complete five-year property model">Build the complete comparison</button></div>`;
}

function specialFinancingModule(property) {
  const special = property.financing.special;
  return `<div class="special-banner">
    <div class="special-amount">${formatMoney(special.amount)}<small>Illustrative seller-paid financing support</small></div>
    <div class="special-copy"><h3>${escapeHtml(special.headline)}</h3><p>${escapeHtml(special.shortDescription)}</p></div>
  </div>
  <div class="module-grid module-grid-3 special-options">${special.options.map(function (option) {
    return `<article class="module-card special-option">
      <span class="module-number">${escapeHtml(option.label)}</span>
      <h3>${escapeHtml(option.title)}</h3>
      <p>${escapeHtml(option.description)}</p>
      <button class="strategy-select" type="button" data-special-option="${escapeHtml(option.id)}" data-special-label="${escapeHtml(option.title)}">Compare this use</button>
    </article>`;
  }).join('')}</div>
  <div class="module-callout"><strong>“Available” does not mean “best used one way.”</strong><p>The value depends on loan-program limits, eligibility, break-even timing, and what you want to protect: cash due at closing, monthly payment, or longer-term cost.</p></div>
  <p class="assumption-note">${escapeHtml(special.disclaimer)}</p>`;
}

function renderExperience() {
  const root = byId('experienceRoot');
  if (!root) return;
  const property = state.property;
  const renderers = {
    menu: menuModule,
    'wealth-drivers': wealthDriversModule,
    'finance-smartly': financeSmartlyModule,
    'wait-calculator': waitCalculatorModule,
    'pressure-test': pressureTestModule,
    'priority-selector': prioritySelectorModule,
    'liquidity-calculator': liquidityCalculatorModule,
    'wealth-calculator': wealthCalculatorModule,
    'special-financing': specialFinancingModule
  };
  const renderer = renderers[state.rider.module] || menuModule;
  root.innerHTML = renderer(property);
  bindModuleEvents();
}
