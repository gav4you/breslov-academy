import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyBuddyMatcher() {
  const matches = [
    { name: 'Rachel Klein', level: 'Intermediate', interests: ['Talmud', 'Halacha'], compatibility: 95 },
    { name: 'Moshe Ben', level: 'Advanced', interests: ['Kabbalah', 'Philosophy'], compatibility: 88 },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Study Buddy Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.map((match, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-xl shadow-md"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {match.name[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{match.name}</div>
                  <div className="text-xs text-slate-600">{match.level} Level</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-green-600">{match.compatibility}%</div>
                <div className="text-xs text-slate-600">Match</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {match.interests.map((interest) => (
                <Badge key={interest} className="bg-blue-100 text-blue-800">
                  {interest}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
                <UserPlus className="w-4 h-4 mr-2" />
                Connect
              </Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-xl">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}