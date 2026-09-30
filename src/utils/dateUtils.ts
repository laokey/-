/**
 * Utility functions for anniversary date parsing and automatic days calculation
 */

export function calculateDaysFromDate(dateStr?: string): number {
  if (!dateStr) return 520;

  // Extract year, month, day from formats like 2024.05.20, 2024-05-20, 2024/05/20, 2024年5月20日
  const match = dateStr.match(/(\d{4})[^\d](\d{1,2})[^\d](\d{1,2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);

    const startDate = new Date(year, month, day);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Day 1 is the start day itself, so if today is startDate, it is Day 1
    return diffDays >= 0 ? diffDays + 1 : 1;
  }

  // Fallback if number already provided
  const num = parseInt(dateStr, 10);
  if (!isNaN(num) && num > 0) return num;

  return 520;
}

export function formatDateToStandard(dateStr?: string): string {
  if (!dateStr) return '2024.05.20';
  const match = dateStr.match(/(\d{4})[^\d](\d{1,2})[^\d](\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${year}.${month}.${day}`;
  }
  return dateStr;
}

export function formatDateToInputFormat(dateStr?: string): string {
  if (!dateStr) return '2024-05-20';
  const match = dateStr.match(/(\d{4})[^\d](\d{1,2})[^\d](\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '2024-05-20';
}
