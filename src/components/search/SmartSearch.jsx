import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Sparkles, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SmartSearch() {
  const [query, setQuery] = useState('');

  const results = {
    all: 156,
    courses: 12,
    lessons: 45,
    discussions: 67,
    resources: 32
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="AI-powered search..."
              className="pl-12 pr-12 rounded-2xl h-14 text-lg"
            />
          </div>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {query && (
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-5 bg-white rounded-xl">
              <TabsTrigger value="all">
                All ({results.all})
              </TabsTrigger>
              <TabsTrigger value="courses">
                Courses ({results.courses})
              </TabsTrigger>
              <TabsTrigger value="lessons">
                Lessons ({results.lessons})
              </TabsTrigger>
              <TabsTrigger value="discussions">
                Discuss ({results.discussions})
              </TabsTrigger>
              <TabsTrigger value="resources">
                Files ({results.resources})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="text-sm text-slate-600">
                Found {results.all} results for "{query}"
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}