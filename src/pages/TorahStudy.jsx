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
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] premium-shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-green-900 to-slate-900" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-20 w-96 h-96 bg-green-500 rounded-full blur-[120px]" />
          </div>
          <div className="relative p-10 md:p-14">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-xl">
                <ScrollText className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white">Torah Study</h1>
            </div>
            <p className="text-slate-200 text-xl font-light leading-relaxed">
              Weekly Parsha, Commentaries & Deep Textual Analysis
            </p>
          </div>
        </motion.div>

        {/* Five Books of Torah */}
        <div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-1.5 w-16 bg-gradient-to-r from-green-500 to-transparent rounded-full" />
            <h2 className="text-4xl font-black text-slate-900">Chamisha Chumshei Torah</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {books.map((book, idx) => (
              <motion.div
                key={book.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}


              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              >
                <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-xl transition-all duration-500 group h-full rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-10 text-center space-y-6">
                    <div className={`w-28 h-28 bg-gradient-to-br ${book.color} rounded-[2rem] flex items-center justify-center text-6xl mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
                      {book.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{book.name}</h3>
                      <p className="text-4xl text-amber-700 font-black mb-8" dir="rtl">{book.hebrew}</p>
                    </div>
                    <Button className={`w-full bg-gradient-to-r ${book.color} text-white font-bold py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 btn-premium group`}>
                      <span className="flex items-center justify-center gap-2">
                        Begin Study
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Button>
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
          <Card className="glass-effect border-0 premium-shadow rounded-[2rem]">
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