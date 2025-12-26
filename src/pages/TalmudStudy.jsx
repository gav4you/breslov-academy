import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Flame, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function TalmudStudy() {
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

  const { data: dafYomiProgress } = useQuery({
    queryKey: ['dafYomi', user?.email],
    queryFn: async () => {
      const progress = await base44.entities.DafYomiProgress.filter({ user_email: user.email });
      return progress[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: masechtot = [] } = useQuery({
    queryKey: ['masechtot'],
    queryFn: () => base44.entities.TalmudMasechta.list()
  });

  const sdarim = [
    { name: 'Zeraim', icon: '🌾', color: 'from-green-500 to-green-600' },
    { name: 'Moed', icon: '🕯️', color: 'from-blue-500 to-blue-600' },
    { name: 'Nashim', icon: '💍', color: 'from-pink-500 to-pink-600' },
    { name: 'Nezikin', icon: '⚖️', color: 'from-purple-500 to-purple-600' },
    { name: 'Kodashim', icon: '🏛️', color: 'from-amber-500 to-amber-600' },
    { name: 'Taharot', icon: '💧', color: 'from-cyan-500 to-cyan-600' }
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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
          </div>
          <div className="relative p-10 md:p-14">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white">Talmud Study</h1>
            </div>
            <p className="text-slate-200 text-xl font-light leading-relaxed">
              Explore the depths of Torah wisdom through systematic Gemara study
            </p>
          </div>
        </motion.div>

        {/* Daf Yomi Progress */}
        {dafYomiProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-effect border-0 premium-shadow rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <span>Daf Yomi Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="text-slate-600 font-medium">Current Daf</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      {dafYomiProgress.current_masechta} {dafYomiProgress.current_daf}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: -1 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-slate-600 font-medium">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-green-900">
                      {dafYomiProgress.total_dapim_completed}
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Flame className="w-5 h-5 text-amber-600 animate-pulse" />
                      <span className="text-slate-600 font-medium">Streak</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-900">
                      {dafYomiProgress.current_streak} days
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Six Orders */}
        <div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
            <h2 className="text-4xl font-black text-slate-900">Six Orders of Mishnah</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sdarim.map((seder, idx) => {
              const masechtoInSeder = masechtot.filter(m => m.seder === seder.name);
              
              return (
                <motion.div
                  key={seder.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}

                  whileHover={{ y: -8 }}
                >
                  <Card className="glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all duration-500 group rounded-[2rem]">
                    <CardHeader>
                      <div className={`w-20 h-20 bg-gradient-to-br ${seder.color} rounded-3xl flex items-center justify-center text-5xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl`}>
                        {seder.icon}
                      </div>
                      <CardTitle className="text-3xl font-black">Seder {seder.name}</CardTitle>
                      <p className="text-slate-600 font-semibold">{masechtoInSeder.length} Masechtot</p>
                    </CardHeader>
                    <CardContent>
                      <Button className={`w-full bg-gradient-to-r ${seder.color} text-white font-bold shadow-lg hover:shadow-xl transition-all`}>
                        Explore {seder.name}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}