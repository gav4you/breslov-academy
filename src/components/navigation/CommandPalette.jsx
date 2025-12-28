import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FEATURES } from '../config/features';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command } from 'lucide-react';

export default function CommandPalette({ audience = 'student' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const allFeatures = Object.values(FEATURES).filter(f => 
    f.audiences.includes(audience) || f.audiences.includes('public')
  );

  const filteredFeatures = allFeatures.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase()) ||
    f.area.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (feature) => {
    navigate(createPageUrl(feature.key));
    setOpen(false);
    setSearch('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center text-sm text-slate-400 hover:text-slate-600 px-3 py-1.5 border border-slate-300 rounded-md"
      >
        <Command className="w-3 h-3 mr-2" />
        <span>Search...</span>
        <kbd className="ml-auto text-xs bg-slate-100 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Command Palette</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search features..."
              autoFocus
            />
            
            <div className="max-h-96 overflow-y-auto space-y-1">
              {filteredFeatures.map((feature) => (
                <button
                  key={feature.key}
                  onClick={() => handleSelect(feature)}
                  className="w-full text-left p-3 hover:bg-slate-50 rounded-lg flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium">{feature.label}</div>
                    <div className="text-xs text-slate-500">{feature.area}</div>
                  </div>
                  <Badge variant="outline" className="opacity-0 group-hover:opacity-100">
                    {feature.route}
                  </Badge>
                </button>
              ))}
              
              {filteredFeatures.length === 0 && (
                <p className="text-center text-slate-500 py-8">No features found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}