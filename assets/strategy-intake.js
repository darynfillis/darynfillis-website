(function () {
  'use strict';

  var config = window.STRATEGY_INTAKE_CONFIG;
  if (!config) return;

  var state = {
    applicationStatus: '',
    transaction: '',
    primaryOutcome: '',
    timeHorizon: '',
    payoffGoal: '',
    liquidityTradeoff: '',
    purchaseCash: '',
    reserves: '',
    downPaymentPreference: '',
    saleDependency: '',
    refinanceOutcome: '',
    cashOutPurpose: '',
    extraDebtPayments: '',
    extraDebtAmount: '',
    majorPurchase: '',
    majorPurchaseDetails: '',
    incomeOutlook: '',
    rateRisk: '',
    closingCosts: '',
    assumptions: '',
    propertyAppreciation: '',
    investmentReturn: '',
    additionalContext: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  };

  var currentStep = 'welcome';
  var history = [];
  var screen = document.getElementById('screen');
  var backButton = document.getElementById('backButton');
  var progressBar = document.getElementById('progressBar');
  var stepMeta = document.getElementById('stepMeta');
  var stepKicker = document.getElementById('stepKicker');
  var stepCount = document.getElementById('stepCount');
  var keyboardHint = document.getElementById('keyboardHint');

  function activeSteps() {
    return config.steps.filter(function (step) {
      return !step.when || step.when(state);
    });
  }

  function getStep(id) {
    return config.steps.find(function (step) { return step.id === id; });
  }

  function titleFor(value) {
    return typeof value === 'function' ? value(state) : value;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function displayValue(field, value) {
    if (!value) return 'Not provided';
    return config.labels[field] && config.labels[field][value]
      ? config.labels[field][value]
      : value;
  }

  function questionHeader(step, number) {
    return '<div class="question-number">Question ' + number + '</div>' +
      '<h2 id="screenTitle">' + escapeHtml(titleFor(step.title)) + '</h2>' +
      (step.description ? '<p class="lead">' + escapeHtml(titleFor(step.description)) + '</p>' : '');
  }

  function renderWelcome() {
    return '<div class="intro-grid">' +
      '<div>' +
        '<div class="question-number">Mortgage strategy intake</div>' +
        '<h1 id="screenTitle">The application tells me what you qualify for. This tells me what the mortgage needs to do.</h1>' +
        '<p class="lead">This short planning interview captures priorities, tradeoffs, timing, and future decisions that a standard mortgage application does not explain.</p>' +
        '<div class="notice-card"><div class="notice-title">This is not the mortgage application.</div><div class="notice-copy">If your secure application and credit report are already complete, the form skips application-style information and moves directly into strategy. If they are not complete, sensitive financial details still remain in the secure application.</div></div>' +
        '<div class="action-row"><button class="btn btn-primary" type="button" data-action="start">Start the intake <span aria-hidden="true">&rarr;</span></button></div>' +
        '<p class="helper">Estimated time: 5 to 7 minutes. This discussion mockup does not submit or store answers.</p>' +
      '</div>' +
      '<aside class="intro-aside" aria-label="Intake safeguards">' +
        '<div class="trust-item"><span class="trust-icon" aria-hidden="true">1</span><span class="trust-copy"><strong>Smart routing</strong><span>Only questions relevant to the selected scenario appear.</span></span></div>' +
        '<div class="trust-item"><span class="trust-icon" aria-hidden="true">2</span><span class="trust-copy"><strong>No duplicate file data</strong><span>Completed application and credit information are not requested again.</span></span></div>' +
        '<div class="trust-item"><span class="trust-icon" aria-hidden="true">3</span><span class="trust-copy"><strong>Strategy first</strong><span>The output is organized for an advisor conversation, not a generic quote.</span></span></div>' +
      '</aside>' +
    '</div>';
  }

  function renderOptions(step) {
    var selected = state[step.field];
    return '<div class="options' + (step.twoColumn ? ' two-col' : '') + '">' +
      step.options.map(function (item, index) {
        var isSelected = selected === item.value;
        return '<button class="option' + (isSelected ? ' selected' : '') + '" type="button" data-field="' + escapeHtml(step.field) + '" data-value="' + escapeHtml(item.value) + '" aria-pressed="' + (isSelected ? 'true' : 'false') + '">' +
          '<span class="option-key" aria-hidden="true">' + String.fromCharCode(65 + index) + '</span>' +
          '<span class="option-copy"><span class="option-title">' + escapeHtml(item.title) + '</span>' +
          (item.description ? '<span class="option-desc">' + escapeHtml(item.description) + '</span>' : '') +
          '</span></button>';
      }).join('') +
    '</div>';
  }

  function renderNotice(step, number) {
    return questionHeader(step, number) +
      '<div class="notice-card">' +
        '<div class="notice-title">' + escapeHtml(step.noticeTitle || '') + '</div>' +
        '<ul class="notice-list">' + (step.bullets || []).map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      '<div class="action-row">' +
        '<button class="btn btn-primary" type="button" data-action="continue">' + escapeHtml(step.primaryAction || 'Continue') + ' <span aria-hidden="true">&rarr;</span></button>' +
        (step.secondaryLink ? '<a class="btn btn-ghost" href="' + escapeHtml(step.secondaryLink.href) + '" target="_blank" rel="noopener">' + escapeHtml(step.secondaryLink.label) + '</a>' : '') +
      '</div>';
  }

  function renderText(step, number) {
    return questionHeader(step, number) +
      '<div class="fields"><div class="field full">' +
        '<label for="textResponse">Your response' + (step.optional ? ' <span style="font-weight:400;color:var(--muted)">(optional)</span>' : '') + '</label>' +
        '<textarea id="textResponse" data-state-field="' + escapeHtml(step.field) + '" placeholder="' + escapeHtml(step.placeholder || '') + '">' + escapeHtml(state[step.field]) + '</textarea>' +
      '</div></div>' +
      '<div class="action-row"><button class="btn btn-primary" type="button" data-action="continue">Continue <span aria-hidden="true">&rarr;</span></button>' +
      (step.optional ? '<button class="btn-link" type="button" data-action="skip">Skip</button>' : '') + '</div>';
  }

  function renderAssumptions(step, number) {
    return questionHeader(step, number) +
      '<div class="notice-card warning"><div class="notice-title">Hypothetical inputs only</div><div class="notice-copy">These percentages are used to compare scenarios. They do not represent a promise of property appreciation or investment performance.</div></div>' +
      '<div class="fields">' +
        '<div class="field"><label for="propertyAppreciation">Annual property appreciation assumption</label><input id="propertyAppreciation" data-state-field="propertyAppreciation" inputmode="decimal" value="' + escapeHtml(state.propertyAppreciation) + '" placeholder="For example: 3.0"><span class="field-note">Percent per year</span></div>' +
        '<div class="field"><label for="investmentReturn">Annual alternative investment-return assumption</label><input id="investmentReturn" data-state-field="investmentReturn" inputmode="decimal" value="' + escapeHtml(state.investmentReturn) + '" placeholder="For example: 5.0"><span class="field-note">Percent per year</span></div>' +
      '</div>' +
      '<div class="action-row"><button class="btn btn-primary" type="button" data-action="continue">Continue <span aria-hidden="true">&rarr;</span></button><button class="btn-link" type="button" data-action="skip">Skip</button></div>';
  }

  function renderContact(step, number) {
    var existingFile = state.applicationStatus === 'complete' || state.applicationStatus === 'app_only';
    return questionHeader(step, number) +
      '<div class="fields">' +
        (existingFile ? '' :
          '<div class="field"><label for="firstName">First name</label><input id="firstName" data-state-field="firstName" autocomplete="given-name" value="' + escapeHtml(state.firstName) + '"></div>' +
          '<div class="field"><label for="lastName">Last name <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input id="lastName" data-state-field="lastName" autocomplete="family-name" value="' + escapeHtml(state.lastName) + '"></div>') +
        '<div class="field' + (existingFile ? ' full' : '') + '"><label for="email">Email</label><input id="email" data-state-field="email" type="email" autocomplete="email" value="' + escapeHtml(state.email) + '" placeholder="you@example.com"></div>' +
        (existingFile ? '' : '<div class="field"><label for="phone">Mobile phone <span style="font-weight:400;color:var(--muted)">(optional)</span></label><input id="phone" data-state-field="phone" type="tel" autocomplete="tel" value="' + escapeHtml(state.phone) + '" placeholder="(424) 555-0123"></div>') +
      '</div>' +
      '<div class="validation" id="contactValidation"></div>' +
      '<div class="action-row"><button class="btn btn-primary" type="button" data-action="validate-contact">Review answers <span aria-hidden="true">&rarr;</span></button></div>';
  }

  function addReviewItem(items, label, field, directValue) {
    var value = directValue !== undefined ? directValue : displayValue(field, state[field]);
    if (directValue !== undefined && !directValue) return;
    items.push([label, value || 'Not provided']);
  }

  function renderReview(step, number) {
    var items = [];
    addReviewItem(items, 'Application status', 'applicationStatus');
    addReviewItem(items, 'Scenario', 'transaction');
    addReviewItem(items, 'Top priority', 'primaryOutcome');
    addReviewItem(items, 'Time horizon', 'timeHorizon');
    addReviewItem(items, 'Payoff direction', 'payoffGoal');
    addReviewItem(items, 'Liquidity tradeoff', 'liquidityTradeoff');

    if (['purchase', 'move_up', 'investment'].indexOf(state.transaction) !== -1) {
      addReviewItem(items, 'Available purchase cash', 'purchaseCash');
      addReviewItem(items, 'Preferred reserves', 'reserves');
      addReviewItem(items, 'Down-payment approach', 'downPaymentPreference');
    }
    if (['purchase', 'move_up'].indexOf(state.transaction) !== -1) addReviewItem(items, 'Sale dependency', 'saleDependency');
    if (['refinance', 'equity'].indexOf(state.transaction) !== -1) addReviewItem(items, 'Refinance objective', 'refinanceOutcome');
    addReviewItem(items, 'Use of equity', null, state.cashOutPurpose);
    addReviewItem(items, 'Extra debt payments', 'extraDebtPayments');
    addReviewItem(items, 'Extra payment detail', null, state.extraDebtAmount);
    addReviewItem(items, 'Major cash need', 'majorPurchase');
    addReviewItem(items, 'Future cash need detail', null, state.majorPurchaseDetails);
    addReviewItem(items, 'Income outlook', 'incomeOutlook');
    addReviewItem(items, 'Rate-risk preference', 'rateRisk');
    addReviewItem(items, 'Closing-cost approach', 'closingCosts');
    addReviewItem(items, 'Planning assumptions', 'assumptions');
    if (state.assumptions === 'custom') {
      addReviewItem(items, 'Property appreciation assumption', null, state.propertyAppreciation ? state.propertyAppreciation + '%' : 'Not provided');
      addReviewItem(items, 'Investment-return assumption', null, state.investmentReturn ? state.investmentReturn + '%' : 'Not provided');
    }
    addReviewItem(items, 'Additional context', null, state.additionalContext);
    addReviewItem(items, 'File match', null, state.email);

    return '<div class="question-number">Final review</div>' +
      '<h2 id="screenTitle">Review the planning picture.</h2>' +
      '<p class="lead">This is the advisor-facing summary the final system should deliver. Application and credit facts remain in the secure loan file.</p>' +
      '<div class="review-grid">' + items.map(function (item) {
        return '<div class="review-item"><div class="review-label">' + escapeHtml(item[0]) + '</div><div class="review-value">' + escapeHtml(item[1]) + '</div></div>';
      }).join('') + '</div>' +
      '<div class="demo-banner"><strong>Demo mode:</strong> selecting “Complete mockup” only advances to a confirmation screen. Nothing is sent to Netlify, email, a CRM, or a loan system.</div>' +
      '<div class="action-row"><button class="btn btn-blue" type="button" data-action="complete">Complete mockup <span aria-hidden="true">&rarr;</span></button><button class="btn btn-ghost" type="button" data-action="back">Make a change</button></div>';
  }

  function renderComplete() {
    var needsApplication = state.applicationStatus !== 'complete';
    return '<div class="complete-icon" aria-hidden="true">&#10003;</div>' +
      '<h2 id="screenTitle">The strategy intake is complete.</h2>' +
      '<p class="lead"><strong>Mockup behavior:</strong> no answers were transmitted or stored. In production, this screen would confirm delivery, attach the strategy summary to the correct client record, and identify the next step.</p>' +
      '<div class="notice-card"><div class="notice-title">Recommended next step for this branch</div><div class="notice-copy">' +
        (needsApplication
          ? 'Route the client to the secure NEO application for any remaining identity, income, asset, liability, property, or credit information.'
          : 'Notify Daryn that the strategy interview is ready for review without asking the client to repeat application or credit information.') +
      '</div></div>' +
      '<div class="action-row"><button class="btn btn-primary" type="button" data-action="restart">Restart mockup</button>' +
      (needsApplication ? '<a class="btn btn-ghost" href="' + escapeHtml(config.secureApplicationUrl) + '" target="_blank" rel="noopener">Open secure application</a>' : '<a class="btn btn-ghost" href="/schedule">Schedule a conversation</a>') +
      '</div>';
  }

  function renderStep(step, number) {
    if (step.type === 'choice') return questionHeader(step, number) + renderOptions(step);
    if (step.type === 'notice') return renderNotice(step, number);
    if (step.type === 'text') return renderText(step, number);
    if (step.type === 'assumptions') return renderAssumptions(step, number);
    if (step.type === 'contact') return renderContact(step, number);
    if (step.type === 'review') return renderReview(step, number);
    return '<h2 id="screenTitle">This step could not be displayed.</h2><div class="action-row"><button class="btn btn-primary" type="button" data-action="restart">Restart</button></div>';
  }

  function updateChrome() {
    var steps = activeSteps();
    var index = steps.findIndex(function (step) { return step.id === currentStep; });
    var isWelcome = currentStep === 'welcome';
    var isComplete = currentStep === 'complete';

    stepMeta.hidden = isWelcome || isComplete;
    backButton.hidden = isWelcome || isComplete || history.length === 0;

    if (!isWelcome && !isComplete && index !== -1) {
      stepKicker.textContent = steps[index].kicker || 'Mortgage strategy';
      stepCount.textContent = 'Step ' + (index + 1) + ' of ' + steps.length;
      progressBar.style.width = Math.round(((index + 1) / steps.length) * 100) + '%';
    } else {
      progressBar.style.width = isComplete ? '100%' : '0%';
    }

    if (isWelcome) keyboardHint.innerHTML = 'Press <kbd>Enter</kbd> to begin';
    else if (isComplete) keyboardHint.textContent = 'Mockup complete';
    else {
      var step = getStep(currentStep);
      keyboardHint.innerHTML = step && step.type === 'choice' ? 'Select an answer' : 'Press <kbd>Enter</kbd> to continue';
    }
  }

  function render() {
    screen.classList.remove('screen');
    void screen.offsetWidth;
    screen.classList.add('screen');

    if (currentStep === 'welcome') screen.innerHTML = renderWelcome();
    else if (currentStep === 'complete') screen.innerHTML = renderComplete();
    else {
      var steps = activeSteps();
      var index = steps.findIndex(function (step) { return step.id === currentStep; });
      var step = index === -1 ? steps[0] : steps[index];
      if (!step) {
        currentStep = 'welcome';
        screen.innerHTML = renderWelcome();
      } else {
        currentStep = step.id;
        screen.innerHTML = renderStep(step, index + 1);
      }
    }

    updateChrome();
    bindEvents();
  }

  function syncInputs() {
    screen.querySelectorAll('[data-state-field]').forEach(function (input) {
      state[input.getAttribute('data-state-field')] = input.value.trim();
    });
  }

  function bindEvents() {
    screen.querySelectorAll('[data-field][data-value]').forEach(function (button) {
      button.addEventListener('click', function () {
        var field = button.getAttribute('data-field');
        var value = button.getAttribute('data-value');
        state[field] = value;
        screen.querySelectorAll('[data-field="' + field + '"]').forEach(function (item) {
          item.classList.remove('selected');
          item.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('selected');
        button.setAttribute('aria-pressed', 'true');
        window.setTimeout(advance, 140);
      });
    });

    screen.querySelectorAll('[data-state-field]').forEach(function (input) {
      input.addEventListener('input', function () {
        state[input.getAttribute('data-state-field')] = input.value.trim();
      });
    });

    screen.querySelectorAll('[data-action]').forEach(function (element) {
      element.addEventListener('click', function () {
        var action = element.getAttribute('data-action');
        if (action === 'start' || action === 'continue' || action === 'skip') advance();
        if (action === 'validate-contact') validateContact();
        if (action === 'complete') goTo('complete');
        if (action === 'restart') restart();
        if (action === 'back') goBack();
      });
    });

    var firstInput = screen.querySelector('input, textarea');
    if (firstInput && currentStep !== 'contact_match') {
      window.setTimeout(function () { firstInput.focus({ preventScroll: true }); }, 80);
    }
  }

  function validateContact() {
    syncInputs();
    var existingFile = state.applicationStatus === 'complete' || state.applicationStatus === 'app_only';
    var messages = [];
    if (!existingFile && !state.firstName) messages.push('Enter a first name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) messages.push('Enter a valid email address.');

    var validation = document.getElementById('contactValidation');
    if (messages.length) {
      if (validation) {
        validation.textContent = messages.join(' ');
        validation.classList.add('show');
      }
      var target = !existingFile && !state.firstName ? document.getElementById('firstName') : document.getElementById('email');
      if (target) target.focus();
      return;
    }
    if (validation) validation.classList.remove('show');
    advance();
  }

  function nextStepId() {
    var steps = activeSteps();
    if (currentStep === 'welcome') return steps.length ? steps[0].id : 'complete';
    var index = steps.findIndex(function (step) { return step.id === currentStep; });
    return index !== -1 && index + 1 < steps.length ? steps[index + 1].id : 'complete';
  }

  function advance() {
    syncInputs();
    goTo(nextStepId());
  }

  function goTo(id) {
    if (id === currentStep) return;
    history.push(currentStep);
    currentStep = id;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    if (!history.length) return;
    currentStep = history.pop();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function restart() {
    Object.keys(state).forEach(function (key) { state[key] = ''; });
    history = [];
    currentStep = 'welcome';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backButton.addEventListener('click', goBack);

  document.addEventListener('keydown', function (event) {
    var active = document.activeElement;
    var typing = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

    if (!typing && currentStep !== 'welcome' && currentStep !== 'complete') {
      var key = event.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        var index = key.charCodeAt(0) - 65;
        var options = screen.querySelectorAll('[data-field][data-value]');
        if (options[index]) {
          event.preventDefault();
          options[index].click();
          return;
        }
      }
    }

    if (event.key !== 'Enter' || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
    if (active && active.tagName === 'TEXTAREA') return;
    if (active && active.matches('button, a')) return;

    if (currentStep === 'welcome') {
      event.preventDefault();
      advance();
      return;
    }
    if (currentStep === 'contact_match') {
      event.preventDefault();
      validateContact();
      return;
    }
    if (screen.querySelector('[data-action="continue"]')) {
      event.preventDefault();
      advance();
    }
  });

  render();
})();
