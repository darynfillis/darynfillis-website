import assert from 'node:assert/strict';
import test from 'node:test';

import { buildMoveUpMethodNumbers } from '../scripts/move-up-method-calculations.mjs';

function assertMoneyClose(actual, expected, tolerance = 1) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within $${tolerance} of ${expected}`);
}

test('Move-Up Method equity comparison uses internally consistent loan amounts and payments', () => {
  const values = buildMoveUpMethodNumbers();
  assert.equal(values.allEquityLoan, 772_000);
  assert.equal(values.twentyPercentLoan, 1_040_000);
  assert.equal(values.retainedEquity, 268_000);
  assertMoneyClose(values.allEquityPayment, 4_880);
  assertMoneyClose(values.twentyPercentPayment, 6_574);
  assertMoneyClose(values.paymentDifference, 1_694);
});

test('Move-Up Method rate illustration compares the same loan amount', () => {
  const values = buildMoveUpMethodNumbers();
  assert.equal(values.sellerExampleLoan, 732_000);
  assertMoneyClose(values.marketPayment, 4_627);
  assertMoneyClose(values.illustratedBuydownPayment, 4_156);
  assertMoneyClose(values.illustratedPaymentDifference, 471);
});
