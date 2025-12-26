import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KabbalahStudy() {
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

  const { data: zoharSections = [] } = useQuery({
    queryKey: ['zohar'],
    queryFn: () => base44.entities.ZoharSection.list('-created_date', 10)
  });

  const { data: kabbalahConcepts = [] } = useQuery({
    queryKey: ['kabbalah'],
    queryFn: () => base44.entities.KabbalahConcept.list()
  });

  const categories = [
    { name: 'Sefirot', desc: 'Divine Emanations', icon: '✨', color: 'from-purple-500 to-purple-600' },
    { name: 'Olamot', desc: 'Spiritual Worlds', icon: '🌌', color: 'from-blue-500 to-blue-600' },
    { name: 'Partzufim', desc: 'Divine Configurations', icon: '👑', color: 'from-amber-500 to-amber-600' },
    { name: 'Neshama', desc: 'Soul Levels', icon: '🕊️', color: 'from-cyan-500 to-cyan-600' }
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
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          </div>
          
          <div className="relative p-10 md:p-14">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-xl animate-pulse">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white">Kabbalah & Zohar</h1>
            </div>
            <p className="text-purple-200 text-xl font-light leading-relaxed">
              Unlock the mystical wisdom of Torah's hidden dimensions
            </p>
          </div>
        </motion.div>

        {/* Kabbalah Categories */}
        <div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-1.5 w-16 bg-gradient-to-r from-purple-500 to-transparent rounded-full" />
            <h2 className="text-4xl font-black text-slate-900">Mystical Concepts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}


              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              >
                <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-xl transition-all duration-500 group h-full rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-10 space-y-6">
                    <div className={`w-24 h-24 bg-gradient-to-br ${cat.color} rounded-[2rem] flex items-center justify-center text-6xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{cat.name}</h3>
                      <p className="text-slate-600 font-semibold leading-relaxed">{cat.desc}</p>
                    </div>
                    <Button className={`w-full bg-gradient-to-r ${cat.color} text-white font-bold py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300`}>Explore</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Zohar Study */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-0 premium-shadow rounded-[2rem]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Star className="w-6 h-6 text-purple-600" />
                <span>Zohar Study Sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {zoharSections.length > 0 ? (
                <div className="space-y-4">
                  {zoharSections.map((section) => (
                    <div key={section.id} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                      <h3 className="font-bold text-lg text-slate-900">{section.title}</h3>
                      <p className="text-amber-700 font-semibold" dir="rtl">{section.title_hebrew}</p>
                      <p className="text-sm text-slate-600 mt-2">Parsha: {section.parsha}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Zohar content coming soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}