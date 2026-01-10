import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useSession } from '@/components/hooks/useSession';
import { useIsNative } from '@/hooks/use-mobile';
import { 
  BookOpen, 
  Menu, 
  X, 
  LogOut, 
  User, 
  ChevronDown, 
  Archive,
  Bell,
  Search,
  Settings
} from 'lucide-react';

import IconButton from '@/components/ui/IconButton';
import { tokens, cx } from '@/components/theme/tokens';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator, 
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import ThemeToggle from '@/components/theme/ThemeToggle';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import SchoolSwitcher from '@/components/school/SchoolSwitcher';
import CommandPalette from '@/components/navigation/CommandPalette';
import PortalSidebar from './PortalSidebar';

/**
 * PortalLayout
 * Unified premium shell for all authenticated portals (student, teacher, admin).
 * Features:
 * - Adaptive sidebar (registry-driven)
 * - Global command palette (Cmd+K)
 * - Multi-tenant school switcher
 * - Theme support
 */
export default function PortalLayout({ children, currentPageName, audienceOverride }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    user,
    memberships,
    activeSchool,
    audience: sessionAudience,
    isAdmin,
    isTeacher,
    changeActiveSchool,
  } = useSession();

  const isNative = useIsNative();

  const handleSchoolChange = async (schoolId) => {
    await changeActiveSchool(schoolId);
  };

  // Allow layout to force a specific audience (e.g. Student Portal showing student nav to an Admin)
  const userAudience = audienceOverride || sessionAudience || (isAdmin ? 'admin' : (isTeacher ? 'teacher' : 'student'));

  return (
    <div className={cx(tokens.page.outer, "min-h-screen flex flex-col bg-background")}>
      
      {/* Top Navigation Bar */}
      <header className={cx(
        "sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md",
        isNative ? "pt-safe-top" : ""
      )}>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Left: Brand / Logo */}
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md group-hover:scale-105 transition-transform">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold tracking-tight text-foreground">Breslov Academy</span>
                </div>
              </Link>
            </div>

            {/* Middle: Command Palette & Global Tools */}
            <div className="flex flex-1 items-center justify-center max-w-md">
              <CommandPalette audience={userAudience} />
            </div>

            {/* Right: School Switcher, Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              <div className="hidden md:flex items-center gap-3 mr-2">
                <SchoolSwitcher 
                  activeSchool={activeSchool}
                  memberships={memberships}
                  onSchoolChange={handleSchoolChange}
                  isAdmin={isAdmin}
                />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <NotificationCenter user={user} />
                <ThemeToggle userEmail={user?.email} />
                
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-1 ring-border border-2 border-background shadow-sm hover:ring-primary/50 transition-all">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-border/50">
                      <DropdownMenuLabel className="font-normal px-2 py-3">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-semibold leading-none text-foreground">{user.full_name}</p>
                          <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="opacity-50" />
                      
                      <div className="py-1">
                        <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                          <Link to={createPageUrl('Portfolio')} className="flex items-center">
                            <User className="mr-2 h-4 w-4 opacity-70" />
                            <span>My Profile</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-md cursor-pointer">
                          <Link to={createPageUrl('Account')} className="flex items-center">
                            <Settings className="mr-2 h-4 w-4 opacity-70" />
                            <span>Account Settings</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-md cursor-pointer md:hidden">
                          <Link to={createPageUrl('Vault')} className="flex items-center">
                            <Archive className="mr-2 h-4 w-4 opacity-70" />
                            <span>Vault</span>
                          </Link>
                        </DropdownMenuItem>
                      </div>

                      <DropdownMenuSeparator className="opacity-50" />
                      
                      <DropdownMenuItem 
                        onClick={() => base44.auth.logout()}
                        className="rounded-md cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Mobile menu button */}
                <div className="md:hidden ml-1">
                  <IconButton
                    label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    variant="ghost"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="h-9 w-9"
                  >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar: Desktop */}
        <aside className="hidden md:block w-72 border-r border-border/60 bg-muted/10 overflow-y-auto">
          <div className="p-4">
            <PortalSidebar currentPageName={currentPageName} audience={userAudience} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative bg-background scroll-smooth">
          <div className={tokens.page.content}>
            {children}
          </div>
          
          {/* Footer inside content area for scroll behavior */}
          <footer className="mt-auto border-t border-border/40 py-12 px-8 bg-muted/5">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                © {new Date().getFullYear()} Breslov Academy. Spreading the light of Rebbe Nachman.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link to="/terms" className="hover:underline underline-offset-4 hover:text-foreground">Terms</Link>
                <Link to="/privacy" className="hover:underline underline-offset-4 hover:text-foreground">Privacy</Link>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold tracking-tight">Navigation</span>
              <IconButton label="Close" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </IconButton>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <PortalSidebar 
                currentPageName={currentPageName} 
                audience={userAudience}
                onNavigate={() => setMobileMenuOpen(false)} 
              />
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={() => base44.auth.logout()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
