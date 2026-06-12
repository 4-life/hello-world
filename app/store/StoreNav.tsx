'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Props {
  canManage?: boolean;
}

export default function StoreNav({
  canManage = false,
}: Props): React.JSX.Element {
  const pathname = usePathname();

  const tabs = [
    { href: '/store', label: 'Parts catalog' },
    ...(canManage ? [{ href: '/store/stock', label: 'Engineer stock' }] : []),
  ];

  return (
    <div className="flex items-center gap-4 border-b text-sm">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            'pb-2 -mb-px border-b-2 border-transparent text-muted-foreground hover:text-foreground',
            pathname === tab.href && 'border-primary text-foreground',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
