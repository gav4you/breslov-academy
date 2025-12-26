import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ParshahWeekly() {
  const [parshah, setParshah] = useState(null);

  useEffect(() => {
    // In production, use HebrewCalendar API or HebCal
    // This is sample data
    const getCurrentParshah = () => {
      const parshahs = [
        {
          name: 'Bereishit',
          nameHebrew: 'בראשית',
          book: 'Genesis',
          bookHebrew: 'בראשית',
          summary: 'In the beginning, God creates the heavens, the earth, and all living things. The first man and woman, Adam and Eve, are placed in the Garden of Eden.',
          keyThemes: ['Creation', 'Free Will', 'Divine Image', 'Purpose of Life'],
          bresloverInsight: 'Rebbe Nachman teaches that just as God created the world through speech, so too do our words have creative power. We must guard our speech and use it to build rather than destroy.',
          verses: [
            { reference: 'Genesis 1:1', text: 'In the beginning God created the heaven and the earth' },
            { reference: 'Genesis 1:27', text: 'So God created man in His own image' }
          ]
        }
      ];

      // In production, calculate based on Hebrew calendar
      const currentDate = new Date();
      const weekNumber = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 1)) / 604800000);
      setParshah(parshahs[weekNumber % parshahs.length]);
    };

    getCurrentParshah();
  }, []);

  if (!parshah) return null;

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem] overflow-hidden">
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full blur-[100px]" />
        </div>
        
        <CardHeader className="relative p-0">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <Calendar className="w-4 h-4 text-amber-300" />
            <span className="text-amber-200 font-bold text-sm">This Week's Torah Portion</span>
          </div>
          
          <CardTitle className="space-y-3">
            <div className="text-5xl font-black text-white">Parshat {parshah.name}</div>
            <div className="text-4xl text-amber-300 font-serif" dir="rtl">פרשת {parshah.nameHebrew}</div>
            <div className="flex items-center gap-3 text-slate-300">
              <Badge className="bg-white/10 text-white border-white/20">
                {parshah.book}
              </Badge>
              <Badge className="bg-white/10 text-white border-white/20" dir="rtl">
                {parshah.bookHebrew}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </div>

      <CardContent className="p-8 space-y-8">
        {/* Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h4 className="font-black text-slate-900 text-xl">Summary</h4>
          </div>
          <p className="text-slate-700 leading-relaxed font-serif text-lg">
            {parshah.summary}
          </p>
        </div>

        {/* Key Themes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-600" />
            <h4 className="font-black text-slate-900 text-xl">Key Themes</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {parshah.keyThemes.map((theme, idx) => (
              <Badge 
                key={idx}
                className="bg-purple-100 text-purple-800 font-semibold px-3 py-1"
              >
                {theme}
              </Badge>
            ))}
          </div>
        </div>

        {/* Breslov Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-amber-500 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-black text-slate-900 text-xl mt-1">Breslov Teaching</h4>
          </div>
          <p className="text-slate-800 leading-relaxed font-serif text-lg italic">
            "{parshah.bresloverInsight}"
          </p>
        </motion.div>

        {/* Key Verses */}
        <div className="space-y-3">
          <h4 className="font-black text-slate-900 text-xl">Key Verses</h4>
          <div className="space-y-3">
            {parshah.verses.map((verse, idx) => (
              <div 
                key={idx}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="text-blue-700 font-bold text-sm mb-2">{verse.reference}</div>
                <p className="text-slate-800 font-serif italic">{verse.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Button */}
        <Link to={createPageUrl('TorahStudy')}>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-6 rounded-2xl text-lg hover:shadow-2xl transition-all">
            <BookOpen className="w-5 h-5 mr-3" />
            Study This Week's Parshah
            <Sparkles className="w-5 h-5 ml-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}