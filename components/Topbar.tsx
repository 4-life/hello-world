import SignInButton from '@/components/SignInButton';
import NotificationBell from '@/components/NotificationBell';
import MobileSidebar from '@/components/MobileSidebar';
import type { SidebarProps } from '@/components/Sidebar';

export default function Topbar({
  canSeeUsers,
}: SidebarProps): React.JSX.Element {
  return (
    <header className="flex items-center justify-between gap-3 border-b px-6 py-3">
      <MobileSidebar canSeeUsers={canSeeUsers} />
      <div className="flex flex-1 items-center justify-end gap-3">
        <NotificationBell />
        <SignInButton />
      </div>
    </header>
  );
}
