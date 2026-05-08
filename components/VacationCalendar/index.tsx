'use client';

import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useCreateVacation from '@/app/libs/createVacation';
import useDeleteVacation from '@/app/libs/deleteVacation';
import type { UserQuery } from '@/app/libs/getUser';
import {
  expandRange,
  formatDate,
  getDisabledDates,
  makeOnSelect,
  toLocalNoonISO,
} from './utils';

interface Props {
  vacations: NonNullable<UserQuery['user']>['vacations'];
  availableDays: number;
  userId: string;
}

export default function VacationCalendar({
  vacations,
  availableDays,
  userId,
}: Props): React.JSX.Element {
  const [range, setRange] = useState<DateRange | undefined>();
  const [createVacation, mutationResult] = useCreateVacation();
  const isSaving = mutationResult.loading;
  const [deleteVacation] = useDeleteVacation();
  const router = useRouter();
  const canSelect = availableDays > 0;

  const { pastDates, futureDates } = useMemo(() => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const all = vacations.flatMap((v) => expandRange(v.startDate, v.endDate));
    return {
      pastDates: all.filter((d) => d < midnight),
      futureDates: all.filter((d) => d >= midnight),
    };
  }, [vacations]);

  async function handleSave(): Promise<void> {
    if (!range?.from || !range?.to) return;
    await createVacation({
      variables: {
        data: {
          userId,
          startDate: toLocalNoonISO(range.from),
          endDate: toLocalNoonISO(range.to),
        },
      },
    });
    setRange(undefined);
    router.refresh();
  }

  return (
    <Card
      className="w-fit p-4"
      style={{ '--cell-size': '4rem' } as React.CSSProperties}
    >
      <Calendar
        mode="range"
        selected={range}
        onSelect={makeOnSelect(canSelect, availableDays, setRange)}
        captionLayout="dropdown"
        weekStartsOn={1}
        disabled={getDisabledDates(canSelect, [...pastDates, ...futureDates])}
        modifiers={{ bookedPast: pastDates, bookedFuture: futureDates }}
        modifiersClassNames={{
          bookedPast:
            '[&>button]:line-through opacity-100 [&>button]:text-muted-foreground',
          bookedFuture:
            '[&>button]:line-through opacity-100 [&>button]:text-green-600',
        }}
        className="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
      />
      {range?.from && range?.to && (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            {formatDate(range.from)} → {formatDate(range.to)}
          </span>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save vacation'}
          </Button>
        </div>
      )}

      {vacations.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Vacations</p>
          {vacations.map((v) => {
            const isFuture = new Date(v.startDate) >= new Date();
            return (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {formatDate(new Date(v.startDate))} →
                  {formatDate(new Date(v.endDate))}
                </span>
                {isFuture && (
                  <Button
                    variant="destructive"
                    size="xs"
                    onClick={async () => {
                      await deleteVacation({ variables: { id: v.id } });
                      router.refresh();
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
