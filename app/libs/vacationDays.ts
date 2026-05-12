interface VacationRange {
  startDate: Date | string;
  endDate: Date | string;
}

export function countUsedDays(vacations: VacationRange[]): number {
  return vacations.reduce((total, v) => {
    const start = new Date(v.startDate);
    const end = new Date(v.endDate);
    return (
      total + Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
    );
  }, 0);
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
  console.log(workedMonths, countUsedDays(vacations));
  return Math.ceil(workedMonths * 2.33) - countUsedDays(vacations);
}
