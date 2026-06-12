'use client';

import * as React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  'aria-invalid'?: boolean;
}

function TimePicker({
  value,
  onChange,
  ...props
}: TimePickerProps): React.JSX.Element {
  const [hour, minute] = value ? value.split(':') : ['', ''];
  const isInvalid = props['aria-invalid'];

  function handleHourChange(h: string): void {
    onChange(`${h}:${minute || '00'}`);
  }

  function handleMinuteChange(m: string): void {
    onChange(`${hour || '00'}:${m}`);
  }

  return (
    <div
      className={cn(
        'flex h-8 items-center gap-1 rounded-lg border border-input px-2',
        isInvalid && 'border-destructive ring-3 ring-destructive/20',
      )}
    >
      <Clock className="size-4 text-muted-foreground" />
      <Select value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="h-6 border-0 px-1 shadow-none focus-visible:ring-0">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="h-6 border-0 px-1 shadow-none focus-visible:ring-0">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export { TimePicker };
