export const OFFER_PREMIUMS = Object.freeze({
  1: 0,
  2: 0.005,
  3: 0.015,
  4: 0.03,
  5: 0.05
});

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nonNegative(value, fallback = 0) {
  return Math.max(0, finite(value, fallback));
}

function optionalNonNegative(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : null;
}

export function monthlyPrincipalAndInterest(balance, annualRatePct, years) {
  const principal = nonNegative(balance);
  const months = Math.max(1, nonNegative(years, 30) * 12);
  const monthlyRate = nonNegative(annualRatePct) / 100 / 12;

  if (monthlyRate === 0) return principal / months;

  const growth = Math.pow(1 + monthlyRate, months);
  return principal * (monthlyRate * growth) / (growth - 1);
}

export function remainingLoanBalance(balance, annualRatePct, remainingYears, monthsElapsed) {
  const principal = nonNegative(balance);
  const totalMonths = Math.max(1, nonNegative(remainingYears, 30) * 12);
  const elapsed = Math.min(nonNegative(monthsElapsed), totalMonths);
  const payment = monthlyPrincipalAndInterest(principal, annualRatePct, remainingYears);
  const monthlyRate = nonNegative(annualRatePct) / 100 / 12;

  if (monthlyRate === 0) return Math.max(0, principal - payment * elapsed);

  const growth = Math.pow(1 + monthlyRate, elapsed);
  return Math.max(0, principal * growth - payment * ((growth - 1) / monthlyRate));
}

export function fullMonthlyHousingPayment({
  price,
  annualRatePct,
  propertyTaxPct,
  insurancePct,
  mortgageInsuranceMonthly = 0,
  hoaMonthly,
  downPaymentPct
}) {
  const propertyPrice = nonNegative(price);
  const downPayment = Math.min(100, nonNegative(downPaymentPct)) / 100;
  const loanAmount = propertyPrice * (1 - downPayment);

  return monthlyPrincipalAndInterest(loanAmount, annualRatePct, 30)
    + propertyPrice * nonNegative(propertyTaxPct) / 100 / 12
    + propertyPrice * nonNegative(insurancePct) / 100 / 12
    + nonNegative(mortgageInsuranceMonthly)
    + nonNegative(hoaMonthly);
}

export function equivalentPriceAtPayment({
  targetMonthlyPayment,
  annualRatePct,
  propertyTaxPct,
  insurancePct,
  mortgageInsuranceMonthly = 0,
  hoaMonthly,
  downPaymentPct
}) {
  const downPayment = Math.min(100, nonNegative(downPaymentPct)) / 100;
  const principalAndInterestPerDollar = monthlyPrincipalAndInterest(1, annualRatePct, 30) * (1 - downPayment);
  const taxPerDollar = nonNegative(propertyTaxPct) / 100 / 12;
  const insurancePerDollar = nonNegative(insurancePct) / 100 / 12;
  const costPerDollar = principalAndInterestPerDollar + taxPerDollar + insurancePerDollar;
  const paymentAvailableForPrice = nonNegative(targetMonthlyPayment)
    - nonNegative(mortgageInsuranceMonthly)
    - nonNegative(hoaMonthly);

  if (costPerDollar <= 0 || paymentAvailableForPrice <= 0) return 0;
  return paymentAvailableForPrice / costPerDollar;
}

export function yearsBetween(dateString, now = new Date()) {
  const purchaseDate = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(purchaseDate.getTime())) return 0;
  return Math.max(0, (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export function conventionalIpcCapPct(ltvPct, occupancy = 'primary') {
  if (occupancy === 'investment') return 2;
  if (ltvPct > 90) return 3;
  if (ltvPct > 75) return 6;
  return 9;
}

export function calculateSellWithIntention(input, now = new Date()) {
  const listPrice = nonNegative(input.listPrice);
  const commissionRate = nonNegative(input.commissionPct) / 100;
  const fees = nonNegative(input.fees);
  const downPaymentPct = Math.min(100, nonNegative(input.downPaymentPct));
  const downPaymentRate = downPaymentPct / 100;
  const propertyTaxPct = nonNegative(input.propertyTaxPct);
  const insurancePct = nonNegative(input.insurancePct);
  const buyerHoa = nonNegative(input.buyerHoa);
  const standardMortgageInsurance = nonNegative(input.standardMortgageInsurance);
  const strategyMortgageInsurance = nonNegative(input.strategyMortgageInsurance);
  const sellerLoanBalance = nonNegative(input.sellerLoanBalance);
  const sellerMortgageRatePct = nonNegative(input.sellerMortgageRatePct);
  const sellerRemainingTermYears = Math.max(1 / 12, nonNegative(input.sellerRemainingTermYears, 30));
  const concession = nonNegative(input.concession);
  const strategyRatePct = nonNegative(input.strategyRatePct);
  const standardRatePct = nonNegative(input.standardRatePct);
  const priceCut = nonNegative(input.priceCut);
  const originalPurchasePrice = nonNegative(input.originalPurchasePrice);
  const taxAssessmentCapPct = nonNegative(input.taxAssessmentCapPct);
  const insuranceInflationPct = nonNegative(input.insuranceInflationPct);
  const sellerHoa = nonNegative(input.sellerHoa);
  const monthsOnMarket = nonNegative(input.monthsOnMarket);
  const offerScenario = Math.min(5, Math.max(1, Math.trunc(finite(input.offerScenario, 1))));
  const occupancy = input.occupancy === 'investment' ? 'investment' : 'primary';

  const standardPayment = fullMonthlyHousingPayment({
    price: listPrice,
    annualRatePct: standardRatePct,
    propertyTaxPct,
    insurancePct,
    mortgageInsuranceMonthly: standardMortgageInsurance,
    hoaMonthly: buyerHoa,
    downPaymentPct
  });

  const standardNet = listPrice * (1 - commissionRate) - fees - sellerLoanBalance;
  const strategyListPrice = listPrice + concession;
  const strategyPayment = fullMonthlyHousingPayment({
    price: strategyListPrice,
    annualRatePct: strategyRatePct,
    propertyTaxPct,
    insurancePct,
    mortgageInsuranceMonthly: strategyMortgageInsurance,
    hoaMonthly: buyerHoa,
    downPaymentPct
  });

  const offerPremium = OFFER_PREMIUMS[offerScenario];
  const strategySalePrice = strategyListPrice * (1 + offerPremium);
  const strategyNet = strategySalePrice * (1 - commissionRate) - concession - fees - sellerLoanBalance;
  const strategyFloorNet = strategyListPrice * (1 - commissionRate) - concession - fees - sellerLoanBalance;
  const strategyVsStandard = strategyNet - standardNet;
  const strategyFloorVsStandard = strategyFloorNet - standardNet;

  const breakEvenSalePrice = commissionRate >= 1
    ? Number.POSITIVE_INFINITY
    : (standardNet + sellerLoanBalance + fees + concession) / (1 - commissionRate);
  const breakEvenPremiumDollars = Math.max(0, breakEvenSalePrice - strategyListPrice);
  const breakEvenPremiumPct = strategyListPrice > 0
    ? breakEvenPremiumDollars / strategyListPrice * 100
    : 0;

  const monthlySavings = standardPayment - strategyPayment;
  const equivalentMarketRatePrice = equivalentPriceAtPayment({
    targetMonthlyPayment: strategyPayment,
    annualRatePct: standardRatePct,
    propertyTaxPct,
    insurancePct,
    mortgageInsuranceMonthly: standardMortgageInsurance,
    hoaMonthly: buyerHoa,
    downPaymentPct
  });

  const reducedPrice = Math.max(0, listPrice - priceCut);
  const reducedPayment = fullMonthlyHousingPayment({
    price: reducedPrice,
    annualRatePct: standardRatePct,
    propertyTaxPct,
    insurancePct,
    mortgageInsuranceMonthly: standardMortgageInsurance,
    hoaMonthly: buyerHoa,
    downPaymentPct
  });

  const ownedYears = yearsBetween(input.purchaseDate, now);
  const sellerMortgagePayment = monthlyPrincipalAndInterest(
    sellerLoanBalance,
    sellerMortgageRatePct,
    sellerRemainingTermYears
  );
  const estimatedSellerPropertyTaxMonthly = originalPurchasePrice * propertyTaxPct / 100 / 12
    * Math.pow(1 + taxAssessmentCapPct / 100, ownedYears);
  const estimatedSellerInsuranceMonthly = originalPurchasePrice * insurancePct / 100 / 12
    * Math.pow(1 + insuranceInflationPct / 100, ownedYears);
  const sellerPropertyTaxOverride = optionalNonNegative(input.sellerPropertyTaxMonthly);
  const sellerInsuranceOverride = optionalNonNegative(input.sellerInsuranceMonthly);
  const sellerPropertyTaxMonthly = sellerPropertyTaxOverride ?? estimatedSellerPropertyTaxMonthly;
  const sellerInsuranceMonthly = sellerInsuranceOverride ?? estimatedSellerInsuranceMonthly;
  const sellerMonthlyCashOutlay = sellerMortgagePayment
    + sellerPropertyTaxMonthly
    + sellerInsuranceMonthly
    + sellerHoa;
  const sellerCashOutlayDuringListing = sellerMonthlyCashOutlay * monthsOnMarket;
  const futureLoanBalance = remainingLoanBalance(
    sellerLoanBalance,
    sellerMortgageRatePct,
    sellerRemainingTermYears,
    monthsOnMarket
  );
  const principalPaidDuringListing = Math.max(0, sellerLoanBalance - futureLoanBalance);
  const mortgagePaymentsDuringListing = sellerMortgagePayment * monthsOnMarket;
  const interestPaidDuringListing = Math.max(0, mortgagePaymentsDuringListing - principalPaidDuringListing);
  const nonMortgageCarry = (sellerPropertyTaxMonthly + sellerInsuranceMonthly + sellerHoa) * monthsOnMarket;
  const economicCarryingCost = interestPaidDuringListing + nonMortgageCarry;
  const failedListNet = reducedPrice * (1 - commissionRate)
    - fees
    - sellerLoanBalance
    - economicCarryingCost;
  const strategyVsFailedList = strategyNet - failedListNet;
  const strategyFloorVsFailedList = strategyFloorNet - failedListNet;

  const ltvPct = 100 - downPaymentPct;
  const ipcCapPct = conventionalIpcCapPct(ltvPct, occupancy);
  const enteredAppraisedValue = nonNegative(input.appraisedValue);
  const ipcBasis = enteredAppraisedValue > 0
    ? Math.min(strategySalePrice, enteredAppraisedValue)
    : strategySalePrice;
  const ipcCapDollars = ipcBasis * ipcCapPct / 100;
  const concessionPct = ipcBasis > 0 ? concession / ipcBasis * 100 : 0;
  const ipcRatio = ipcCapDollars > 0
    ? concession / ipcCapDollars
    : (concession > 0 ? Number.POSITIVE_INFINITY : 0);

  return {
    listPrice,
    commissionRate,
    fees,
    downPaymentPct,
    downPaymentRate,
    propertyTaxPct,
    insurancePct,
    buyerHoa,
    standardMortgageInsurance,
    strategyMortgageInsurance,
    sellerLoanBalance,
    concession,
    strategyRatePct,
    standardRatePct,
    priceCut,
    originalPurchasePrice,
    taxAssessmentCapPct,
    insuranceInflationPct,
    sellerHoa,
    monthsOnMarket,
    offerScenario,
    occupancy,
    standardPayment,
    standardNet,
    strategyListPrice,
    strategyPayment,
    offerPremium,
    strategySalePrice,
    strategyNet,
    strategyFloorNet,
    strategyVsStandard,
    strategyFloorVsStandard,
    breakEvenSalePrice,
    breakEvenPremiumDollars,
    breakEvenPremiumPct,
    monthlySavings,
    equivalentMarketRatePrice,
    manufacturedBuyingPower: strategyListPrice - equivalentMarketRatePrice,
    reducedPrice,
    reducedPayment,
    ownedYears,
    sellerMortgagePayment,
    sellerPropertyTaxMonthly,
    sellerInsuranceMonthly,
    sellerPropertyTaxEstimated: sellerPropertyTaxOverride === null,
    sellerInsuranceEstimated: sellerInsuranceOverride === null,
    sellerMonthlyCashOutlay,
    sellerCashOutlayDuringListing,
    futureLoanBalance,
    principalPaidDuringListing,
    interestPaidDuringListing,
    economicCarryingCost,
    failedListNet,
    strategyVsFailedList,
    strategyFloorVsFailedList,
    ltvPct,
    ipcCapPct,
    ipcBasis,
    ipcCapDollars,
    concessionPct,
    ipcRatio,
    appraisedValue: enteredAppraisedValue
  };
}
