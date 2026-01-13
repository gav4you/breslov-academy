import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURES } from '@/components/config/features';
import { ENTITY_REGISTRY } from '@/components/api/entityRegistry';
import { useSession } from '@/components/hooks/useSession';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Search, Database } from 'lucide-react';

export default function CommandPalette() {
  const navigate = useNavigate();
  const { audience, activeSchool } = useSession();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  const normalizedAudience = (audience || 'student').toLowerCase();
  const isAdmin = normalizedAudience === 'admin' || normalizedAudience === 'teacher';

  // 1. Core Features (Pages)
  const features = useMemo(() => {
    const all = Object.values(FEATURES);
    const filtered = all.filter((f) => {
      if (!f) return false;
      if (f.key === 'Vault') return true;
      if (f.vaultOnly && normalizedAudience !== 'admin') return false;
      if (!Array.isArray(f.audiences) || f.audiences.length === 0) return true;
      return f.audiences.includes(normalizedAudience) || f.audiences.includes('all');
    });
    return filtered.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }, [normalizedAudience]);

  // 2. Admin Database Entities (The "Hidden" 700+ Features)
  const adminEntities = useMemo(() => {
    if (!isAdmin) return [];
    return Object.entries(ENTITY_REGISTRY).map(([key, def]) => ({
      key: `entity:${key}`,
      label: `Manage ${def.label}s`,
      route: `/student/${key}`, // Maps to UniversalPage via PortalPageResolver
      icon: Database,
      area: 'Database'
    }));
  }, [isAdmin]);

  const onSelect = (fn) => {
    setOpen(false);
    setQuery('');
    fn();
  };

  return (
    <>
      <button type="button" className="sr-only" onClick={() => setOpen(true)} />

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search everything (Ctrl+K)..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Applications">
            {features.map((feature) => (
              <CommandItem key={feature.key} value={`${feature.label} ${feature.area}`} onSelect={() => onSelect(() => navigate(feature.route))}>
                <Search className="mr-2 h-4 w-4" />
                <span>{feature.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{feature.area}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          {isAdmin && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Database Management">
                {adminEntities.map((entity) => (
                  <CommandItem key={entity.key} value={entity.label} onSelect={() => onSelect(() => navigate(entity.route))}>
                    <entity.icon className="mr-2 h-4 w-4" />
                    <span>{entity.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}