export function monthlyPrincipalAndInterest(principal, annualRate, termMonths = 360) {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return principal * monthlyRate / (1 - (1 + monthlyRate) ** -termMonths);
}

export const moveUpMethodExamples = Object.freeze({
  purchasePrice: 1_300_000,
  allEquityDownPayment: 528_000,
  twentyPercentDownPayment: 260_000,
  comparisonRate: 0.065,
  sellerExamplePrice: 915_000,
  sellerExampleDownPaymentPercent: 0.20,
  marketRate: 0.065,
  illustratedBuydownRate: 0.055,
});

export function buildMoveUpMethodNumbers() {
  const example = moveUpMethodExamples;
  const allEquityLoan = example.purchasePrice - example.allEquityDownPayment;
  const twentyPercentLoan = example.purchasePrice - example.twentyPercentDownPayment;
  const retainedEquity = example.allEquityDownPayment - example.twentyPercentDownPayment;
  const allEquityPayment = monthlyPrincipalAndInterest(allEquityLoan, example.comparisonRate);
  const twentyPercentPayment = monthlyPrincipalAndInterest(twentyPercentLoan, example.comparisonRate);
  const sellerExampleLoan = example.sellerExamplePrice * (1 - example.sellerExampleDownPaymentPercent);
  const marketPayment = monthlyPrincipalAndInterest(sellerExampleLoan, example.marketRate);
  const illustratedBuydownPayment = monthlyPrincipalAndInterest(sellerExampleLoan, example.illustratedBuydownRate);

  return {
    allEquityLoan,
    twentyPercentLoan,
    retainedEquity,
    allEquityPayment,
    twentyPercentPayment,
    paymentDifference: twentyPercentPayment - allEquityPayment,
    sellerExampleLoan,
    marketPayment,
    illustratedBuydownPayment,
    illustratedPaymentDifference: marketPayment - illustratedBuydownPayment,
  };
}
