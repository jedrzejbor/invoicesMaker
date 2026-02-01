/**
 * Get the last day of a given month
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  // month is 1-indexed (1 = January)
  // Create date for first day of next month, then subtract 1 day
  return new Date(year, month, 0);
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Get the last business day of a month
 * If the last day falls on a weekend, returns the previous Friday
 * 
 * @param year - Full year (e.g., 2025)
 * @param month - Month (1-indexed: 1 = January, 12 = December)
 * @returns Date object representing the last business day
 * 
 * Note: This implementation only considers weekends. 
 * To support holidays, extend with a holiday calendar parameter.
 */
export function getLastBusinessDayOfMonth(
  year: number, 
  month: number,
  holidays?: Date[] // Reserved for future holiday support
): Date {
  const lastDay = getLastDayOfMonth(year, month);
  const dayOfWeek = lastDay.getDay();
  
  // If Saturday (6), go back 1 day to Friday
  if (dayOfWeek === 6) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  // If Sunday (0), go back 2 days to Friday
  else if (dayOfWeek === 0) {
    lastDay.setDate(lastDay.getDate() - 2);
  }
  
  // Future: Check against holidays array and adjust further if needed
  // while (isHoliday(lastDay, holidays) || isWeekend(lastDay)) {
  //   lastDay.setDate(lastDay.getDate() - 1);
  // }
  
  return lastDay;
}

/**
 * Check if today is the last business day of its month
 */
export function isLastBusinessDayOfMonth(date: Date = new Date()): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  
  const lastBusinessDay = getLastBusinessDayOfMonth(year, month);
  
  return (
    date.getFullYear() === lastBusinessDay.getFullYear() &&
    date.getMonth() === lastBusinessDay.getMonth() &&
    date.getDate() === lastBusinessDay.getDate()
  );
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date as Polish format: DD.MM.YYYY
 */
export function formatDatePL(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get current month and year
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

/**
 * Parse YYYY-MM-DD string to Date
 */
export function parseISODate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
