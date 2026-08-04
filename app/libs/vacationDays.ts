interface VacationRange {
  startDate: Date | string;
  endDate: Date | string;
}

export function countDaysInclusive(
  startDate: Date | string,
  endDate: Date | string,
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

export function countUsedDays(vacations: VacationRange[]): number {
  return vacations.reduce(
    (total, v) => total + countDaysInclusive(v.startDate, v.endDate),
    0,
  );
}

export function calcAvailableDays(
  startWorkDate: Date | string | null | undefined,
  vacations: VacationRange[],
): number | null {
  if (!startWorkDate) return null;
  const start = new Date(startWorkDate);
  const today = new Date();
  const workedMonths = Math.max(
    0,
    (today.getFullYear() - start.getFullYear()) * 12 +
      (today.getMonth() - start.getMonth()),
  );
  return Math.ceil(workedMonths * 2.33) - countUsedDays(vacations);
}
