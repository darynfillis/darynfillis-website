(function () {
  'use strict';

  var config = window.SCENARIO_DESK_CONFIG;
  if (!config || !Array.isArray(config.steps)) return;

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

  function replaceStep(id, replacement) {
    var index = config.steps.findIndex(function (step) { return step.id === id; });
    if (index !== -1) config.steps[index] = replacement;
  }

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
      enter: 'Choose the filing status you expect to use, enter annual gross income before deductions, and enter the combined tax bracket only if you already know it. Otherwise choose the cannot-find option.',
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
      enter: 'Choose a filing status. Enter the combined bracket only if you already know it; otherwise use the cannot-find option.',
      note: 'No tax calculation or conclusion is made here. The advisor can review the captured information later with the appropriate tax context.'
    },
    fields: [
      filingStatusField(),
      combinedBracketField()
    ]
  });

  /* The general liability section now follows property-secured debt capture. */
  function adjustOtherLiabilityCopy() {
    var screen = document.getElementById('screen');
    if (!screen) return;

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

  var screenNode = document.getElementById('screen');
  if (screenNode && window.MutationObserver) {
    new MutationObserver(adjustOtherLiabilityCopy).observe(screenNode, { childList: true, subtree: true, characterData: true });
  }
})();
