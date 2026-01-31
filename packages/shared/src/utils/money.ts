import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
});

/**
 * Calculate net value: quantity * unit price
 */
export function calculateNetValue(quantity: string | number, unitPriceNet: string | number): Decimal {
  return new Decimal(quantity).mul(new Decimal(unitPriceNet));
}

/**
 * Calculate VAT value: net * (vatRate / 100)
 */
export function calculateVatValue(netValue: Decimal | string | number, vatRate: number): Decimal {
  return new Decimal(netValue).mul(new Decimal(vatRate).div(100));
}

/**
 * Calculate gross value: net + VAT
 */
export function calculateGrossValue(netValue: Decimal | string | number, vatValue: Decimal | string | number): Decimal {
  return new Decimal(netValue).plus(new Decimal(vatValue));
}

/**
 * Calculate all values for an invoice item
 */
export function calculateItemValues(quantity: string | number, unitPriceNet: string | number, vatRate: number) {
  const netValue = calculateNetValue(quantity, unitPriceNet);
  const vatValue = calculateVatValue(netValue, vatRate);
  const grossValue = calculateGrossValue(netValue, vatValue);
  
  return {
    valueNet: netValue.toFixed(2),
    valueVat: vatValue.toFixed(2),
    valueGross: grossValue.toFixed(2),
  };
}

/**
 * Calculate totals for multiple items
 */
export function calculateTotals(items: Array<{ valueNet: string; valueVat: string; valueGross: string }>) {
  const totalNet = items.reduce((sum, item) => sum.plus(new Decimal(item.valueNet)), new Decimal(0));
  const totalVat = items.reduce((sum, item) => sum.plus(new Decimal(item.valueVat)), new Decimal(0));
  const totalGross = items.reduce((sum, item) => sum.plus(new Decimal(item.valueGross)), new Decimal(0));
  
  return {
    totalNet: totalNet.toFixed(2),
    totalVat: totalVat.toFixed(2),
    totalGross: totalGross.toFixed(2),
  };
}

/**
 * Format amount as Polish PLN: "15 000,00"
 */
export function formatPLN(amount: string | number | Decimal): string {
  const decimal = new Decimal(amount);
  const fixed = decimal.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  
  // Add thousand separators (spaces)
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  // Use Polish decimal separator (comma)
  return `${formattedInt},${decPart}`;
}

/**
 * Parse PLN formatted string back to decimal string
 */
export function parsePLN(formatted: string): string {
  return formatted.replace(/\s/g, '').replace(',', '.');
}
