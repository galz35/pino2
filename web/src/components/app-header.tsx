import * as React from 'react';
import { Menu, Wallet, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { ThemeToggle } from './theme-toggle';
import { UserNav } from './user-nav';
import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { Notification, NavLink } from './app-layout';
import { Link, useParams, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NetworkStatusIndicator } from './network-status-indicator';

interface AppHeaderProps {
  navItems: NavLink[];
  language: 'es' | 'en';
  onLanguageChange: (lang: string) => void;
  exchangeRate?: number;
  notifications: Notification[];
  onNotificationClick: (notificationId: string) => void;
  isSocketConnected?: boolean;
}

export function AppHeader({
  navItems,
  language,
  onLanguageChange,
  exchangeRate,
  notifications,
  onNotificationClick,
  isSocketConnected = false,
}: AppHeaderProps) {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { storeId } = useParams();

  const handleLanguageChange = (lang: string) => {
    onLanguageChange(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const location = useLocation();

  const clonedNav = navItems.map((item, index) => {
    const Icon = item.icon;
    const isActive = location.pathname.startsWith(item.href) && item.href !== '/' || (location.pathname === '/' && item.href === '/');
    const showSectionTitle =
      index === 0 || item.section !== navItems[index - 1]?.section;

    return (
      <div key={item.name} className={cn(showSectionTitle && index !== 0 && 'mt-4')}>
        {showSectionTitle && item.section ? (
          <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground/80">
            {item.section}
          </p>
        ) : null}
        <Link
          to={item.href}
          onClick={() => setIsSheetOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            isActive && 'bg-muted text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
          {item.name}
        </Link>
      </div>
    );
  });

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Alternar menú de navegación</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <SheetHeader>
              <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
            </SheetHeader>
            <nav className="flex-1 grid gap-2 text-lg font-medium overflow-y-auto">{clonedNav}</nav>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex w-full items-center justify-end gap-4">
        {exchangeRate && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span>C$ {exchangeRate.toFixed(2)} : $ 1.00</span>
          </div>
        )}
        <NetworkStatusIndicator isSocketConnected={isSocketConnected} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} asChild>
                  <Link
                    to={notif.href}
                    className="flex flex-col items-start whitespace-normal"
                    onClick={() => onNotificationClick(notif.id)}
                  >
                    <p className="font-semibold">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.description}</p>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No hay notificaciones nuevas.</p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
