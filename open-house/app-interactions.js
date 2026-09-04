function scrollToForm() {
  const section = byId('next-step');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function bindModuleEvents() {
  document.querySelectorAll('[data-scroll-form]').forEach(function (button) {
    button.addEventListener('click', function () {
      const strategy = button.getAttribute('data-strategy') || '';
      if (strategy) state.selectedStrategy = strategy;
      updateHiddenFields();
      track('open_house_strategy_cta', { selected_strategy: strategy });
      scrollToForm();
    });
  });

  document.querySelectorAll('[data-question-route]').forEach(function (link) {
    link.addEventListener('click', function () {
      track('open_house_question_selected', { selected_question: link.getAttribute('data-question-route') });
    });
  });

  if (state.rider.module === 'finance-smartly') bindStrategyCards();
  if (state.rider.module === 'wait-calculator') bindWaitCalculator();
  if (state.rider.module === 'pressure-test') bindPressureTest();
  if (state.rider.module === 'priority-selector') bindPrioritySelector();
  if (state.rider.module === 'liquidity-calculator') bindLiquidityCalculator();
  if (state.rider.module === 'wealth-calculator') bindWealthCalculator();
  if (state.rider.module === 'special-financing') bindSpecialFinancing();
}

function bindStrategyCards() {
  document.querySelectorAll('[data-select-strategy]').forEach(function (button) {
    button.addEventListener('click', function () {
      const id = button.getAttribute('data-select-strategy');
      const label = button.getAttribute('data-strategy-label') || id;
      document.querySelectorAll('[data-strategy-card]').forEach(function (card) {
        card.classList.toggle('is-selected', card.getAttribute('data-strategy-card') === id);
        const cardButton = card.querySelector('.strategy-select');
        if (cardButton) cardButton.textContent = card.getAttribute('data-strategy-card') === id ? 'Selected starting point' : 'Use this as my starting point';
      });
      state.selectedStrategy = label;
      state.interactionSummary = `Selected financing starting point: ${label}`;
      updateHiddenFields();
      track('open_house_strategy_selected', { selected_strategy: id });
    });
  });
}

function bindWaitCalculator() {
  const controls = ['waitMonths', 'futureRate', 'priceChange', 'monthlyRent', 'waitDownPayment'].map(byId).filter(Boolean);
  controls.forEach(function (control) {
    control.addEventListener('input', updateWaitCalculator);
    control.addEventListener('change', updateWaitCalculator);
  });
  updateWaitCalculator();
}

function updateWaitCalculator() {
  const property = state.property;
  const months = Number(byId('waitMonths').value);
  const futureRate = Number(byId('futureRate').value) / 100;
  const annualPriceChange = Number(byId('priceChange').value) / 100;
  const monthlyRent = Number(byId('monthlyRent').value);
  const downPaymentRate = Number(byId('waitDownPayment').value);
  const futurePrice = property.price * Math.pow(1 + annualPriceChange, months / 12);
  const nowLoan = property.price * (1 - downPaymentRate);
  const futureLoan = futurePrice * (1 - downPaymentRate);
  const nowPayment = monthlyPrincipalAndInterest(nowLoan, property.defaultRate, 30);
  const futurePayment = monthlyPrincipalAndInterest(futureLoan, futureRate, 30);
  const rentSpent = monthlyRent * months;
  const paymentDifference = futurePayment - nowPayment;
  const breakEven = breakEvenRate(futureLoan, nowPayment);

  setText('waitMonthsOutput', `${months} ${months === 1 ? 'month' : 'months'}`);
  setText('buyNowPayment', formatMoney(nowPayment));
  setText('futurePrice', formatMoney(futurePrice));
  setText('futurePriceNote', `After ${months} months at ${formatPercent(annualPriceChange, 1)} annual change`);
  setText('futurePayment', formatMoney(futurePayment));
  setText('rentSpent', formatMoney(rentSpent));

  const note = byId('waitResultNote');
  if (note) {
    if (Math.abs(paymentDifference) < 25) {
      note.textContent = `Under these assumptions, the future principal-and-interest payment is roughly the same, before including the ${formatMoney(rentSpent)} paid while waiting.`;
    } else if (paymentDifference < 0) {
      note.textContent = `Under these assumptions, waiting lowers principal and interest by about ${formatMoney(Math.abs(paymentDifference))} per month, before accounting for ${formatMoney(rentSpent)} of rent and the higher or lower purchase price.`;
    } else {
      note.textContent = `Under these assumptions, the lower-rate scenario still produces about ${formatMoney(paymentDifference)} more principal and interest per month because the future price and loan amount changed.`;
    }
  }
  setText('breakEvenNote', `At the projected price, the future rate would need to be about ${formatPercent(breakEven, 3)} to match today's principal-and-interest payment using the same down-payment percentage.`);

  state.selectedStrategy = 'Buy now versus wait comparison';
  state.interactionSummary = `Wait ${months} months; future rate ${formatPercent(futureRate, 3)}; annual price change ${formatPercent(annualPriceChange, 1)}; rent ${formatMoney(monthlyRent)}/month; down payment ${formatPercent(downPaymentRate, 0)}.`;
  updateHiddenFields();
}

function bindPressureTest() {
  document.querySelectorAll('[data-pressure-answer]').forEach(function (button) {
    button.addEventListener('click', function () {
      const question = button.closest('[data-pressure-question]');
      if (!question) return;
      question.querySelectorAll('[data-pressure-answer]').forEach(function (item) {
        item.classList.toggle('is-selected', item === button);
      });
      question.setAttribute('data-score', button.getAttribute('data-pressure-answer'));
      updatePressureResult();
    });
  });
}

function updatePressureResult() {
  const questions = Array.from(document.querySelectorAll('[data-pressure-question]'));
  const answered = questions.filter(function (question) { return question.hasAttribute('data-score'); });
  const score = answered.reduce(function (sum, question) { return sum + Number(question.getAttribute('data-score')); }, 0);
  const result = byId('pressureResult');
  if (!result) return;
  const heading = result.querySelector('h3');
  const copy = result.querySelector('p');

  if (answered.length < questions.length) {
    heading.textContent = `${answered.length} of ${questions.length} questions answered.`;
    copy.textContent = 'Finish the pressure test to see which part of the decision deserves attention first.';
  } else if (score >= 8) {
    heading.textContent = 'The decision has a stronger foundation. Now structure it carefully.';
    copy.textContent = 'Your answers suggest the home and time horizon may fit. The next step is protecting reserves, comparing financing tradeoffs, and testing the payment under less comfortable assumptions.';
  } else if (score >= 5) {
    heading.textContent = 'The decision may work, but some tradeoffs need to be made explicit.';
    copy.textContent = 'The next conversation should focus on the uncertain answers before optimizing rate or down payment.';
  } else {
    heading.textContent = 'The next step is not a bigger preapproval. It is a clearer plan.';
    copy.textContent = 'Several parts of the decision are not yet stable. That does not automatically mean no. It means the financing should not outrun the life decision.';
  }

  const answers = questions.map(function (question) {
    return `${question.getAttribute('data-pressure-question')}:${question.getAttribute('data-score') || 'unanswered'}`;
  });
  state.selectedStrategy = 'Decision pressure test';
  state.interactionSummary = `Pressure-test score ${score}/10. ${answers.join(', ')}`;
  updateHiddenFields();
}

function bindPrioritySelector() {
  document.querySelectorAll('[data-priority]').forEach(function (button) {
    button.addEventListener('click', function () {
      const selected = Array.from(document.querySelectorAll('[data-priority].is-selected'));
      if (!button.classList.contains('is-selected') && selected.length >= 2) {
        selected[0].classList.remove('is-selected');
      }
      button.classList.toggle('is-selected');
      updatePriorityResult();
    });
  });
}

function updatePriorityResult() {
  const selectedKeys = Array.from(document.querySelectorAll('[data-priority].is-selected')).map(function (button) {
    return button.getAttribute('data-priority');
  });
  const result = byId('priorityResult');
  if (!result) return;
  const heading = result.querySelector('h3');
  const copy = result.querySelector('p');

  if (!selectedKeys.length) {
    heading.textContent = 'Select one or two priorities.';
    copy.textContent = 'The goal is not to choose a product yet. It is to identify which tradeoffs deserve to be compared.';
    state.selectedStrategy = '';
    state.interactionSummary = '';
  } else {
    const selected = selectedKeys.map(function (key) { return PRIORITIES[key]; });
    heading.textContent = selected.map(function (item) { return item.title; }).join(' + ');
    copy.textContent = selected.map(function (item) { return item.description; }).join(' ');
    state.selectedStrategy = selected.map(function (item) { return item.label; }).join(' + ');
    state.interactionSummary = `Selected priorities: ${state.selectedStrategy}`;
  }
  updateHiddenFields();
}

function bindLiquidityCalculator() {
  const availableCash = byId('availableCash');
  if (availableCash) {
    availableCash.addEventListener('input', renderLiquidityTable);
    availableCash.addEventListener('change', renderLiquidityTable);
  }
  renderLiquidityTable();
}

function renderLiquidityTable() {
  const root = byId('liquidityTableWrap');
  const cashInput = byId('availableCash');
  if (!root || !cashInput) return;
  const availableCash = Math.max(0, Number(cashInput.value));
  const options = [
    { down: 0.10, rate: 0.06875, pmi: 0.0048 },
    { down: 0.15, rate: 0.06625, pmi: 0.0032 },
    { down: 0.20, rate: 0.065, pmi: 0 }
  ];
  const currentSelected = state.selectedStrategy.match(/(10|15|20)% down/);
  const selectedDown = currentSelected ? Number(currentSelected[1]) / 100 : 0.15;

  root.innerHTML = `<table class="liquidity-table">
    <thead><tr><th>Structure</th><th>Cash to close</th><th>Cash remaining</th><th>Monthly cost</th><th></th></tr></thead>
    <tbody>${options.map(function (option) {
      const metrics = scenarioMetrics(state.property, option.down, option.rate, option.pmi, state.property.financing.sellerCredit);
      const remaining = availableCash - metrics.cashToClose;
      const selected = Math.abs(option.down - selectedDown) < 0.001;
      return `<tr class="${selected ? 'is-selected' : ''}" data-liquidity-row="${option.down}">
        <td><strong>${formatPercent(option.down, 0)} down</strong></td>
        <td>${formatMoney(metrics.cashToClose)}</td>
        <td><strong>${remaining >= 0 ? formatMoney(remaining) : `Short ${formatMoney(Math.abs(remaining))}`}</strong></td>
        <td>${formatMoney(metrics.totalMonthly)}</td>
        <td><button class="table-select" type="button" data-liquidity-select="${option.down}">${selected ? 'Selected' : 'Choose'}</button></td>
      </tr>`;
    }).join('')}</tbody>
  </table>`;

  root.querySelectorAll('[data-liquidity-select]').forEach(function (button) {
    button.addEventListener('click', function () {
      const down = Number(button.getAttribute('data-liquidity-select'));
      state.selectedStrategy = `${formatPercent(down, 0)} down liquidity comparison`;
      state.interactionSummary = `Available cash ${formatMoney(availableCash)}; selected ${formatPercent(down, 0)} down.`;
      updateHiddenFields();
      renderLiquidityTable();
      track('open_house_liquidity_selected', { down_payment: down, available_cash: availableCash });
    });
  });
}

function bindWealthCalculator() {
  const controls = ['wealthYears', 'wealthAppreciation', 'wealthDownPayment', 'wealthRate'].map(byId).filter(Boolean);
  controls.forEach(function (control) {
    control.addEventListener('input', updateWealthCalculator);
    control.addEventListener('change', updateWealthCalculator);
  });
  updateWealthCalculator();
}

function updateWealthCalculator() {
  const years = Number(byId('wealthYears').value);
  const appreciationRate = Number(byId('wealthAppreciation').value) / 100;
  const downPaymentRate = Number(byId('wealthDownPayment').value);
  const annualRate = Number(byId('wealthRate').value) / 100;
  const model = fiveYearModel(state.property, downPaymentRate, annualRate, years, appreciationRate);

  setText('wealthAppreciationOutput', formatPercent(appreciationRate, 2));
  setText('wealthFutureValue', formatMoney(model.futureValue));
  setText('wealthFutureValueNote', `At year ${years}`);
  setText('wealthPrincipal', formatMoney(model.principalReduction));
  setText('wealthAppreciationValue', formatMoney(model.appreciation));
  setText('wealthNetProceeds', formatMoney(model.netSaleProceeds));

  const result = byId('wealthResultNote');
  if (result) {
    const created = model.appreciation + model.principalReduction;
    result.textContent = `Under these assumptions, appreciation and principal reduction create about ${formatMoney(created)} of gross equity. Estimated selling costs are ${formatMoney(model.sellingCosts)}, and the initial estimated cash to close is ${formatMoney(model.startingCash)}.`;
  }

  state.selectedStrategy = `${years}-year property wealth model`;
  state.interactionSummary = `${years} years; appreciation ${formatPercent(appreciationRate, 2)}; down payment ${formatPercent(downPaymentRate, 0)}; illustrative rate ${formatPercent(annualRate, 3)}; net sale proceeds ${formatMoney(model.netSaleProceeds)}.`;
  updateHiddenFields();
}

function bindSpecialFinancing() {
  document.querySelectorAll('[data-special-option]').forEach(function (button) {
    button.addEventListener('click', function () {
      const id = button.getAttribute('data-special-option');
      const label = button.getAttribute('data-special-label') || id;
      document.querySelectorAll('[data-special-option]').forEach(function (item) {
        const selected = item === button;
        item.textContent = selected ? 'Selected use to compare' : 'Compare this use';
        const card = item.closest('.module-card');
        if (card) card.classList.toggle('module-card-dark', selected);
      });
      state.selectedStrategy = label;
      state.interactionSummary = `Selected incentive use: ${label}`;
      updateHiddenFields();
      track('open_house_special_financing_selected', { selected_use: id });
      scrollToForm();
    });
  });
}

function bindForm() {
  const form = byId('strategyForm');
  if (!form) return;
  form.addEventListener('submit', function (event) {
    const firstName = byId('firstNameInput');
    const phone = byId('phoneInput');
    const email = byId('emailInput');
    const error = byId('formError');
    [firstName, phone, email].forEach(function (field) {
      if (field) field.removeAttribute('aria-invalid');
    });

    let message = '';
    if (!firstName.value.trim()) {
      message = 'Please add your first name.';
      firstName.setAttribute('aria-invalid', 'true');
      firstName.focus();
    } else if (!phone.value.trim() && !email.value.trim()) {
      message = 'Please add a mobile number or email so I can respond.';
      phone.setAttribute('aria-invalid', 'true');
      email.setAttribute('aria-invalid', 'true');
      phone.focus();
    } else if (email.value.trim() && !email.checkValidity()) {
      message = 'Please check the email address.';
      email.setAttribute('aria-invalid', 'true');
      email.focus();
    }

    if (message) {
      event.preventDefault();
      error.textContent = message;
      return;
    }

    error.textContent = '';
    updateHiddenFields();
    track('open_house_strategy_brief_submitted', {
      selected_strategy: state.selectedStrategy || 'not_selected',
      contact_method: phone.value.trim() ? 'phone' : 'email'
    });
  });
}

function bindHero() {
  const primary = byId('heroPrimary');
  if (primary) {
    primary.addEventListener('click', function () {
      track('open_house_primary_cta_clicked', { cta_text: state.rider.primaryCta });
    });
  }
}
