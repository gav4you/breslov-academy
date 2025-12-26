import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ThumbsUp, Pin, TrendingUp, Plus, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

export default function DiscussionBoard({ courseId }) {
  const [searchTerm, setSearchTerm] = useState('');

  const discussions = [
    {
      id: 1,
      title: 'Understanding the deeper meaning of Azamra',
      author: 'Moshe L.',
      category: 'Torah Insights',
      replies: 12,
      likes: 24,
      views: 156,
      isPinned: true,
      lastActivity: new Date(Date.now() - 3600000),
      tags: ['Azamra', 'Judging Favorably', 'Likutey Moharan']
    },
    {
      id: 2,
      title: 'How to apply Hitbodedut in modern life?',
      author: 'David K.',
      category: 'Practical Application',
      replies: 8,
      likes: 18,
      views: 89,
      isPinned: false,
      lastActivity: new Date(Date.now() - 7200000),
      tags: ['Hitbodedut', 'Prayer', 'Daily Practice']
    },
    {
      id: 3,
      title: 'Question about Torah 65 - The Evil Inclination',
      author: 'Sarah M.',
      category: 'Questions',
      replies: 15,
      likes: 31,
      views: 203,
      isPinned: false,
      isAnswered: true,
      lastActivity: new Date(Date.now() - 10800000),
      tags: ['Yetzer Hara', 'Spiritual Growth']
    }
  ];

  const categories = ['All', 'Torah Insights', 'Questions', 'Practical Application', 'Study Tips'];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <div>
              <div>Discussion Board</div>
              <div className="text-sm text-slate-600 font-normal" dir="rtl">פורום דיונים</div>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            New Topic
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search discussions..."
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="cursor-pointer hover:bg-blue-50"
            >
              {cat}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList className="grid grid-cols-3 bg-white rounded-xl">
            <TabsTrigger value="recent" className="rounded-lg">
              Recent
            </TabsTrigger>
            <TabsTrigger value="trending" className="rounded-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="unanswered" className="rounded-lg">
              Unanswered
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-3">
            {discussions.map((discussion, idx) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  {discussion.isPinned && (
                    <Pin className="w-4 h-4 text-amber-600" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{discussion.title}</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {discussion.category}
                      </Badge>
                      {discussion.isAnswered && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Answered
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {discussion.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span className="font-semibold">{discussion.author}</span>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {discussion.replies}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {discussion.likes}
                      </div>
                      <span>{new Date(discussion.lastActivity).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="trending">
            <div className="text-center py-8 text-slate-500">
              Trending discussions coming soon
            </div>
          </TabsContent>

          <TabsContent value="unanswered">
            <div className="text-center py-8 text-slate-500">
              Unanswered questions coming soon
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}