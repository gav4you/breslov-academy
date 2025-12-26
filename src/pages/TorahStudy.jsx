import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollText, BookOpen, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TorahStudy() {
  const [user, setUser] = useState(null);

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

  const { data: parshiot = [] } = useQuery({
    queryKey: ['parshiot'],
    queryFn: () => base44.entities.TorahPortion.list()
  });

  const books = [
    { name: 'Bereishit', hebrew: 'בראשית', color: 'from-green-500 to-green-600', icon: '🌍' },
    { name: 'Shemot', hebrew: 'שמות', color: 'from-blue-500 to-blue-600', icon: '⚡' },
    { name: 'Vayikra', hebrew: 'ויקרא', color: 'from-purple-500 to-purple-600', icon: '🔥' },
    { name: 'Bamidbar', hebrew: 'במדבר', color: 'from-amber-500 to-amber-600', icon: '🏜️' },
    { name: 'Devarim', hebrew: 'דברים', color: 'from-red-500 to-red-600', icon: '📜' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <ScrollText className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Torah Study</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Weekly Parsha, Commentaries & Deep Textual Analysis
          </p>
        </motion.div>

        {/* Five Books of Torah */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Chamisha Chumshei Torah</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {books.map((book, idx) => (
              <motion.div
                key={book.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
              >
                <Card className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all group h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-r ${book.color} rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                      {book.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{book.name}</h3>
                    <p className="text-2xl text-amber-700 font-bold mb-3" dir="rtl">{book.hebrew}</p>
                    <Button variant="outline" className="w-full font-semibold">Study</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weekly Parsha */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Calendar className="w-6 h-6 text-blue-600" />
                <span>This Week's Parsha</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parshiot.length > 0 ? (
                <div className="space-y-4">
                  {parshiot.slice(0, 5).map((parsha) => (
                    <div key={parsha.id} className="p-5 bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border-l-4 border-blue-600">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-2xl text-slate-900">{parsha.parsha_name}</h3>
                          <p className="text-amber-700 font-bold text-xl" dir="rtl">{parsha.parsha_hebrew}</p>
                        </div>
                        <Badge className="bg-slate-900 text-white font-semibold">{parsha.book}</Badge>
                      </div>
                      {parsha.key_themes && parsha.key_themes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {parsha.key_themes.map((theme, i) => (
                            <Badge key={i} variant="outline" className="border-slate-300">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Torah portions coming soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}