(function () {
  'use strict';

  var config = window.SCENARIO_DESK_CONFIG;
  if (!config || !Array.isArray(config.steps)) return;

  var IRS_SOURCE = 'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill';

  var tax2026 = {
    single: {
      label: 'Single',
      deduction: 16100,
      thresholds: [12400, 50400, 105700, 201775, 256225, 640600]
    },
    joint: {
      label: 'Married filing jointly or qualifying surviving spouse',
      deduction: 32200,
      thresholds: [24800, 100800, 211400, 403550, 512450, 768700]
    },
    head: {
      label: 'Head of household',
      deduction: 24150,
      thresholds: [17700, 67450, 105700, 201750, 256200, 640600]
    },
    separate: {
      label: 'Married filing separately',
      deduction: 16100,
      thresholds: [12400, 50400, 105700, 201775, 256225, 384350]
    }
  };

  var rates = [10, 12, 22, 24, 32, 35, 37];

  function parseIncome(value) {
    if (!value || /^not sure$/i.test(String(value).trim())) return null;
    var cleaned = String(value).replace(/[^0-9.]/g, '');
    if (!cleaned) return null;
    var amount = Number(cleaned);
    return Number.isFinite(amount) && amount >= 0 ? amount : null;
  }

  function calculate(status, grossIncome) {
    var table = tax2026[status];
    var gross = parseIncome(grossIncome);
    if (!table || gross === null) return null;

    var taxable = Math.max(0, gross - table.deduction);
    var rate = 0;

    if (taxable > 0) {
      rate = rates[rates.length - 1];
      for (var i = 0; i < table.thresholds.length; i += 1) {
        if (taxable <= table.thresholds[i]) {
          rate = rates[i];
          break;
        }
      }
    }

    return {
      status: status,
      statusLabel: table.label,
      grossIncome: gross,
      standardDeduction: table.deduction,
      estimatedTaxableIncome: taxable,
      marginalRate: rate
    };
  }

  window.SCENARIO_TAX_2026 = {
    source: IRS_SOURCE,
    tables: tax2026,
    calculate: calculate
  };

  function filingStatusField() {
    return {
      name: 'filingStatus',
      label: 'Expected 2026 federal tax filing status:*',
      required: true,
      type: 'select',
      choices: [
        '',
        'Single',
        'Married filing jointly or qualifying surviving spouse',
        'Head of household',
        'Married filing separately'
      ]
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
    source: 'Scenario Desk - Page 1 - Combined tax bracket and Most recent gross income; 2026 federal brackets from IRS Rev. Proc. 2025-32',
    title: 'Filing status, gross income, and estimated tax bracket',
    plain: 'The original form asks for a combined tax bracket. This online version estimates the 2026 federal marginal bracket from annual gross income and filing status instead of asking you to know the bracket yourself.',
    when: function (state) { return state.applicationStatus !== 'complete'; },
    calculator: 'federalTax2026',
    help: {
      meaning: 'A marginal tax bracket is the federal rate applied to the next dollar of taxable income. It is not the percentage paid on all income. The estimate subtracts the 2026 standard deduction from gross income before applying the IRS tax-rate schedule.',
      where: 'Use the filing status from your most recent federal tax return. Use annual gross income from a W-2, year-to-date pay stub annualized for the year, tax return, pension or Social Security statement, or current profit-and-loss statement. If filing jointly, combine the income reported on the joint return.',
      enter: 'Choose the filing status expected for 2026 and enter annual gross income before taxes and other deductions. The federal bracket is calculated automatically.',
      note: 'This is a planning estimate, not tax advice. It does not include state income tax and may differ from the actual bracket because taxable income can be affected by itemized deductions, business deductions, capital gains, retirement contributions, credits, and other tax rules.'
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
      {
        name: 'taxBracket',
        label: 'Estimated 2026 federal marginal tax bracket:',
        required: false,
        readonly: true,
        calculated: true,
        full: true,
        placeholder: 'Calculated automatically'
      }
    ]
  });

  replaceStep('tax_bracket_only', {
    id: 'tax_bracket_only',
    section: 'Income',
    type: 'fields',
    source: 'Scenario Desk - Page 1 - Combined tax bracket; 2026 federal brackets from IRS Rev. Proc. 2025-32',
    title: 'Filing status for the tax-bracket estimate',
    plain: 'Because your application is complete, the production form will use the gross income already reported in your loan file. We only need the filing status to select the correct 2026 federal schedule.',
    when: function (state) { return state.applicationStatus === 'complete'; },
    calculator: 'federalTax2026FromApplication',
    help: {
      meaning: 'The IRS uses different income thresholds for Single, Married Filing Jointly, Head of Household, and Married Filing Separately. Filing status is needed even when income is already in the application.',
      where: 'Use the filing status from your most recent federal tax return or the status you reasonably expect to use for tax year 2026.',
      enter: 'Choose one filing status. The production version will calculate the federal marginal bracket using the gross income in the completed application.',
      note: 'The Netlify mockup is not connected to the loan file, so it cannot display the final percentage on this route. State income tax is not included.'
    },
    fields: [
      filingStatusField(),
      {
        name: 'taxBracket',
        label: 'Estimated 2026 federal marginal tax bracket:',
        required: false,
        readonly: true,
        calculated: true,
        full: true,
        placeholder: 'Calculated from application income in production'
      }
    ]
  });

  var statusValueMap = {
    'Single': 'single',
    'Married filing jointly or qualifying surviving spouse': 'joint',
    'Head of household': 'head',
    'Married filing separately': 'separate'
  };

  function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function setCalculatedValue(input, value) {
    if (!input) return;
    if (input.value === value) return;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function setPanelHtml(panel, html) {
    if (!panel || panel.innerHTML === html) return;
    panel.innerHTML = html;
  }

  function panelMarkup(result, statusKey, waitingForApplication) {
    var table = tax2026[statusKey];

    if (waitingForApplication) {
      if (!table) {
        return '<div class="tax-estimate-eyebrow">2026 federal estimate</div>' +
          '<div class="tax-estimate-rate">Choose a filing status</div>' +
          '<div class="tax-estimate-detail">The production version will combine the selected filing status with gross income from the completed mortgage application.</div>';
      }
      return '<div class="tax-estimate-eyebrow">2026 federal estimate</div>' +
        '<div class="tax-estimate-rate">Calculated from your loan file in production</div>' +
        '<div class="tax-estimate-detail">Selected filing status: ' + table.label + '. The 2026 standard deduction for this status is ' + formatMoney(table.deduction) + '.</div>' +
        '<div class="tax-estimate-caution">This mockup is not connected to application income. Federal estimate only; state income tax is not included. <a href="' + IRS_SOURCE + '" target="_blank" rel="noopener">View the 2026 IRS adjustments</a>.</div>';
    }

    if (!result) {
      return '<div class="tax-estimate-eyebrow">2026 federal estimate</div>' +
        '<div class="tax-estimate-rate">Choose a filing status and enter annual gross income</div>' +
        '<div class="tax-estimate-detail">The estimate will use the 2026 standard deduction and federal marginal-rate schedule.</div>';
    }

    var taxableExplanation = result.estimatedTaxableIncome > 0
      ? 'Estimated taxable income used: ' + formatMoney(result.estimatedTaxableIncome) + '.'
      : 'The standard deduction reduces the estimated taxable income to $0.';

    return '<div class="tax-estimate-eyebrow">2026 federal estimate</div>' +
      '<div class="tax-estimate-rate">Estimated marginal bracket: ' + result.marginalRate + '%</div>' +
      '<div class="tax-estimate-detail">Using ' + formatMoney(result.grossIncome) + ' of annual gross income and the ' + formatMoney(result.standardDeduction) + ' standard deduction for ' + result.statusLabel + '. ' + taxableExplanation + '</div>' +
      '<div class="tax-estimate-caution">The source form says “combined tax bracket.” This calculation estimates only the federal component. It does not include California or another state’s income tax and may differ from the actual return. <a href="' + IRS_SOURCE + '" target="_blank" rel="noopener">View the 2026 IRS adjustments</a>.</div>';
  }

  function enhanceTaxStep() {
    var filing = document.getElementById('filingStatus');
    var bracket = document.getElementById('taxBracket');
    if (!filing || !bracket) return;

    bracket.readOnly = true;
    bracket.setAttribute('aria-live', 'polite');
    var bracketWrap = bracket.closest('[data-field-wrap]');
    if (bracketWrap) {
      bracketWrap.classList.add('calculated-field');
      var badge = bracketWrap.querySelector('.optional-label, .required-label');
      if (badge) {
        badge.textContent = 'Calculated';
        badge.className = 'optional-label';
      }
      var unknown = bracketWrap.querySelector('[data-set-unknown]');
      if (unknown) unknown.remove();
    }

    var fields = bracket.closest('.fields');
    if (!fields) return;

    var panel = document.getElementById('taxEstimatePanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'taxEstimatePanel';
      panel.className = 'tax-estimate-panel';
      fields.appendChild(panel);
    }

    var gross = document.getElementById('grossIncome');

    function recalculate() {
      var statusKey = statusValueMap[filing.value] || '';

      if (!gross) {
        var pendingValue = statusKey ? 'Pending application income' : '';
        setCalculatedValue(bracket, pendingValue);
        setPanelHtml(panel, panelMarkup(null, statusKey, true));
        return;
      }

      var result = calculate(statusKey, gross.value);
      setCalculatedValue(bracket, result ? result.marginalRate + '% federal estimate' : '');
      setPanelHtml(panel, panelMarkup(result, statusKey, false));
    }

    if (filing.dataset.taxBound !== '1') {
      filing.dataset.taxBound = '1';
      filing.addEventListener('change', recalculate);
      filing.addEventListener('input', recalculate);
    }

    if (gross && gross.dataset.taxBound !== '1') {
      gross.dataset.taxBound = '1';
      gross.addEventListener('input', recalculate);
      gross.addEventListener('change', recalculate);
    }

    recalculate();
  }

  var screen = document.getElementById('screen');
  if (screen && window.MutationObserver) {
    new MutationObserver(enhanceTaxStep).observe(screen, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceTaxStep);
  } else {
    enhanceTaxStep();
  }
})();
