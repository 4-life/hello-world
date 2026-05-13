'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useNotifications,
  useMarkNotificationsRead,
  type NotificationItem,
} from '@/app/libs/notifications';

export default function NotificationBell(): React.JSX.Element {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [displayed, setDisplayed] = useState<NotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const { data, refetch } = useNotifications();
  const [markRead] = useMarkNotificationsRead();

  const unread: NotificationItem[] = data?.notifications ?? [];

  useEffect(() => {
    const es = new EventSource('/api/notifications/stream');
    es.onmessage = (): void => {
      refetch();
    };
    return (): void => es.close();
  }, [refetch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return (): void =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle(): void {
    if (!isOpen) {
      setDisplayed(unread);
      setOpen(true);
      if (unread.length > 0) {
        markRead().then(() => refetch());
      }
    } else {
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            {unread.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-md border bg-popover shadow-md">
          {displayed.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No new notifications
            </p>
          ) : (
            <ul>
              {displayed.map((n) => (
                <li
                  key={n.id}
                  className="border-b px-4 py-3 text-sm last:border-0"
                >
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
