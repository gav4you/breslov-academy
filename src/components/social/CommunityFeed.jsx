import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CommunityFeed() {
  const [posts] = useState([
    {
      author: 'Sarah Cohen',
      avatar: 'S',
      content: 'Just completed my first month of daily Daf Yomi! The journey has been incredible.',
      likes: 34,
      comments: 8,
      time: '2 hours ago'
    },
    {
      author: 'David Levy',
      avatar: 'D',
      content: 'Beautiful shiur on Hitbodedut today. The practice is transforming my life.',
      likes: 28,
      comments: 5,
      time: '5 hours ago'
    },
  ]);

  return (
    <div className="space-y-4">
      {posts.map((post, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all rounded-[2rem]">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {post.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{post.author}</div>
                  <div className="text-xs text-slate-500">{post.time}</div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-slate-700 mb-4 leading-relaxed">{post.content}</p>

              <div className="flex items-center gap-4 text-slate-600">
                <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}