import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Video, MessageCircle, Award, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentorshipProgram() {
  const mentors = [
    {
      name: 'Rabbi Cohen',
      title: 'Master of Likutey Moharan',
      specialty: 'Chassidus & Kabbalah',
      students: 8,
      availability: 'Sundays & Wednesdays',
      bio: '20+ years teaching Breslov Torah',
      rating: 5.0,
      sessions: 127
    },
    {
      name: 'Rabbi Levy',
      title: 'Talmud Scholar',
      specialty: 'Gemara & Halacha',
      students: 12,
      availability: 'Evenings',
      bio: 'Daf Yomi expert, published author',
      rating: 4.9,
      sessions: 203
    },
    {
      name: 'Rebbetzin Katz',
      title: 'Torah Language Expert',
      specialty: 'Hebrew & Aramaic',
      students: 6,
      availability: 'Flexible',
      bio: 'Specializes in Biblical Hebrew pedagogy',
      rating: 5.0,
      sessions: 89
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Users className="w-5 h-5 text-purple-600" />
          <div>
            <div>Mentorship Program</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">תוכנית חונכות</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-sm text-purple-900 font-serif leading-relaxed">
            "Just as my teachers illuminated my path, so too should I light the way for others" - Breslov tradition
          </div>
        </div>

        <div className="space-y-3">
          {mentors.map((mentor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-purple-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-black text-slate-900 text-lg">{mentor.name}</div>
                  <div className="text-sm text-purple-700 font-serif mb-1">{mentor.title}</div>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    {mentor.specialty}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-600 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < mentor.rating ? 'fill-amber-600' : ''}`} />
                    ))}
                  </div>
                  <div className="text-xs text-slate-600">{mentor.sessions} sessions</div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-3">{mentor.bio}</p>

              <div className="flex items-center gap-4 mb-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {mentor.students} students
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {mentor.availability}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="rounded-lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg">
                  <Video className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}