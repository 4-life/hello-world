import type { DateRange } from 'react-day-picker';

export function expandRange(start: string, end: string): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function toLocalNoonISO(date: Date): string {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0,
  ).toISOString();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getDisabledDates(
  canSelect: boolean,
  bookedDates: Date[],
): boolean | (Date | { before: Date })[] {
  if (!canSelect) return true;
  return [
    { before: new Date(new Date().setDate(new Date().getDate() + 1)) },
    ...bookedDates,
  ];
}

export function makeOnSelect(
  canSelect: boolean,
  availableDays: number,
  setRange: (range: DateRange | undefined) => void,
): ((selected: DateRange | undefined) => void) | undefined {
  if (!canSelect) return undefined;
  return (selected) => {
    if (!selected?.from || !selected?.to) {
      setRange(selected);
      return;
    }
    setRange(clampRange(selected, availableDays));
  };
}

export function clampRange(
  selected: DateRange,
  availableDays: number,
): DateRange {
  if (!selected.from || !selected.to) return selected;
  const maxTo = new Date(selected.from);
  maxTo.setDate(maxTo.getDate() + availableDays - 1);
  return {
    from: selected.from,
    to: selected.to > maxTo ? maxTo : selected.to,
  };
}
