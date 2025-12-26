import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, BookOpen, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyPartnerMatcher({ userEmail, currentCourse }) {
  const [matches, setMatches] = useState([
    {
      name: 'Moshe Cohen',
      level: 'Scholar',
      timezone: 'GMT+2 (Jerusalem)',
      courses: ['Likutey Moharan', 'Talmud'],
      matchScore: 95,
      availability: 'Evenings',
      languages: ['English', 'Hebrew']
    },
    {
      name: 'David Levy',
      level: 'Student',
      timezone: 'GMT-5 (New York)',
      courses: ['Torah', 'Halacha'],
      matchScore: 87,
      availability: 'Mornings',
      languages: ['English', 'Yiddish']
    },
    {
      name: 'Yosef Katz',
      level: 'Sage',
      timezone: 'GMT+0 (London)',
      courses: ['Kabbalah', 'Likutey Moharan'],
      matchScore: 92,
      availability: 'Flexible',
      languages: ['English', 'Hebrew', 'French']
    }
  ]);

  const sendRequest = (partnerName) => {
    console.log('Sending chavruta request to:', partnerName);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <div>Find Your Chavruta</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">מצא חברותא</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-900 font-serif leading-relaxed">
            "Whoever learns Torah with a study partner, their Torah endures" - Pirkei Avot
          </div>
        </div>

        <div className="space-y-3">
          {matches.map((match, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{match.name}</h4>
                  <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">
                    {match.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-bold text-green-900">{match.matchScore}% Match</span>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  <span>{match.timezone} • {match.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{match.courses.join(', ')}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.languages.map((lang, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => sendRequest(match.name)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Request Chavruta
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}