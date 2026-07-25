(function () {
  'use strict';

  var config = window.SCENARIO_DESK_CONFIG;
  if (!config) return;

  var state = { liabilities: [], noLiabilities: false };
  var current = 'welcome';
  var history = [];

  var screen = document.getElementById('screen');
  var backButton = document.getElementById('backButton');
  var progressBar = document.getElementById('progressBar');
  var stepMeta = document.getElementById('stepMeta');
  var stepKicker = document.getElementById('stepKicker');
  var stepCount = document.getElementById('stepCount');
  var keyboardHint = document.getElementById('keyboardHint');
  var formFrame = document.getElementById('formFrame');
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function resolve(value) {
    return typeof value === 'function' ? value(state) : value;
  }

  function activeSteps() {
    return config.steps.filter(function (step) {
      return !step.when || step.when(state);
    });
  }

  function getStep(id) {
    return config.steps.find(function (step) { return step.id === id; });
  }

  function activeIndex(id) {
    return activeSteps().findIndex(function (step) { return step.id === id; });
  }

  function nextId() {
    var steps = activeSteps();
    var index = activeIndex(current);
    return steps[index + 1] ? steps[index + 1].id : 'complete';
  }

  function goNext() {
    history.push(current);
    current = nextId();
    render();
  }

  function goBack() {
    var candidate;
    while (history.length) {
      candidate = history.pop();
      if (candidate === 'welcome' || activeIndex(candidate) !== -1) {
        current = candidate;
        render();
        return;
      }
    }
  }

  function restart() {
    state = { liabilities: [], noLiabilities: false };
    current = 'welcome';
    history = [];
    render();
  }

  function stepNumber(step) {
    return activeIndex(step.id) + 1;
  }

  function progressPercent() {
    if (current === 'welcome') return 0;
    if (current === 'complete') return 100;
    return Math.round((stepNumber(getStep(current)) / Math.max(1, activeSteps().length)) * 100);
  }

  function sourceBadge(step) {
    var source = resolve(step.source) || 'Scenario Desk Interview Form';
    return '<div class="source-badge"><span></span>' + escapeHtml(source) + '</div>';
  }

  function helpBlocks(step) {
    var data = step.help || {};
    if (!data.meaning && !data.where && !data.enter && !data.note) return '';
    return (data.meaning ? '<div class="help-block"><h3>What this means</h3><p>' + escapeHtml(resolve(data.meaning)) + '</p></div>' : '') +
      (data.where ? '<div class="help-block"><h3>Where to find it</h3><p>' + escapeHtml(resolve(data.where)) + '</p></div>' : '') +
      (data.enter ? '<div class="help-block"><h3>What to enter</h3><p>' + escapeHtml(resolve(data.enter)) + '</p></div>' : '') +
      (data.note ? '<div class="help-note"><strong>Important:</strong> ' + escapeHtml(resolve(data.note)) + '</div>' : '');
  }

  function renderHelp(step) {
    var blocks = helpBlocks(step);
    if (!blocks) return '';
    return '<aside class="help-panel" aria-label="Help for this question">' +
      '<div class="help-eyebrow">Help with this question</div>' + blocks + '</aside>';
  }

  function renderInlineHelp(step) {
    var blocks = helpBlocks(step);
    if (!blocks) return '';
    return '<details class="inline-help" open>' +
      '<summary>Help finding or understanding this information</summary>' +
      '<div class="inline-help-body">' + blocks + '</div>' +
    '</details>';
  }

  function renderLayout(step, mainHtml) {
    return '<div class="form-layout">' +
      '<div class="question-column">' + mainHtml + '</div>' +
      renderHelp(step) +
    '</div>';
  }

  function questionHeader(step, number) {
    return '<div class="question-number">Question ' + number + '</div>' +
      sourceBadge(step) +
      '<h2 id="screenTitle">' + escapeHtml(resolve(step.title)) + '</h2>' +
      (step.plain ? '<p class="lead">' + escapeHtml(resolve(step.plain)) + '</p>' : '') +
      renderInlineHelp(step);
  }

  function renderWelcome() {
    return '<div class="welcome-grid">' +
      '<div class="welcome-main">' +
        '<span class="eyebrow">Mortgage strategy intake</span>' +
        '<h1 id="screenTitle">You should not have to be a finance expert <em>to complete this.</em></h1>' +
        '<p class="welcome-lead">Every question includes a plain-English explanation, where to find the information, and what to enter. Estimates are acceptable when exact numbers are not available.</p>' +
        '<div class="welcome-actions"><button class="btn btn-blue" type="button" data-action="start">Begin the intake <span aria-hidden="true">&rarr;</span></button></div>' +
        '<p class="welcome-micro">Estimated time: about 8-12 minutes after a completed application, or 15-20 minutes for the full form. This is a discussion mockup. Nothing is submitted or stored.</p>' +
      '</div>' +
      '<div class="welcome-side">' +
        '<div class="welcome-card"><span class="welcome-num">01</span><div><strong>We explain the terms.</strong><p>No mortgage knowledge is assumed.</p></div></div>' +
        '<div class="welcome-card"><span class="welcome-num">02</span><div><strong>We show you where to look.</strong><p>Statements, contracts, pay stubs, or your best estimate.</p></div></div>' +
        '<div class="welcome-card"><span class="welcome-num">03</span><div><strong>We skip duplicates.</strong><p>A completed application and credit report remove repeated questions.</p></div></div>' +
      '</div>' +
    '</div>';
  }

  function renderOptions(step) {
    var selected = state[step.field] || '';
    return '<div class="options' + (step.twoColumn ? ' two-col' : '') + '">' +
      step.options.map(function (item, index) {
        var isSelected = selected === item.value;
        return '<button class="option' + (isSelected ? ' selected' : '') + '" type="button" data-field="' + escapeHtml(step.field) + '" data-value="' + escapeHtml(item.value) + '" aria-pressed="' + (isSelected ? 'true' : 'false') + '">' +
          '<span class="option-key" aria-hidden="true">' + String.fromCharCode(65 + index) + '</span>' +
          '<span class="option-copy"><span class="option-title">' + escapeHtml(item.title) + '</span>' +
          (item.description ? '<span class="option-desc">' + escapeHtml(item.description) + '</span>' : '') +
          '</span>' +
        '</button>';
      }).join('') +
    '</div>';
  }

  function renderChoice(step, number) {
    var main = questionHeader(step, number) + renderOptions(step) +
      '<p class="selection-note">Select one answer. The form will continue automatically.</p>';
    return renderLayout(step, main);
  }

  function renderNotice(step, number) {
    var bullets = resolve(step.bullets) || [];
    var main = questionHeader(step, number) +
      '<div class="notice-card"><ul class="notice-list">' + bullets.map(function (item) {
        return '<li>' + escapeHtml(item) + '</li>';
      }).join('') + '</ul></div>' +
      '<div class="action-row"><button class="btn btn-navy" type="button" data-action="continue">Continue <span aria-hidden="true">&rarr;</span></button></div>';
    return renderLayout(step, main);
  }

  function inputMarkup(item) {
    var value = state[item.name] == null ? '' : state[item.name];
    var cls = 'field' + (item.full ? ' full' : '');
    var requiredLabel = item.required ? '<span class="required-label">Required</span>' : '<span class="optional-label">Optional</span>';
    var input = '';
    var describedBy = item.name + '-hint';

    if (item.type === 'select') {
      input = '<select id="' + item.name + '" name="' + item.name + '" aria-describedby="' + describedBy + '">' +
        (item.choices || []).map(function (choice) {
          return '<option value="' + escapeHtml(choice) + '"' + (String(value) === String(choice) ? ' selected' : '') + '>' + escapeHtml(choice || 'Select one') + '</option>';
        }).join('') +
      '</select>';
    } else {
      var type = item.type === 'date' || item.type === 'email' ? item.type : 'text';
      var autocomplete = item.autocomplete ? ' autocomplete="' + escapeHtml(item.autocomplete) + '"' : '';
      var inputmode = item.inputmode ? ' inputmode="' + escapeHtml(item.inputmode) + '"' : '';
      var multiple = item.multiple ? ' multiple' : '';
      input = '<div class="input-wrap">' +
        (item.prefix ? '<span class="input-affix prefix">' + escapeHtml(item.prefix) + '</span>' : '') +
        '<input id="' + item.name + '" name="' + item.name + '" type="' + type + '" value="' + escapeHtml(value) + '" placeholder="' + escapeHtml(item.placeholder || '') + '" aria-describedby="' + describedBy + '"' + autocomplete + inputmode + multiple + '>' +
        (item.suffix ? '<span class="input-affix suffix">' + escapeHtml(item.suffix) + '</span>' : '') +
      '</div>';
    }

    return '<div class="' + cls + '" data-field-wrap="' + item.name + '">' +
      '<div class="field-label-row"><label for="' + item.name + '">' + escapeHtml(item.label) + '</label>' + requiredLabel + '</div>' +
      input +
      '<div class="field-meta" id="' + describedBy + '">' +
        (item.allowUnknown ? '<button class="unknown-button" type="button" data-set-unknown="' + item.name + '">I cannot find this right now</button>' : '<span></span>') +
      '</div>' +
      '<div class="field-error" id="' + item.name + '-error" aria-live="polite"></div>' +
    '</div>';
  }

  function renderFields(step, number) {
    var main = questionHeader(step, number) +
      '<form id="fieldsForm" novalidate><div class="fields">' + step.fields.map(inputMarkup).join('') + '</div>' +
      '<div class="form-error" id="formError" aria-live="polite"></div>' +
      '<div class="action-row"><button class="btn btn-navy" type="submit">Continue <span aria-hidden="true">&rarr;</span></button></div></form>';
    return renderLayout(step, main);
  }

  function renderText(step, number) {
    var main = questionHeader(step, number) +
      '<form id="textForm" novalidate><div class="field full text-field">' +
        '<div class="field-label-row"><label for="textResponse">Your response</label><span class="required-label">Required</span></div>' +
        '<textarea id="textResponse" placeholder="' + escapeHtml(step.placeholder || '') + '">' + escapeHtml(state[step.field] || '') + '</textarea>' +
        '<div class="field-error" id="textResponse-error" aria-live="polite"></div>' +
      '</div><div class="action-row"><button class="btn btn-navy" type="submit">Continue <span aria-hidden="true">&rarr;</span></button></div></form>';
    return renderLayout(step, main);
  }

  function emptyLiability() {
    return { type: '', creditor: '', rate: '', balance: '', principalInterest: '', taxInsurance: '', payoff: '' };
  }

  function liabilityCard(row, index) {
    return '<article class="liability-card" data-liability-row="' + index + '">' +
      '<div class="liability-card-head"><div><span class="liability-number">Liability ' + (index + 1) + '</span><p>Use the latest statement for this account.</p></div>' +
      (index > 0 ? '<button class="remove-liability" type="button" data-remove-liability="' + index + '">Remove</button>' : '') + '</div>' +
      '<div class="liability-fields">' +
        liabilityInput(index, 'type', 'Type**', row.type, 'Mortgage, credit card, auto loan, student loan...') +
        liabilityInput(index, 'creditor', 'Creditor', row.creditor, 'Company or lender name') +
        liabilityInput(index, 'rate', 'Rate', row.rate, '%') +
        liabilityInput(index, 'balance', 'Balance', row.balance, '$') +
        liabilityInput(index, 'principalInterest', 'Prin. & Interest', row.principalInterest, 'Monthly payment') +
        liabilityInput(index, 'taxInsurance', 'Tax & Insurance', row.taxInsurance, 'Monthly amount or 0') +
        '<div class="liability-field"><label for="liability-' + index + '-payoff">Payoff</label><select id="liability-' + index + '-payoff" data-liability-field="payoff"><option value="">Select Yes or No</option><option value="Yes"' + (row.payoff === 'Yes' ? ' selected' : '') + '>Yes</option><option value="No"' + (row.payoff === 'No' ? ' selected' : '') + '>No</option></select></div>' +
      '</div>' +
    '</article>';
  }

  function liabilityInput(index, name, label, value, placeholder) {
    return '<div class="liability-field"><label for="liability-' + index + '-' + name + '">' + escapeHtml(label) + '</label>' +
      '<input id="liability-' + index + '-' + name + '" data-liability-field="' + name + '" value="' + escapeHtml(value || '') + '" placeholder="' + escapeHtml(placeholder || '') + '"></div>';
  }

  function renderLiabilities(step, number) {
    if (!state.liabilities.length) state.liabilities.push(emptyLiability());
    var cards = state.liabilities.map(liabilityCard).join('');
    var main = questionHeader(step, number) +
      '<div class="no-liabilities-row"><label><input type="checkbox" id="noLiabilities"' + (state.noLiabilities ? ' checked' : '') + '> I have no current liabilities</label></div>' +
      '<div id="liabilityCards"' + (state.noLiabilities ? ' hidden' : '') + '>' + cards + '</div>' +
      '<div class="liability-actions"' + (state.noLiabilities ? ' hidden' : '') + '><button class="add-row" type="button" data-action="add-liability">+ Add another liability</button></div>' +
      '<div class="form-error" id="liabilityError" aria-live="polite"></div>' +
      '<div class="action-row"><button class="btn btn-navy" type="button" data-action="continue-liabilities">Continue <span aria-hidden="true">&rarr;</span></button></div>';
    return renderLayout(step, main);
  }

  function renderRisk(step, number) {
    var products = ['1 month ARM', '6 month ARM', '12 month ARM', '3 Year ARM', '5 Year ARM', '7 Year ARM', '40 Year FIXED', '30 Year FIXED', '20 Year FIXED', '15 Year FIXED'];
    var main = questionHeader(step, number) +
      '<div class="risk-explainer">' +
        '<div class="risk-axis-labels"><span>Less safety / lower starting payment</span><span>More safety / higher starting payment</span></div>' +
        '<div class="risk-line"><span class="risk-marker a">A</span><span class="risk-marker b">B</span><span class="risk-marker c">C</span></div>' +
        '<div class="risk-products">' + products.map(function (product) { return '<span>' + escapeHtml(product) + '</span>'; }).join('') + '</div>' +
      '</div>' +
      renderOptions(step) +
      '<p class="selection-note">Select A, B, or C. This records a preference only.</p>';
    return renderLayout(step, main);
  }

  function normalizeValue(item, value) {
    value = String(value == null ? '' : value).trim();
    if (!value) return '';
    if (/^not sure$/i.test(value)) return 'Not sure';
    if (item && item.prefix) return item.prefix + value;
    if (item && item.suffix) return value + ' ' + item.suffix;
    return value;
  }

  function choiceLabel(step, value) {
    var found = (step.options || []).find(function (item) { return item.value === value; });
    return found ? found.title : value;
  }

  function answerRowsForStep(step) {
    var rows = [];
    if (step.type === 'choice' || step.type === 'risk') {
      rows.push({ label: resolve(step.title), value: state[step.field] ? choiceLabel(step, state[step.field]) : 'Not provided' });
    } else if (step.type === 'text') {
      rows.push({ label: resolve(step.title), value: state[step.field] || 'Not provided' });
    } else if (step.type === 'fields') {
      step.fields.forEach(function (item) {
        rows.push({ label: item.label, value: normalizeValue(item, state[item.name]) || 'Not provided' });
      });
    } else if (step.type === 'liabilities') {
      if (state.noLiabilities) {
        rows.push({ label: 'Current liabilities', value: 'No current liabilities' });
      } else {
        state.liabilities.forEach(function (row, index) {
          var parts = [];
          if (row.type) parts.push(row.type);
          if (row.creditor) parts.push(row.creditor);
          if (row.rate) parts.push(row.rate + '%');
          if (row.balance) parts.push('$' + row.balance + ' balance');
          if (row.principalInterest) parts.push('$' + row.principalInterest + ' P&I');
          if (row.taxInsurance) parts.push('$' + row.taxInsurance + ' tax & insurance');
          if (row.payoff) parts.push('Payoff: ' + row.payoff);
          rows.push({ label: 'Liability ' + (index + 1), value: parts.length ? parts.join(' | ') : 'Not provided' });
        });
      }
    }
    return rows;
  }

  function renderReview(step) {
    var groups = {};
    if (state.applicationStatus === 'complete') {
      groups['From completed application / credit file'] = [
        { label: 'Borrower information', value: 'Name, date of birth, address, email, city, state, ZIP code, and county are taken from the completed application.' },
        { label: 'Property and income', value: 'Property type, residence type, gross income, rental income, and liquid assets are taken from the completed application.' },
        { label: 'Debts and mortgages', value: 'Current liabilities and first- and second-mortgage details are taken from the application and credit file.' },
        { label: state.transactionType === 'purchase' ? 'Purchase facts' : 'Refinance facts', value: state.transactionType === 'purchase' ? 'Purchase price and the expected sale price of any home being sold are taken from the completed application.' : 'Current value and cash-out amount are taken from the completed application. The purpose is confirmed in this intake.' }
      ];
    }
    activeSteps().forEach(function (activeStep) {
      if (activeStep.type === 'notice' || activeStep.type === 'review') return;
      var section = activeStep.section || 'Other';
      if (!groups[section]) groups[section] = [];
      groups[section] = groups[section].concat(answerRowsForStep(activeStep));
    });

    var groupHtml = Object.keys(groups).map(function (section) {
      return '<section class="review-section"><div class="review-section-head"><span>' + escapeHtml(section) + '</span></div><div class="review-grid">' +
        groups[section].map(function (item) {
          return '<div class="review-item"><div class="review-label">' + escapeHtml(item.label) + '</div><div class="review-value">' + escapeHtml(item.value) + '</div></div>';
        }).join('') +
      '</div></section>';
    }).join('');

    var main = questionHeader(step, stepNumber(step)) +
      '<p class="review-intro">Review the answers below. Use Back to make changes. The production version will send this summary to the approved secure destination.</p>' +
      groupHtml +
      '<div class="demo-banner"><strong>Mockup only:</strong> Nothing is sent to Netlify Forms, email, a CRM, or a loan system.</div>' +
      '<div class="action-row"><button class="btn btn-blue" type="button" data-action="complete">Complete mockup <span aria-hidden="true">&rarr;</span></button></div>';
    return '<div class="review-wide">' + main + '</div>';
  }

  function renderComplete() {
    return '<div class="complete-screen">' +
      '<div class="complete-icon" aria-hidden="true">&#10003;</div>' +
      '<span class="eyebrow">Mockup complete</span>' +
      '<h2 id="screenTitle">The Scenario Desk is ready for review.</h2>' +
      '<p class="lead">No information was submitted or stored. In production, this step will confirm secure delivery and identify what happens next.</p>' +
      '<div class="action-row"><button class="btn btn-navy" type="button" data-action="restart">Start over</button></div>' +
    '</div>';
  }

  function updateChrome(step) {
    progressBar.style.width = progressPercent() + '%';
    if (current === 'welcome' || current === 'complete') {
      stepMeta.hidden = true;
    } else {
      stepMeta.hidden = false;
      stepKicker.textContent = step.section || 'Scenario Desk';
      stepCount.textContent = stepNumber(step) + ' of ' + activeSteps().length;
    }
    backButton.hidden = !history.length || current === 'complete';
    keyboardHint.hidden = !step || (step.type !== 'choice' && step.type !== 'risk');
  }

  function scrollToForm() {
    if (!formFrame) return;
    var offset = window.innerWidth <= 680 ? 82 : 92;
    var top = formFrame.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
  }

  function render() {
    var step = current === 'welcome' || current === 'complete' ? { type: current } : getStep(current);
    updateChrome(step);
    screen.className = 'screen';

    if (current === 'welcome') screen.innerHTML = renderWelcome();
    else if (current === 'complete') screen.innerHTML = renderComplete();
    else if (step.type === 'choice') screen.innerHTML = renderChoice(step, stepNumber(step));
    else if (step.type === 'notice') screen.innerHTML = renderNotice(step, stepNumber(step));
    else if (step.type === 'fields') screen.innerHTML = renderFields(step, stepNumber(step));
    else if (step.type === 'text') screen.innerHTML = renderText(step, stepNumber(step));
    else if (step.type === 'liabilities') screen.innerHTML = renderLiabilities(step, stepNumber(step));
    else if (step.type === 'risk') screen.innerHTML = renderRisk(step, stepNumber(step));
    else if (step.type === 'review') screen.innerHTML = renderReview(step);

    bindEvents(step);
    window.requestAnimationFrame(function () {
      var title = screen.querySelector('h1, h2');
      if (title) {
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
      }
    });
    if (current !== 'welcome') scrollToForm();
  }

  function setFieldError(name, message) {
    var wrap = document.querySelector('[data-field-wrap="' + name + '"]');
    var error = document.getElementById(name + '-error');
    if (wrap) wrap.classList.toggle('has-error', Boolean(message));
    if (error) error.textContent = message || '';
  }

  function validateFields(step, form) {
    var firstInvalid = null;
    var missing = 0;
    step.fields.forEach(function (item) {
      var input = form.elements[item.name];
      var value = input ? String(input.value || '').trim() : '';
      state[item.name] = value;
      var message = '';
      var conditionallyRequired = step.id === 'second_mortgage' && item.name === 'secondTermYears' && state.secondTermType === 'Fixed term';
      if ((item.required || conditionallyRequired) && !value) message = 'Please complete this field or use the cannot-find option.';
      if (!message && item.type === 'email' && value) {
        var addresses = value.split(',').map(function (part) { return part.trim(); }).filter(Boolean);
        var valid = addresses.length && addresses.every(function (address) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address); });
        if (!valid) message = 'Enter a valid email address. Separate two addresses with a comma.';
      }
      setFieldError(item.name, message);
      if (message) {
        missing += 1;
        if (!firstInvalid) firstInvalid = input;
      }
    });
    var formError = document.getElementById('formError');
    if (formError) formError.textContent = missing ? 'Please complete the highlighted field' + (missing > 1 ? 's' : '') + '.' : '';
    if (firstInvalid) firstInvalid.focus();
    return !missing;
  }

  function updateLiability(input) {
    var card = input.closest('[data-liability-row]');
    if (!card) return;
    var index = Number(card.getAttribute('data-liability-row'));
    var fieldName = input.getAttribute('data-liability-field');
    if (!state.liabilities[index]) state.liabilities[index] = emptyLiability();
    state.liabilities[index][fieldName] = String(input.value || '').trim();
  }

  function liabilityHasData(row) {
    return Object.keys(row).some(function (key) { return String(row[key] || '').trim(); });
  }

  function liabilityIsComplete(row) {
    return row.type && row.creditor && row.rate && row.balance && row.principalInterest && row.taxInsurance && row.payoff;
  }

  function validateLiabilities() {
    var error = document.getElementById('liabilityError');
    if (state.noLiabilities) {
      if (error) error.textContent = '';
      return true;
    }
    var usedRows = state.liabilities.filter(liabilityHasData);
    if (!usedRows.length) {
      if (error) error.textContent = 'Add at least one liability or choose I have no current liabilities.';
      return false;
    }
    var incomplete = usedRows.some(function (row) { return !liabilityIsComplete(row); });
    if (incomplete) {
      if (error) error.textContent = 'Complete every column for each liability you added. Enter 0 when Tax & Insurance does not apply.';
      return false;
    }
    state.liabilities = usedRows;
    if (error) error.textContent = '';
    return true;
  }

  function bindEvents(step) {
    screen.querySelectorAll('[data-action]').forEach(function (element) {
      element.addEventListener('click', function () {
        var action = element.getAttribute('data-action');
        if (action === 'start' || action === 'continue') goNext();
        if (action === 'complete') {
          history.push(current);
          current = 'complete';
          render();
        }
        if (action === 'restart') restart();
        if (action === 'add-liability') {
          state.liabilities.push(emptyLiability());
          render();
        }
        if (action === 'continue-liabilities' && validateLiabilities()) goNext();
      });
    });

    screen.querySelectorAll('.option').forEach(function (button) {
      button.addEventListener('click', function () {
        state[button.getAttribute('data-field')] = button.getAttribute('data-value');
        screen.querySelectorAll('.option').forEach(function (item) {
          var selected = item === button;
          item.classList.toggle('selected', selected);
          item.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        window.setTimeout(goNext, 220);
      });
    });

    screen.querySelectorAll('[data-set-unknown]').forEach(function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-set-unknown');
        var input = document.getElementById(name);
        if (!input) return;
        input.value = 'Not sure';
        state[name] = 'Not sure';
        setFieldError(name, '');
        input.focus();
      });
    });

    var fieldsForm = document.getElementById('fieldsForm');
    if (fieldsForm) {
      fieldsForm.addEventListener('input', function (event) {
        if (event.target && event.target.name) {
          state[event.target.name] = String(event.target.value || '').trim();
          setFieldError(event.target.name, '');
        }
      });
      fieldsForm.addEventListener('change', function (event) {
        if (event.target && event.target.name) {
          state[event.target.name] = String(event.target.value || '').trim();
          setFieldError(event.target.name, '');
        }
      });
      fieldsForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (validateFields(step, fieldsForm)) goNext();
      });
    }

    var textForm = document.getElementById('textForm');
    if (textForm) {
      var textResponse = document.getElementById('textResponse');
      textResponse.addEventListener('input', function () {
        state[step.field] = String(textResponse.value || '').trim();
        document.getElementById('textResponse-error').textContent = '';
      });
      textForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = String(textResponse.value || '').trim();
        if (!value) {
          document.getElementById('textResponse-error').textContent = 'Please enter a response.';
          textResponse.focus();
          return;
        }
        state[step.field] = value;
        goNext();
      });
    }

    var noLiabilities = document.getElementById('noLiabilities');
    if (noLiabilities) {
      noLiabilities.addEventListener('change', function () {
        state.noLiabilities = noLiabilities.checked;
        document.getElementById('liabilityCards').hidden = state.noLiabilities;
        var actions = screen.querySelector('.liability-actions');
        if (actions) actions.hidden = state.noLiabilities;
        var error = document.getElementById('liabilityError');
        if (error) error.textContent = '';
      });
    }

    screen.querySelectorAll('[data-liability-field]').forEach(function (input) {
      input.addEventListener('input', function () { updateLiability(input); });
      input.addEventListener('change', function () { updateLiability(input); });
    });

    screen.querySelectorAll('[data-remove-liability]').forEach(function (button) {
      button.addEventListener('click', function () {
        var index = Number(button.getAttribute('data-remove-liability'));
        state.liabilities.splice(index, 1);
        render();
      });
    });
  }

  backButton.addEventListener('click', goBack);

  document.addEventListener('keydown', function (event) {
    if (event.target && event.target.matches('input, textarea, select, button')) return;
    if (current === 'welcome' && event.key === 'Enter') {
      var start = screen.querySelector('[data-action="start"]');
      if (start) start.click();
      return;
    }
    var step = getStep(current);
    if (!step || (step.type !== 'choice' && step.type !== 'risk')) return;
    var key = String(event.key || '').toUpperCase();
    if (!/^[A-Z]$/.test(key)) return;
    var buttons = screen.querySelectorAll('.option');
    var index = key.charCodeAt(0) - 65;
    if (buttons[index]) buttons[index].click();
  });

  if (nav && navToggle && navLinks) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    });
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  render();
})();
