(function () {
  'use strict';

  var config = window.SCENARIO_DESK_CONFIG;
  if (!config || !Array.isArray(config.steps)) return;

  var HELP_TEXT = 'Not sure, I need Daryn\'s help with this.';
  var ROUTING_FIELDS = {
    transactionType: true,
    hasSecondBorrower: true,
    sellingHome: true,
    existingPropertyCount: true
  };

  function option(value, title, description) {
    return { value: value, title: title, description: description || '' };
  }

  function field(name, label, settings) {
    settings = settings || {};
    settings.name = name;
    settings.label = label;
    return settings;
  }

  function isUnknownOption(item) {
    var text = String((item && item.title) || '') + ' ' + String((item && item.value) || '');
    return /not sure|unsure/i.test(text);
  }

  function standardizeUnknownChoices() {
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
          item.description || 'Choose this instead of guessing. Daryn can review the question with you.'
        );
      });

      if (!hasUnknown && !ROUTING_FIELDS[step.field]) {
        step.options.push(option(
          HELP_TEXT,
          HELP_TEXT,
          'Choose this instead of guessing. Daryn can review the question with you.'
        ));
      }
    });
  }

  function replaceStep(id, replacement) {
    var index = config.steps.findIndex(function (step) { return step.id === id; });
    if (index !== -1) config.steps[index] = replacement;
  }

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
      enter: 'Enter one combined dollar amount. Use the exact total shown by the statements when possible. If you cannot determine it, choose “Not sure, I need Daryn’s help with this.”',
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

  var closingStep = config.steps.find(function (step) { return step.id === 'closing_costs'; });
  if (closingStep) {
    closingStep.when = function (state) { return state.transactionType === 'refinance'; };
    closingStep.plain = 'This question applies only to a refinance. It is skipped for a home purchase.';
    closingStep.help = {
      meaning: 'On a refinance, eligible closing costs may sometimes be included in the new loan balance instead of being paid separately at closing.',
      where: 'No document is required. This records your current preference only.',
      enter: 'Choose Yes, No, or “Not sure, I need Daryn’s help with this.”',
      note: 'The answer is captured for discussion. It does not determine the final loan structure or whether costs can be financed.'
    };
  }

  standardizeUnknownChoices();

  function updateUnknownButtonLabels(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll('[data-set-unknown]').forEach(function (button) {
      button.textContent = HELP_TEXT;
      button.setAttribute('aria-label', HELP_TEXT);
    });
  }

  var screen = document.getElementById('screen');
  if (screen && window.MutationObserver) {
    new MutationObserver(function () {
      updateUnknownButtonLabels(screen);
    }).observe(screen, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateUnknownButtonLabels(document);
    });
  } else {
    updateUnknownButtonLabels(document);
  }
})();
