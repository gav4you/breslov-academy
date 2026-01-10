import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getAllIntegrations } from '@/components/config/integrations';
import { tokens, cx } from '@/components/theme/tokens';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ArrowRight } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import GlassCard from '@/components/ui/GlassCard';

export default function IntegrationsMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const integrations = getAllIntegrations();
  const categories = ['All', ...new Set(integrations.map(i => i.category))];

  const filteredIntegrations = integrations.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageShell 
      title="App Marketplace" 
      subtitle="Supercharge your school with powerful integrations and tools."
    >
      <div className={tokens.layout.sectionGap}>
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search apps..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((app) => (
            <Link key={app.id} to={createPageUrl(`IntegrationDetail?id=${app.id}`)} className="group block h-full">
              <GlassCard className="h-full hover:border-primary/50 transition-all duration-200">
                <div className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cx("w-12 h-12 rounded-xl flex items-center justify-center", app.bg)}>
                      <app.icon className={cx("w-6 h-6", app.color)} />
                    </div>
                    {app.status === 'connected' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Connected
                      </Badge>
                    )}
                    {app.status === 'beta' && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        Beta
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{app.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {app.description}
                    </p>
                    <Badge variant="outline" className="text-xs font-normal">
                      {app.category}
                    </Badge>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    View Details <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No apps found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
