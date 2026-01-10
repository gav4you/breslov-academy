import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getNavGroupsForAudience } from '@/components/config/features';
import { useSession } from '@/components/hooks/useSession';
import { Home, BookOpen, GraduationCap, Shield, Archive } from 'lucide-react';
import { cx } from '@/components/theme/tokens';

function IconForArea({ area }) {
  const A = (area || '').toLowerCase();
  if (A === 'core') return <Home className="h-4 w-4" />;
  if (A === 'teach') return <GraduationCap className="h-4 w-4" />;
  if (A === 'admin') return <Shield className="h-4 w-4" />;
  return <BookOpen className="h-4 w-4" />;
}

export default function PortalSidebar({ currentPageName, audience: propAudience, onNavigate }) {
  const { audience, role } = useSession();
  const a = (propAudience || audience || (role === 'ADMIN' ? 'admin' : 'student')).toLowerCase();

  const navGroups = useMemo(() => getNavGroupsForAudience(a), [a]);

  return (
    <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-auto p-2">
      <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
        Navigation
      </div>

      <div className="space-y-6">
        {navGroups.map((g) => (
          <div key={g.key || g.label}>
            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground">
              <IconForArea area={g.key} />
              <span>{g.label}</span>
            </div>

            <div className="mt-1 space-y-0.5">
              {(g.features || []).map((f) => {
                const active = String(currentPageName || '').toLowerCase() === String(f.key || '').toLowerCase();
                return (
                  <Link
                    key={f.key}
                    to={createPageUrl(f.key)}
                    onClick={onNavigate}
                    className={cx(
                      "block rounded-md px-3 py-2 text-sm transition-colors duration-200",
                      active 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {f.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-border/50">
          <Link
            to={createPageUrl('Vault')}
            onClick={onNavigate}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Archive className="h-4 w-4" />
            Vault
          </Link>
        </div>
      </div>
    </div>
  );
}
