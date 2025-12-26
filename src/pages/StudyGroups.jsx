import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MessageCircle, Plus, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyGroups() {
  const [user, setUser] = useState(null);
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

  const { data: groups = [] } = useQuery({
    queryKey: ['study-groups'],
    queryFn: () => base44.entities.StudyGroup.list('-created_date')
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId) => {
      const group = groups.find(g => g.id === groupId);
      await base44.entities.StudyGroup.update(groupId, {
        member_count: (group.member_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['study-groups']);
    }
  });

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-black text-slate-900 mb-2">Study Groups</h1>
            <p className="text-xl text-slate-600">Join or create a study group</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl">
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, idx) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-lg transition-all rounded-[2rem] h-full">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-900 mb-2">{group.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{group.description}</p>
                    </div>
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.member_count || 0} members
                    </Badge>
                    {group.topic && (
                      <Badge className="bg-purple-100 text-purple-800">
                        {group.topic}
                      </Badge>
                    )}
                  </div>

                  {group.schedule && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{group.schedule}</span>
                    </div>
                  )}

                  <Button
                    onClick={() => joinGroupMutation.mutate(group.id)}
                    disabled={joinGroupMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}