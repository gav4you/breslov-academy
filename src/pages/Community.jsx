import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Community() {
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50)
  });

  const createPostMutation = useMutation({
    mutationFn: (content) => base44.entities.Post.create({
      user_email: user.email,
      author_name: user.full_name,
      content: content,
      likes_count: 0,
      comments_count: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      setNewPost('');
    }
  });

  const likePostMutation = useMutation({
    mutationFn: (post) => base44.entities.Post.update(post.id, {
      likes_count: (post.likes_count || 0) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    }
  });

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2">Community Feed</h1>
          <p className="text-slate-600 text-lg">Share insights and connect with fellow students</p>
        </motion.div>

        {/* Create Post */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-6">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts, insights, or questions..."
              className="mb-4 min-h-[100px] rounded-xl"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => createPostMutation.mutate(newPost)}
                disabled={!newPost.trim() || createPostMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
              >
                <Send className="w-4 h-4 mr-2" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <AnimatePresence>
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all rounded-2xl">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {post.author_name?.[0] || 'S'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{post.author_name || 'Student'}</div>
                      <div className="text-xs text-slate-600">
                        {new Date(post.created_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-6 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => likePostMutation.mutate(post)}
                      className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.comments_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-600 hover:text-green-500 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}