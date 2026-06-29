import { AppLogo } from '@/shared/ui';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b bg-background px-4 shadow-sm md:px-6">
      <AppLogo height={40} to="/" />
      <div className="flex items-center gap-4">
        {/* Placeholder for Profile/Notifications */}
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
          A
        </div>
      </div>
    </header>
  );
}
