import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, BookOpen, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserProfile({ user }) {
  const stats = [
    { label: 'Courses', value: 12, icon: BookOpen },
    { label: 'Streak', value: '23 days', icon: Calendar },
    { label: 'XP', value: '5,420', icon: Star },
    { label: 'Badges', value: 8, icon: Award },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center text-6xl font-black text-white shadow-2xl">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full p-2 shadow-xl">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900">{user?.full_name || 'Torah Student'}</h2>
            <p className="text-slate-600 font-medium">Level 15 Scholar</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-amber-100 text-amber-800">Torah Master</Badge>
            <Badge className="bg-blue-100 text-blue-800">Talmud Scholar</Badge>
            <Badge className="bg-purple-100 text-purple-800">7-Day Streak</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white rounded-xl shadow-md"
                >
                  <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>

          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl btn-premium">
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}