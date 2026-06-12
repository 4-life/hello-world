import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/10 text-destructive',
        outline: 'border-border text-foreground',
        gray: 'bg-muted text-muted-foreground',
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
        amber:
          'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
        green:
          'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
        red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>): React.JSX.Element {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
