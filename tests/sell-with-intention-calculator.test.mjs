import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateSellWithIntention,
  conventionalIpcCapPct,
} from '../scripts/sell-with-intention-calculator.mjs';

const defaults = {
  listPrice: 930000,
  commissionPct: 5,
  fees: 5000,
  downPaymentPct: 10,
  propertyTaxPct: 1.25,
  insurancePct: 0.3,
  standardMortgageInsurance: 0,
  strategyMortgageInsurance: 0,
  buyerHoa: 0,
  sellerLoanBalance: 550000,
  sellerMortgageRatePct: 3.5,
  sellerRemainingTermYears: 25,
  originalPurchasePrice: 650000,
  purchaseDate: '2019-06-15',
  taxAssessmentCapPct: 2,
  insuranceInflationPct: 6,
  sellerPropertyTaxMonthly: null,
  sellerInsuranceMonthly: null,
  sellerHoa: 150,
  monthsOnMarket: 3,
  concession: 28000,
  strategyRatePct: 6.125,
  standardRatePct: 7.25,
  priceCut: 37000,
  offerScenario: 1,
  occupancy: 'primary',
  appraisedValue: 0
};

const auditDate = new Date('2026-08-07T12:00:00-07:00');

function independentHousingPayment({
  price,
  annualRatePct,
  propertyTaxPct,
  insurancePct,
  mortgageInsuranceMonthly = 0,
  hoaMonthly,
  downPaymentPct
}) {
  const loan = price * (1 - downPaymentPct / 100);
  const monthlyRate = annualRatePct / 100 / 12;
  const months = 360;
  const principalAndInterest = monthlyRate === 0
    ? loan / months
    : loan * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
  return principalAndInterest
    + price * propertyTaxPct / 100 / 12
    + price * insurancePct / 100 / 12
    + mortgageInsuranceMonthly
    + hoaMonthly;
}

test('default seller nets subtract the current mortgage payoff', () => {
  const result = calculateSellWithIntention(defaults, auditDate);

  assert.equal(result.standardNet, 328500);
  assert.equal(result.strategyFloorNet, 327100);
  assert.equal(result.strategyVsStandard, -1400);
});

test('equivalent price matches the complete monthly housing payment', () => {
  const result = calculateSellWithIntention(defaults, auditDate);
  const equivalentPayment = independentHousingPayment({
    price: result.equivalentMarketRatePrice,
    annualRatePct: defaults.standardRatePct,
    propertyTaxPct: defaults.propertyTaxPct,
    insurancePct: defaults.insurancePct,
    hoaMonthly: defaults.buyerHoa,
    downPaymentPct: defaults.downPaymentPct
  });

  assert.ok(Math.abs(equivalentPayment - result.strategyPayment) < 0.01);
  assert.ok(Math.abs(result.standardPayment - 6911.0654640703115) < 0.01);
  assert.ok(Math.abs(result.strategyPayment - 6476.2347389313845) < 0.01);
  assert.ok(Math.abs(result.equivalentMarketRatePrice - 871486.22) < 0.01);
  assert.ok(Math.abs(result.manufacturedBuyingPower - 86513.78) < 0.01);
});

test('failed-list outcome treats principal as equity, not an expense', () => {
  const result = calculateSellWithIntention(defaults, auditDate);
  const expectedNet = result.reducedPrice * (1 - result.commissionRate)
    - result.fees
    - result.sellerLoanBalance
    - result.economicCarryingCost;

  assert.ok(Math.abs(result.failedListNet - expectedNet) < 0.01);
  assert.ok(result.principalPaidDuringListing > 0);
  assert.ok(result.economicCarryingCost < result.sellerCashOutlayDuringListing);
});

test('zero values are respected instead of replaced with defaults', () => {
  const result = calculateSellWithIntention({
    ...defaults,
    commissionPct: 0,
    fees: 0,
    downPaymentPct: 0,
    sellerHoa: 0,
    concession: 0,
    monthsOnMarket: 0
  }, auditDate);

  assert.equal(result.commissionRate, 0);
  assert.equal(result.fees, 0);
  assert.equal(result.downPaymentPct, 0);
  assert.equal(result.sellerHoa, 0);
  assert.equal(result.concession, 0);
  assert.equal(result.monthsOnMarket, 0);
  assert.equal(result.standardNet, 380000);
  assert.equal(result.economicCarryingCost, 0);
});

test('conventional IPC tiers include investment property and lower appraisal basis', () => {
  assert.equal(conventionalIpcCapPct(95, 'primary'), 3);
  assert.equal(conventionalIpcCapPct(90, 'primary'), 6);
  assert.equal(conventionalIpcCapPct(75, 'primary'), 9);
  assert.equal(conventionalIpcCapPct(60, 'investment'), 2);

  const result = calculateSellWithIntention({
    ...defaults,
    offerScenario: 3,
    appraisedValue: 940000
  }, auditDate);

  assert.equal(result.ipcBasis, 940000);
  assert.equal(result.ipcCapDollars, 56400);
});

test('quoted mortgage insurance and actual seller carrying costs override estimates', () => {
  const result = calculateSellWithIntention({
    ...defaults,
    standardMortgageInsurance: 325,
    strategyMortgageInsurance: 250,
    sellerPropertyTaxMonthly: 900,
    sellerInsuranceMonthly: 400
  }, auditDate);

  assert.equal(result.standardMortgageInsurance, 325);
  assert.equal(result.strategyMortgageInsurance, 250);
  assert.equal(result.sellerPropertyTaxMonthly, 900);
  assert.equal(result.sellerInsuranceMonthly, 400);
  assert.equal(result.sellerPropertyTaxEstimated, false);
  assert.equal(result.sellerInsuranceEstimated, false);

  const equivalentPayment = independentHousingPayment({
    price: result.equivalentMarketRatePrice,
    annualRatePct: defaults.standardRatePct,
    propertyTaxPct: defaults.propertyTaxPct,
    insurancePct: defaults.insurancePct,
    mortgageInsuranceMonthly: 325,
    hoaMonthly: defaults.buyerHoa,
    downPaymentPct: defaults.downPaymentPct
  });
  assert.ok(Math.abs(equivalentPayment - result.strategyPayment) < 0.01);
});

test('optional offer premium never replaces the floor-case comparison', () => {
  const result = calculateSellWithIntention({
    ...defaults,
    offerScenario: 2
  }, auditDate);

  assert.equal(result.strategyFloorVsStandard, -1400);
  assert.ok(Math.abs(result.strategyVsStandard - 3150.5) < 0.01);
  assert.ok(Math.abs(result.breakEvenPremiumDollars - 1473.6842105262914) < 0.01);
});
