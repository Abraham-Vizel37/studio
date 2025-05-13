import Link from 'next/link';
import { FrameMapperLogo } from '@/components/icons/FrameMapperLogo';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-6 border-b bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <FrameMapperLogo className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
          <h1 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
            FrameMapper
          </h1>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
