import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  href: string;
  label: string;
}

export default function BackButton({ href, label }: Props): React.JSX.Element {
  return (
    <Button asChild variant="ghost" size="sm" className="mb-4 pl-0">
      <Link href={href}>
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    </Button>
  );
}
