import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ForumBoard({ topics }) {
  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                <div className="flex flex-col items-center text-slate-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs font-bold">{topic.votes}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition-colors">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-normal">
                    {topic.category}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(topic.timestamp))} ago
                  </span>
                  <span className="text-xs text-slate-400">by {topic.author}</span>
                </div>
              </div>

              <div className="flex flex-col items-end justify-center gap-2 text-slate-400 text-xs">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {topic.replies}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {topic.views}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
