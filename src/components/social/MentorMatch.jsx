import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorMatch() {
  const mentors = [
    { name: 'Rabbi Moshe Klein', specialty: 'Talmud', students: 15, rating: 4.9, avatar: 'M' },
    { name: 'Sarah Cohen', specialty: 'Kabbalah', students: 12, rating: 5.0, avatar: 'S' },
    { name: 'David Levy', specialty: 'Halacha', students: 20, rating: 4.8, avatar: 'D' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-600" />
          Find a Mentor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mentors.map((mentor, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {mentor.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900">{mentor.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800">{mentor.specialty}</Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-900">{mentor.rating}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600">
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  {mentor.students} students
                </div>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
                Connect
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}