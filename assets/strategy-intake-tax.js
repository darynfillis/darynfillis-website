(function () {
  'use strict';

  var config = window.SCENARIO_DESK_CONFIG;
  if (!config || !Array.isArray(config.steps)) return;

  var HELP_TEXT = 'Not sure, I need Daryn\'s help with this';

  function option(value, title, description) {
    return { value: value, title: title, description: description || '' };
  }

  function field(name, label, settings) {
    settings = settings || {};
    settings.name = name;
    settings.label = label;
    return settings;
  }

  function replaceStep(id, replacement) {
    var index = config.steps.findIndex(function (step) { return step.id === id; });
    if (index !== -1) config.steps[index] = replacement;
  }

  /* Keep the home-sale routing question with the existing-real-estate section. */
  var saleGateIndex = config.steps.findIndex(function (step) { return step.id === 'selling_home_gate'; });
  var purchasePropertyIndex = config.steps.findIndex(function (step) { return step.id === 'purchase_subject_property'; });
  if (saleGateIndex !== -1 && purchasePropertyIndex !== -1) {
    var saleGate = config.steps.splice(saleGateIndex, 1)[0];
    purchasePropertyIndex = config.steps.findIndex(function (step) { return step.id === 'purchase_subject_property'; });
    config.steps.splice(purchasePropertyIndex + 1, 0, saleGate);
  }

  function filingStatusField() {
    return {
      name: 'filingStatus',
      label: 'Expected federal tax filing status:*',
      required: true,
      type: 'select',
      choices: [
        '',
        'Single',
        'Married filing jointly',
        'Head of household',
        'Married filing separately',
        'Qualifying surviving spouse',
        'Not sure'
      ]
    };
  }

  function combinedBracketField() {
    return {
      name: 'taxBracket',
      label: 'Combined tax bracket: %',
      required: false,
      suffix: '%',
      inputmode: 'decimal',
      full: true,
      placeholder: 'Enter only if known',
      allowUnknown: true
    };
  }

  /* Capture tax information without calculating or inferring a bracket. */
  replaceStep('tax_and_income', {
    id: 'tax_and_income',
    section: 'Income',
    type: 'fields',
    source: 'Scenario Desk - Page 1 - Combined tax bracket and Most recent gross income',
    title: 'Filing status, gross income, and combined tax bracket',
    plain: 'This intake is collecting the information only. It does not calculate, infer, or conclude your tax bracket.',
    when: function (state) { return state.applicationStatus !== 'complete'; },
    help: {
      meaning: 'Gross income is income before taxes and deductions. Filing status and combined tax bracket are separate pieces of information. The bracket field is optional when you do not already know it.',
      where: 'Use your most recent federal tax return for filing status. Use a W-2, annualized pay stub, tax return, pension or Social Security statement, or current profit-and-loss statement for annual gross income. Use a tax return or tax professional for the combined bracket if it is already known.',
      enter: 'Choose the filing status you expect to use, enter annual gross income before deductions, and enter the combined tax bracket only if you already know it. Otherwise choose the Daryn-help option.',
      note: 'No tax calculation or tax conclusion is made in this intake. This is not tax advice.'
    },
    fields: [
      filingStatusField(),
      {
        name: 'grossIncome',
        label: 'Most recent gross income:* (annual amount)',
        required: true,
        prefix: '$',
        inputmode: 'decimal',
        placeholder: 'For example: 120,000',
        allowUnknown: true
      },
      combinedBracketField()
    ]
  });

  replaceStep('tax_bracket_only', {
    id: 'tax_bracket_only',
    section: 'Income',
    type: 'fields',
    source: 'Scenario Desk - Page 1 - Combined tax bracket',
    title: 'Filing status and combined tax bracket',
    plain: 'Your gross income is already expected to be in the completed application. This step records filing status and the combined bracket only when it is known.',
    when: function (state) { return state.applicationStatus === 'complete'; },
    help: {
      meaning: 'Filing status is how you expect to file the tax return. The combined tax bracket is a separate self-reported planning input, not a number this intake will estimate.',
      where: 'Use your most recent federal tax return for filing status. Use a tax return or tax professional for the combined bracket if it is already known.',
      enter: 'Choose a filing status. Enter the combined bracket only if you already know it; otherwise choose the Daryn-help option.',
      note: 'No tax calculation or conclusion is made here. The advisor can review the captured information later with the appropriate tax context.'
    },
    fields: [
      filingStatusField(),
      combinedBracketField()
    ]
  });

  /* Capture an exact liquid-asset total instead of the source form's broad ranges. */
  replaceStep('liquid_assets', {
    id: 'liquid_assets',
    section: 'Assets',
    type: 'fields',
    source: 'Scenario Desk - Page 2 - Information (Cont.) - liquid assets; adapted to capture an exact total',
    title: 'What is the combined value of all your liquid assets from bank accounts, mutual funds, CDs and securities?',
    plain: 'Enter the exact current total when possible rather than selecting a broad range.',
    when: function (state) { return state.applicationStatus !== 'complete'; },
    help: {
      meaning: 'Liquid assets are funds that can generally be converted to cash without selling real estate. Include checking, savings, money-market accounts, certificates of deposit, mutual funds, brokerage accounts, and other marketable securities. Do not include real estate value.',
      where: 'Use the most recent statement for each bank, brokerage, mutual-fund, and CD account. Add the current balances together. When two borrowers are applying together, include the accounts that should be counted for the household.',
      enter: 'Enter one combined dollar amount. Use the exact total shown by the statements when possible. If you cannot determine it, choose “' + HELP_TEXT + '.”',
      note: 'This intake records the total supplied. It does not analyze liquidity, recommend how much to use, or make an approval conclusion.'
    },
    fields: [
      field('liquidAssets', 'Total liquid assets:*', {
        required: true,
        prefix: '$',
        inputmode: 'decimal',
        full: true,
        placeholder: 'Exact combined current balance',
        allowUnknown: true
      })
    ]
  });

  /* Purchases do not use the source-form roll-closing-costs question. */
  var closingStep = config.steps.find(function (step) { return step.id === 'closing_costs'; });
  if (closingStep) {
    closingStep.when = function (state) { return state.transactionType === 'refinance'; };
    closingStep.plain = 'This question applies only to a refinance. It is skipped for a home purchase.';
    closingStep.help = {
      meaning: 'On a refinance, eligible closing costs may sometimes be included in the new loan balance instead of being paid separately at closing.',
      where: 'No document is required. This records your current preference only.',
      enter: 'Choose Yes, No, or “' + HELP_TEXT + '.”',
      note: 'The answer is captured for discussion. It does not determine the final loan structure or whether costs can be financed.'
    };
  }

  /* Make the same Daryn-help response available wherever uncertainty is reasonable. */
  var routingFields = {
    transactionType: true,
    hasSecondBorrower: true,
    sellingHome: true,
    existingPropertyCount: true
  };

  function isUnknownOption(item) {
    var text = String((item && item.title) || '') + ' ' + String((item && item.value) || '');
    return /not sure|unsure/i.test(text);
  }

  config.steps.forEach(function (step) {
    if (Array.isArray(step.fields)) {
      step.fields.forEach(function (item) {
        if (!Array.isArray(item.choices)) return;
        item.choices = item.choices.map(function (choice) {
          return /^not sure$/i.test(String(choice).trim()) ? HELP_TEXT : choice;
        });
      });
    }

    if ((step.type !== 'choice' && step.type !== 'risk') || !Array.isArray(step.options)) return;

    var hasUnknown = false;
    step.options = step.options.map(function (item) {
      if (!isUnknownOption(item)) return item;
      hasUnknown = true;
      return option(
        step.field === 'applicationStatus' ? item.value : HELP_TEXT,
        HELP_TEXT,
        item.description || 'Record that you would like Daryn to help you answer this.'
      );
    });

    if (!hasUnknown && !routingFields[step.field]) {
      step.options.push(option(
        HELP_TEXT,
        HELP_TEXT,
        'Choose this instead of guessing. Daryn can review the question with you.'
      ));
    }
  });

  function clearFieldError(name) {
    var wrap = document.querySelector('[data-field-wrap="' + name + '"]');
    var error = document.getElementById(name + '-error');
    if (wrap) wrap.classList.remove('has-error');
    if (error) error.textContent = '';
  }

  function ensureTextHelpButton(root) {
    if (!root || !root.querySelector) return;
    var textField = root.querySelector('#textForm .text-field');
    if (!textField || textField.querySelector('[data-set-text-unknown]')) return;

    var meta = document.createElement('div');
    meta.className = 'field-meta';
    meta.innerHTML = '<button class="unknown-button" type="button" data-set-text-unknown>' + HELP_TEXT + '</button>';

    var error = textField.querySelector('.field-error');
    if (error) textField.insertBefore(meta, error);
    else textField.appendChild(meta);
  }

  /* The general liability section now follows property-secured debt capture. */
  function adjustRenderedCopy() {
    var screen = document.getElementById('screen');
    if (!screen) return;

    screen.querySelectorAll('[data-set-unknown]').forEach(function (button) {
      button.textContent = HELP_TEXT;
      button.setAttribute('aria-label', HELP_TEXT);
    });
    ensureTextHelpButton(screen);

    var noLiabilities = document.getElementById('noLiabilities');
    if (noLiabilities && noLiabilities.parentElement) {
      var label = noLiabilities.parentElement;
      Array.prototype.forEach.call(label.childNodes, function (node) {
        if (node.nodeType === 3 && node.nodeValue.indexOf('I have no current liabilities') !== -1) {
          node.nodeValue = node.nodeValue.replace('I have no current liabilities', 'I have no other current liabilities');
        }
      });
    }

    var typeInputs = screen.querySelectorAll('[data-liability-field="type"]');
    Array.prototype.forEach.call(typeInputs, function (input) {
      if (input.placeholder.indexOf('Mortgage') !== -1) {
        input.placeholder = 'Auto loan, credit card, student loan, personal loan...';
      }
    });

    var error = document.getElementById('liabilityError');
    if (error && error.textContent.indexOf('no current liabilities') !== -1) {
      error.textContent = error.textContent.replace('no current liabilities', 'no other current liabilities');
    }

    var reviewValues = screen.querySelectorAll('.review-value');
    Array.prototype.forEach.call(reviewValues, function (value) {
      if (value.textContent === 'No current liabilities') value.textContent = 'No other current liabilities';
    });
  }

  /* Run before the form's normal click handlers so the full help response is stored. */
  document.addEventListener('click', function (event) {
    var fieldButton = event.target.closest && event.target.closest('[data-set-unknown]');
    if (fieldButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var name = fieldButton.getAttribute('data-set-unknown');
      var input = document.getElementById(name);
      if (!input) return;
      input.value = HELP_TEXT;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      clearFieldError(name);
      input.focus();
      return;
    }

    var textButton = event.target.closest && event.target.closest('[data-set-text-unknown]');
    if (textButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var textarea = document.getElementById('textResponse');
      if (!textarea) return;
      textarea.value = HELP_TEXT;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      var textError = document.getElementById('textResponse-error');
      if (textError) textError.textContent = '';
      textarea.focus();
    }
  }, true);

  var screenNode = document.getElementById('screen');
  if (screenNode && window.MutationObserver) {
    new MutationObserver(adjustRenderedCopy).observe(screenNode, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', adjustRenderedCopy);
  } else {
    adjustRenderedCopy();
  }
})();
