import Decimal from 'decimal.js';

const ONES = [
  '', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć',
  'dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście',
  'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście',
];

const TENS = [
  '', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt',
  'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt',
];

const HUNDREDS = [
  '', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset',
  'sześćset', 'siedemset', 'osiemset', 'dziewięćset',
];

const THOUSANDS = ['', 'tysiąc', 'tysiące', 'tysięcy'];
const MILLIONS = ['', 'milion', 'miliony', 'milionów'];

/**
 * Get the correct plural form for Polish numbers
 */
function getPolishPluralForm(number: number, forms: string[]): string {
  if (number === 1) return forms[1];
  
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;
  
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return forms[3];
  if (lastDigit >= 2 && lastDigit <= 4) return forms[2];
  
  return forms[3];
}

/**
 * Convert a number 0-999 to Polish words
 */
function convertHundreds(n: number): string {
  if (n === 0) return '';
  
  const parts: string[] = [];
  
  // Hundreds
  if (n >= 100) {
    parts.push(HUNDREDS[Math.floor(n / 100)]);
    n %= 100;
  }
  
  // Tens and ones
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)]);
    if (n % 10 > 0) {
      parts.push(ONES[n % 10]);
    }
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  
  return parts.join(' ');
}

/**
 * Convert integer part to Polish words
 */
function convertIntegerToWords(n: number): string {
  if (n === 0) return 'zero';
  if (n < 0) return 'minus ' + convertIntegerToWords(-n);
  
  const parts: string[] = [];
  
  // Millions
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    parts.push(convertHundreds(millions));
    parts.push(getPolishPluralForm(millions, MILLIONS));
    n %= 1000000;
  }
  
  // Thousands
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    if (thousands === 1) {
      parts.push('tysiąc');
    } else {
      parts.push(convertHundreds(thousands));
      parts.push(getPolishPluralForm(thousands, THOUSANDS));
    }
    n %= 1000;
  }
  
  // Hundreds, tens, ones
  if (n > 0) {
    parts.push(convertHundreds(n));
  }
  
  return parts.filter(Boolean).join(' ');
}

/**
 * Get the correct form of "złoty" based on the number
 */
function getZlotyForm(n: number): string {
  if (n === 1) return 'złoty';
  
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;
  
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return 'złotych';
  if (lastDigit >= 2 && lastDigit <= 4) return 'złote';
  
  return 'złotych';
}

/**
 * Get the correct form of "grosz" based on the number
 */
function getGroszForm(n: number): string {
  if (n === 1) return 'grosz';
  
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;
  
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return 'groszy';
  if (lastDigit >= 2 && lastDigit <= 4) return 'grosze';
  
  return 'groszy';
}

/**
 * Convert an amount in PLN to Polish words
 * 
 * @example
 * numberToWordsPLN('15000.00') // "piętnaście tysięcy złotych zero groszy"
 * numberToWordsPLN('1234.56') // "jeden tysiąc dwieście trzydzieści cztery złote pięćdziesiąt sześć groszy"
 */
export function numberToWordsPLN(amount: string | number | Decimal): string {
  const decimal = new Decimal(amount);
  const integerPart = decimal.floor().toNumber();
  const decimalPart = decimal.minus(decimal.floor()).mul(100).round().toNumber();
  
  const integerWords = convertIntegerToWords(integerPart);
  const zlotyForm = getZlotyForm(integerPart);
  
  const decimalWords = decimalPart === 0 ? 'zero' : convertIntegerToWords(decimalPart);
  const groszForm = getGroszForm(decimalPart);
  
  return `${integerWords} ${zlotyForm} ${decimalWords} ${groszForm}`;
}

/**
 * Convert amount to words with "PLN" suffix (alternative format)
 * 
 * @example
 * numberToWordsWithPLN('15000.00') // "piętnaście tysięcy PLN zero gr"
 */
export function numberToWordsWithPLN(amount: string | number | Decimal): string {
  const decimal = new Decimal(amount);
  const integerPart = decimal.floor().toNumber();
  const decimalPart = decimal.minus(decimal.floor()).mul(100).round().toNumber();
  
  const integerWords = convertIntegerToWords(integerPart);
  const decimalStr = String(decimalPart).padStart(2, '0');
  
  return `${integerWords} PLN ${decimalStr} gr`;
}
