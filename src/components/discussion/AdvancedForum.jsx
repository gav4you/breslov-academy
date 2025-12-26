import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Pin, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdvancedForum() {
  const [filterTag, setFilterTag] = useState('all');

  const threads = [
    {
      title: 'Deep dive into Azamra concept',
      author: 'Moshe L.',
      replies: 24,
      views: 156,
      lastActivity: new Date(),
      tags: ['Azamra', 'Likutey Moharan'],
      isPinned: true,
      hasAnswer: true
    },
    {
      title: 'Hebrew pronunciation tips',
      author: 'Sarah M.',
      replies: 12,
      views: 89,
      lastActivity: new Date(Date.now() - 3600000),
      tags: ['Hebrew', 'Language']
    }
  ];

  const tags = ['Azamra', 'Hebrew', 'Talmud', 'Prayer', 'Chassidus'];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Discussion Forum
          </div>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl">
            New Thread
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search discussions..."
          className="rounded-xl"
        />

        <div className="flex gap-2 flex-wrap">
          <Badge
            onClick={() => setFilterTag('all')}
            className={filterTag === 'all' ? 'bg-blue-600 text-white cursor-pointer' : 'bg-slate-200 text-slate-700 cursor-pointer'}
          >
            All
          </Badge>
          {tags.map((tag, idx) => (
            <Badge
              key={idx}
              onClick={() => setFilterTag(tag)}
              className={filterTag === tag ? 'bg-blue-600 text-white cursor-pointer' : 'bg-slate-200 text-slate-700 cursor-pointer'}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="recent">
          <TabsList className="grid grid-cols-3 bg-white rounded-xl">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="w-4 h-4 mr-1" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-2 mt-4">
            {threads.map((thread, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  {thread.isPinned && <Pin className="w-4 h-4 text-amber-600" />}
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 mb-1">{thread.title}</div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {thread.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>{thread.author}</span>
                      <span>{thread.replies} replies</span>
                      <span>{thread.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}