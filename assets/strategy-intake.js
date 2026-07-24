(function () {
  'use strict';

  var config = window.SCENARIO_DESK_CONFIG;
  if (!config) return;

  var state = { liabilities: [] };
  var current = 'welcome';
  var history = [];

  var screen = document.getElementById('screen');
  var backButton = document.getElementById('backButton');
  var progressBar = document.getElementById('progressBar');
  var stepMeta = document.getElementById('stepMeta');
  var stepKicker = document.getElementById('stepKicker');
  var stepCount = document.getElementById('stepCount');
  var keyboardHint = document.getElementById('keyboardHint');

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

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

  function currentIndex() {
    return activeSteps().findIndex(function (step) { return step.id === current; });
  }

  function nextId() {
    var steps = activeSteps();
    var next = steps[currentIndex() + 1];
    return next ? next.id : 'complete';
  }

  function goNext() {
    history.push(current);
    current = nextId();
    render();
  }

  function goBack() {
    if (!history.length) return;
    current = history.pop();
    render();
  }

  function restart() {
    state = { liabilities: [] };
    current = 'welcome';
    history = [];
    render();
  }

  function stepNumber(step) {
    return activeSteps().findIndex(function (item) { return item.id === step.id; }) + 1;
  }

  function questionHeader(step, number) {
    return '<div class="question-number">Question ' + number + '</div>' +
      '<h2 id="screenTitle">' + escapeHtml(titleFor(step.title)) + '</h2>' +
      (step.description ? '<p class="lead">' + escapeHtml(titleFor(step.description)) + '</p>' : '') +
      '<div class="source-badge">' + (step.kicker === 'Routing question' ? 'Added routing question' : step.type === 'notice' ? 'Routing summary' : 'From supplied Scenario Desk form') + '</div>';
  }

  function renderWelcome() {
    return '<div class="intro-grid">' +
      '<div>' +
        '<div class="question-number">Corrected source-based mockup</div>' +
        '<h1 id="screenTitle">Scenario Desk, rebuilt as an online intake.</h1>' +
        '<p class="lead">This version follows the questions and answer choices on the supplied two-page Scenario Desk form. Two routing questions control which sections appear and whether application fields are skipped.</p>' +
        '<div class="notice-card"><div class="notice-title">How the filter works</div><div class="notice-copy">When the online application and credit report are complete, standard application and credit-file information is skipped. The remaining source-form planning questions continue.</div></div>' +
        '<div class="action-row"><button class="btn btn-primary" type="button" data-action="start">Begin mockup <span aria-hidden="true">&rarr;</span></button></div>' +
        '<p class="helper">Discussion mockup only. Nothing is submitted, stored, or sent.</p>' +
      '</div>' +
      '<aside class="intro-aside" aria-label="Mockup rules">' +
        '<div class="trust-item"><span class="trust-icon">1</span><span class="trust-copy"><strong>Source based</strong><span>The questions and answer choices follow the supplied form.</span></span></div>' +
        '<div class="trust-item"><span class="trust-icon">2</span><span class="trust-copy"><strong>Conditional</strong><span>Completed application data is filtered out.</span></span></div>' +
        '<div class="trust-item"><span class="trust-icon">3</span><span class="trust-copy"><strong>Not live</strong><span>No response leaves the browser.</span></span></div>' +
      '</aside>' +
    '</div>';
  }

  function renderOptions(step) {
    var selected = state[step.field] || '';
    return '<div class="options' + (step.twoColumn ? ' two-col' : '') + '">' +
      step.options.map(function (item, index) {
        return '<button class="option' + (selected === item.value ? ' selected' : '') + '" type="button" data-field="' + escapeHtml(step.field) + '" data-value="' + escapeHtml(item.value) + '" aria-pressed="' + (selected === item.value ? 'true' : 'false') + '">' +
          '<span class="option-key" aria-hidden="true">' + String.fromCharCode(65 + index) + '</span>' +
          '<span class="option-copy"><span class="option-title">' + escapeHtml(item.title) + '</span>' +
          (item.description ? '<span class="option-desc">' + escapeHtml(item.description) + '</span>' : '') +
          '</span></button>';
      }).join('') +
    '</div>';
  }

  function renderNotice(step, number) {
    return questionHeader(step, number) +
      '<div class="notice-card"><div class="notice-title">' + escapeHtml(step.kicker || '') + '</div>' +
      '<ul class="notice-list">' + (step.bullets || []).map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="action-row"><button class="btn btn-primary" type="button" data-action="continue">Continue <span aria-hidden="true">&rarr;</span></button></div>';
  }

  function inputMarkup(item) {
    var options = item.options || {};
    var value = state[item.name] || '';
    var cls = 'field' + (options.full ? ' full' : '');
    var required = options.required ? ' required' : '';
    var note = options.prefix === '$' ? 'Dollar amount' : options.suffix === '%' ? 'Percentage' : options.suffix === 'yrs' ? 'Years' : '';
    var input;

    if (item.type === 'select') {
      input = '<select id="' + item.name + '" name="' + item.name + '"' + required + '>' +
        (options.choices || []).map(function (choice) {
          return '<option value="' + escapeHtml(choice) + '"' + (value === choice ? ' selected' : '') + '>' + escapeHtml(choice || 'Select one') + '</option>';
        }).join('') +
      '</select>';
    } else {
      var type = item.type === 'number' ? 'number' : item.type || 'text';
      var placeholder = options.prefix || options.suffix || '';
      input = '<input id="' + item.name + '" name="' + item.name + '" type="' + type + '" value="' + escapeHtml(value) + '" placeholder="' + escapeHtml(placeholder) + '"' + required + '>';
    }

    return '<div class="' + cls + '"><label for="' + item.name + '">' + escapeHtml(item.label) + '</label>' + input + (note ? '<span class="field-note">' + escapeHtml(note) + '</span>' : '') + '</div>';
  }

  function renderGroup(step, number) {
    return questionHeader(step, number) +
      '<form id="groupForm" novalidate><div class="fields">' + step.fields.map(inputMarkup).join('') + '</div>' +
      '<div class="validation" id="groupValidation"></div>' +
      '<div class="action-row"><button class="btn btn-primary" type="submit">Continue <span aria-hidden="true">&rarr;</span></button></div></form>';
  }

  function renderText(step, number) {
    return questionHeader(step, number) +
      '<div class="fields"><div class="field full"><label for="textResponse">Your response</label>' +
      '<textarea id="textResponse" placeholder="' + escapeHtml(step.placeholder || '') + '">' + escapeHtml(state[step.field] || '') + '</textarea></div></div>' +
      '<div class="action-row"><button class="btn btn-primary" type="button" data-action="continue-text">Continue <span aria-hidden="true">&rarr;</span></button></div>';
  }

  function emptyLiability() {
    return { type: '', creditor: '', rate: '', balance: '', principalInterest: '', taxInsurance: '', payoff: '' };
  }

  function liabilityRows() {
    var rows = state.liabilities && state.liabilities.length ? state.liabilities : [emptyLiability(), emptyLiability(), emptyLiability()];
    state.liabilities = rows;
    return rows.map(function (row, index) {
      return '<tr data-liability-row="' + index + '">' +
        '<td><input aria-label="Liability ' + (index + 1) + ' type" data-liability-field="type" value="' + escapeHtml(row.type) + '"></td>' +
        '<td><input aria-label="Liability ' + (index + 1) + ' creditor" data-liability-field="creditor" value="' + escapeHtml(row.creditor) + '"></td>' +
        '<td><input aria-label="Liability ' + (index + 1) + ' rate" data-liability-field="rate" value="' + escapeHtml(row.rate) + '" placeholder="%"></td>' +
        '<td><input aria-label="Liability ' + (index + 1) + ' balance" data-liability-field="balance" value="' + escapeHtml(row.balance) + '" placeholder="$"></td>' +
        '<td><input aria-label="Liability ' + (index + 1) + ' principal and interest" data-liability-field="principalInterest" value="' + escapeHtml(row.principalInterest) + '" placeholder="$"></td>' +
        '<td><input aria-label="Liability ' + (index + 1) + ' tax and insurance" data-liability-field="taxInsurance" value="' + escapeHtml(row.taxInsurance) + '" placeholder="$"></td>' +
        '<td><select aria-label="Liability ' + (index + 1) + ' payoff" data-liability-field="payoff"><option value="">Select</option><option value="Yes"' + (row.payoff === 'Yes' ? ' selected' : '') + '>Yes</option><option value="No"' + (row.payoff === 'No' ? ' selected' : '') + '>No</option></select></td>' +
      '</tr>';
    }).join('');
  }

  function renderLiabilities(step, number) {
    return questionHeader(step, number) +
      '<div class="liability-wrap"><table class="liability-table"><thead><tr>' +
        '<th>Type</th><th>Creditor</th><th>Rate</th><th>Balance</th><th>Prin. &amp; Interest</th><th>Tax &amp; Insurance</th><th>Payoff</th>' +
      '</tr></thead><tbody id="liabilityBody">' + liabilityRows() + '</tbody></table></div>' +
      '<p class="table-helper">At least one liability row is required when this section appears. Use Add another row for additional liabilities.</p>' +
      '<button class="add-row" type="button" data-action="add-liability">+ Add another row</button>' +
      '<div class="validation" id="liabilityValidation"></div>' +
      '<div class="action-row"><button class="btn btn-primary" type="button" data-action="continue-liabilities">Continue <span aria-hidden="true">&rarr;</span></button></div>';
  }

  function renderRisk(step, number) {
    return questionHeader(step, number) +
      '<div class="risk-scale" aria-label="Risk Pyramid from the source form">' +
        '<div class="risk-band"><div class="risk-letter">A</div><div class="risk-copy"><strong>A: Aggressive</strong><span>Greater volatility - Lowest payment</span></div></div>' +
        '<div class="risk-band"><div class="risk-letter">B</div><div class="risk-copy"><strong>B: Moderate</strong><span>Predictable volatility - Intermediate payment</span></div></div>' +
        '<div class="risk-band"><div class="risk-letter">C</div><div class="risk-copy"><strong>C: Conservative</strong><span>No volatility - Highest payment</span></div></div>' +
        '<div class="risk-products">Source-form spectrum: 1 month ARM, 6 month ARM, 12 month ARM, 3 Year ARM, 5 Year ARM, 7 Year ARM, 40 Year FIXED, 30 Year FIXED, 20 Year FIXED, 15 Year FIXED</div>' +
        '<div class="risk-axis"><span>More volatility / lower payment</span><span>More safety / higher payment</span></div>' +
      '</div>' +
      renderOptions(step) +
      '<div class="original-wording-note">The A, B, and C labels and the fixed-versus-adjustable spectrum are retained from the original Risk Pyramid on Page 2.</div>';
  }

  function fieldLabel(step, fieldName) {
    if (!step.fields) return titleFor(step.title) || fieldName;
    var found = step.fields.find(function (item) { return item.name === fieldName; });
    return found ? found.label : fieldName;
  }

  function displayValue(step, fieldName, value) {
    if (!value) return 'Not provided';
    if (step.options) {
      var found = step.options.find(function (item) { return item.value === value; });
      if (found) return found.title;
    }
    if (step.fields) {
      var item = step.fields.find(function (field) { return field.name === fieldName; });
      if (item && item.options) {
        if (item.options.prefix === '$') return '$' + value;
        if (item.options.suffix) return value + item.options.suffix;
      }
    }
    return value;
  }

  function liabilitySummary(row) {
    var parts = [];
    if (row.type) parts.push(row.type);
    if (row.creditor) parts.push(row.creditor);
    if (row.rate) parts.push(row.rate + '%');
    if (row.balance) parts.push('$' + row.balance + ' balance');
    if (row.principalInterest) parts.push('$' + row.principalInterest + ' P&I');
    if (row.taxInsurance) parts.push('$' + row.taxInsurance + ' tax & insurance');
    if (row.payoff) parts.push('Payoff: ' + row.payoff);
    return parts.join(' | ');
  }

  function renderReview() {
    var items = [];
    activeSteps().forEach(function (step) {
      if ((step.type === 'choice' || step.type === 'risk') && state[step.field]) {
        items.push([titleFor(step.title), displayValue(step, step.field, state[step.field])]);
      }
      if (step.type === 'text' && state[step.field]) {
        items.push([titleFor(step.title), state[step.field]]);
      }
      if (step.type === 'group') {
        step.fields.forEach(function (item) {
          if (state[item.name]) items.push([fieldLabel(step, item.name), displayValue(step, item.name, state[item.name])]);
        });
      }
      if (step.type === 'liabilities') {
        (state.liabilities || []).forEach(function (row, index) {
          var summary = liabilitySummary(row);
          if (summary) items.push(['Liability ' + (index + 1), summary]);
        });
      }
    });

    return '<div class="question-number">Final review</div>' +
      '<h2 id="screenTitle">Review the Scenario Desk response.</h2>' +
      '<p class="lead">This advisor-facing summary includes only the active branch. Nothing is being submitted.</p>' +
      '<div class="review-grid">' + items.map(function (item) {
        return '<div class="review-item"><div class="review-label">' + escapeHtml(item[0]) + '</div><div class="review-value">' + escapeHtml(item[1]) + '</div></div>';
      }).join('') + '</div>' +
      '<div class="demo-banner"><strong>Demo mode:</strong> selecting Complete mockup does not send data to Netlify, email, a CRM, or a loan system.</div>' +
      '<div class="action-row"><button class="btn btn-blue" type="button" data-action="complete">Complete mockup <span aria-hidden="true">&rarr;</span></button><button class="btn btn-ghost" type="button" data-action="back">Make a change</button></div>';
  }

  function renderComplete() {
    return '<div class="complete-icon" aria-hidden="true">&#10003;</div>' +
      '<h2 id="screenTitle">The corrected mockup is complete.</h2>' +
      '<p class="lead">This version uses the supplied Scenario Desk questions and conditionally removes application-style information when the application and credit report are complete.</p>' +
      '<div class="notice-card"><div class="notice-title">Nothing was transmitted</div><div class="notice-copy">Before deployment, the skip map should be checked against the actual online application and the approved response destination should be connected.</div></div>' +
      '<div class="action-row"><button class="btn btn-primary" type="button" data-action="restart">Start over</button></div>';
  }

  function updateChrome(step) {
    if (current === 'welcome' || current === 'complete') {
      stepMeta.hidden = true;
    } else {
      stepMeta.hidden = false;
      stepKicker.textContent = step.kicker || 'Scenario Desk';
      stepCount.textContent = stepNumber(step) + ' of ' + activeSteps().length;
    }

    var progressIndex = current === 'welcome' ? 0 : current === 'complete' ? activeSteps().length : Math.max(0, stepNumber(step));
    progressBar.style.width = Math.round((progressIndex / Math.max(1, activeSteps().length)) * 100) + '%';
    backButton.hidden = !history.length || current === 'complete';
    keyboardHint.hidden = !step || step.type !== 'choice';
  }

  function render() {
    var step = current === 'welcome' || current === 'complete' ? { type: current } : getStep(current);
    updateChrome(step);
    screen.className = 'screen';

    if (current === 'welcome') screen.innerHTML = renderWelcome();
    else if (current === 'complete') screen.innerHTML = renderComplete();
    else if (step.id === 'risk_pyramid' || step.type === 'risk') screen.innerHTML = renderRisk(step, stepNumber(step));
    else if (step.id === 'liabilities' || step.type === 'liabilities') screen.innerHTML = renderLiabilities(step, stepNumber(step));
    else if (step.type === 'choice') screen.innerHTML = questionHeader(step, stepNumber(step)) + renderOptions(step);
    else if (step.type === 'notice') screen.innerHTML = renderNotice(step, stepNumber(step));
    else if (step.type === 'group') screen.innerHTML = renderGroup(step, stepNumber(step));
    else if (step.type === 'text') screen.innerHTML = renderText(step, stepNumber(step));
    else if (step.type === 'review') screen.innerHTML = renderReview();

    bindEvents(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.requestAnimationFrame(function () {
      var title = screen.querySelector('h1,h2');
      if (title) {
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
      }
    });
  }

  function saveGroup(step, form) {
    var missing = [];
    step.fields.forEach(function (item) {
      var input = form.elements[item.name];
      var value = input ? String(input.value || '').trim() : '';
      state[item.name] = value;
      if (item.options && item.options.required && !value) missing.push(item.name);
    });

    if (missing.length) {
      var validation = document.getElementById('groupValidation');
      validation.textContent = 'Please complete the required fields marked with an asterisk.';
      validation.classList.add('show');
      if (form.elements[missing[0]]) form.elements[missing[0]].focus();
      return false;
    }
    return true;
  }

  function updateLiabilityFromInput(input) {
    var row = input.closest('[data-liability-row]');
    if (!row) return;
    var index = Number(row.getAttribute('data-liability-row'));
    var fieldName = input.getAttribute('data-liability-field');
    if (!state.liabilities[index]) state.liabilities[index] = emptyLiability();
    state.liabilities[index][fieldName] = String(input.value || '').trim();
  }

  function hasLiabilityData() {
    return (state.liabilities || []).some(function (row) {
      return Object.keys(row).some(function (key) { return String(row[key] || '').trim(); });
    });
  }

  function bindEvents(step) {
    screen.querySelectorAll('[data-action]').forEach(function (element) {
      element.addEventListener('click', function () {
        var action = element.getAttribute('data-action');
        if (action === 'start' || action === 'continue') goNext();
        if (action === 'back') goBack();
        if (action === 'complete') {
          history.push(current);
          current = 'complete';
          render();
        }
        if (action === 'restart') restart();
        if (action === 'continue-text') {
          state[step.field] = String(document.getElementById('textResponse').value || '').trim();
          goNext();
        }
        if (action === 'add-liability') {
          state.liabilities.push(emptyLiability());
          render();
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
        if (action === 'continue-liabilities') {
          if (!hasLiabilityData()) {
            var validation = document.getElementById('liabilityValidation');
            validation.textContent = 'Please enter at least one liability row.';
            validation.classList.add('show');
            var first = screen.querySelector('[data-liability-field]');
            if (first) first.focus();
            return;
          }
          goNext();
        }
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
        window.setTimeout(goNext, 150);
      });
    });

    var form = document.getElementById('groupForm');
    if (form) {
      form.addEventListener('input', function (event) {
        if (event.target && event.target.name) state[event.target.name] = String(event.target.value || '').trim();
      });
      form.addEventListener('change', function (event) {
        if (event.target && event.target.name) state[event.target.name] = String(event.target.value || '').trim();
      });
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (saveGroup(step, form)) goNext();
      });
    }

    var textResponse = document.getElementById('textResponse');
    if (textResponse) {
      textResponse.addEventListener('input', function () {
        state[step.field] = String(textResponse.value || '').trim();
      });
    }

    screen.querySelectorAll('[data-liability-field]').forEach(function (input) {
      input.addEventListener('input', function () { updateLiabilityFromInput(input); });
      input.addEventListener('change', function () { updateLiabilityFromInput(input); });
    });
  }

  backButton.addEventListener('click', goBack);

  document.addEventListener('keydown', function (event) {
    if (event.target && event.target.matches('input,textarea,select')) return;
    if (current === 'welcome' && event.key === 'Enter') {
      var start = screen.querySelector('[data-action="start"]');
      if (start) start.click();
      return;
    }

    var step = getStep(current);
    if (!step || (step.type !== 'choice' && step.type !== 'risk') && step.id !== 'risk_pyramid') return;
    var key = String(event.key || '').toUpperCase();
    if (!/^[A-Z]$/.test(key)) return;
    var index = key.charCodeAt(0) - 65;
    var buttons = screen.querySelectorAll('.option');
    if (index >= 0 && index < buttons.length) buttons[index].click();
  });

  render();
})();
