'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { SidebarNav, type SidebarProps } from '@/components/Sidebar';

export default function MobileSidebar({
  canSeeUsers,
}: SidebarProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden -ml-2"
        aria-label="Open menu"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="size-5" />
      </Button>
      <DrawerContent className="flex w-64">
        <DrawerTitle className="sr-only">Navigation</DrawerTitle>
        <SidebarNav
          canSeeUsers={canSeeUsers}
          onNavigate={() => setIsOpen(false)}
        />
      </DrawerContent>
    </Drawer>
  );
}
