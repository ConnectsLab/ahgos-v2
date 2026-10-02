import { format, formatDistanceToNow, isValid } from 'date-fns';

export { cn } from 'cn';

export type DateValue = Date | string | number | null | undefined;

export function normalizeDate(value: DateValue): Date | null {
  if (value === null || value === undefined || value === '') return null;

  const date = value instanceof Date ? value : new Date(value);
  return isValid(date) ? date : null;
}

export function formatDate(value: DateValue, pattern = 'MMM d, yyyy') {
  const date = normalizeDate(value);
  return date ? format(date, pattern) : '—';
}

export function formatRelativeDate(value: DateValue) {
  const date = normalizeDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : '—';
}
