window.OPEN_HOUSE_PROPERTIES = {
  "demo-123-main-street": {
    demo: true,
    status: "For sale",
    address: "123 Main Street",
    city: "Manhattan Beach",
    state: "California",
    zip: "90266",
    price: 1495000,
    beds: 4,
    baths: 3,
    sqft: 2140,
    propertyType: "Single-family residence",
    hoaMonthly: 0,
    openHouse: "Sunday | 1:00-4:00 PM",
    photo: "/open-house/demo-property.svg",
    photoAlt: "Demo property image for the open-house strategy experience",
    taxRate: 0.0125,
    annualInsurance: 4200,
    estimatedClosingCosts: 18500,
    estimatedSellingCostRate: 0.055,
    illustrativeBuyerCash: 420000,
    defaultAppreciationRate: 0.03,
    defaultRate: 0.06625,
    listingAgent: {
      name: "Sample Listing Partner",
      brokerage: "Partner Brokerage",
      license: "DRE #00000000",
      phone: "",
      email: "",
      website: ""
    },
    financing: {
      sellerCredit: 25000,
      scenarios: [
        {
          id: "preserve-cash",
          label: "Liquidity first",
          title: "Preserve more cash",
          downPaymentRate: 0.10,
          interestRate: 0.06875,
          pmiAnnualRate: 0.0048,
          sellerCredit: 25000,
          gives: "More liquidity after closing for reserves, improvements, investing, or the unexpected.",
          costs: "A higher required payment, more interest, and estimated mortgage insurance."
        },
        {
          id: "balanced",
          label: "Balanced structure",
          title: "Balance payment and liquidity",
          downPaymentRate: 0.15,
          interestRate: 0.06625,
          pmiAnnualRate: 0.0032,
          sellerCredit: 25000,
          gives: "A middle ground between monthly payment and cash retained after closing.",
          costs: "More cash committed than the liquidity-first option and some estimated mortgage insurance."
        },
        {
          id: "reduce-payment",
          label: "Payment first",
          title: "Reduce the required payment",
          downPaymentRate: 0.20,
          interestRate: 0.065,
          pmiAnnualRate: 0,
          sellerCredit: 25000,
          gives: "A lower required monthly payment and no estimated mortgage insurance.",
          costs: "More capital committed to the property on day one."
        }
      ],
      special: {
        headline: "Up to $25,000 in seller-paid financing support",
        amount: 25000,
        shortDescription: "The credit may be available for eligible closing costs or an approved rate-buydown structure, subject to the purchase agreement, loan program limits, and underwriting approval.",
        options: [
          {
            id: "closing-costs",
            label: "Use 01",
            title: "Reduce cash due at closing",
            description: "Apply eligible funds toward allowable closing costs so more of your cash remains available after closing."
          },
          {
            id: "rate-buydown",
            label: "Use 02",
            title: "Buy down the interest rate",
            description: "Compare a permanent or temporary buydown when permitted. The right use depends on break-even timing and future plans."
          },
          {
            id: "combination",
            label: "Use 03",
            title: "Create a blended strategy",
            description: "Use part of the credit for eligible closing costs and part for rate strategy when program rules allow."
          }
        ],
        disclaimer: "Demo terms only. Replace with the approved property-specific incentive, eligible uses, program limits, expiration date, and required disclosures before publishing."
      }
    }
  }
};
