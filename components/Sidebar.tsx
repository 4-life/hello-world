'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  ClipboardList,
  HardHat,
  Warehouse,
  Users,
  Contact,
  Receipt,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  canSeeUsers: boolean;
}

export function getSidebarLinks({
  canSeeUsers,
}: SidebarProps): { href: string; label: string; icon: LucideIcon }[] {
  return [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/orders', label: 'Orders', icon: ClipboardList },
    { href: '/engineers', label: 'Engineers', icon: HardHat },
    { href: '/clients', label: 'Clients', icon: Contact },
    { href: '/invoices', label: 'Invoices', icon: Receipt },
    { href: '/store', label: 'Store', icon: Warehouse },
    ...(canSeeUsers ? [{ href: '/users', label: 'Users', icon: Users }] : []),
  ];
}

interface SidebarNavProps extends SidebarProps {
  onNavigate?: () => void;
}

export function SidebarNav({
  canSeeUsers,
  onNavigate,
}: SidebarNavProps): React.JSX.Element {
  const pathname = usePathname();
  const links = getSidebarLinks({ canSeeUsers });

  return (
    <>
      <Link href="/home" className="flex items-center px-3 py-4">
        <Image
          src="/logo.png"
          alt="ERP/CMMS"
          width={120}
          height={40}
          priority
          className="bg-primary rounded-md p-2"
        />
      </Link>
      <nav className="flex flex-col gap-1 px-3">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function Sidebar({
  canSeeUsers,
}: SidebarProps): React.JSX.Element {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r md:flex">
      <SidebarNav canSeeUsers={canSeeUsers} />
    </aside>
  );
}
