import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle, Clock, Crown, ArrowRight, Star, Flame, Trophy, Sparkles, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('free');

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

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: shiurim = [] } = useQuery({
    queryKey: ['shiurim'],
    queryFn: () => base44.entities.ShiurRecording.list('-created_date', 6)
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: studyStreak } = useQuery({
    queryKey: ['streak', user?.email],
    queryFn: async () => {
      const streaks = await base44.entities.StudyStreak.filter({ user_email: user.email });
      return streaks[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: userLevel } = useQuery({
    queryKey: ['userLevel', user?.email],
    queryFn: async () => {
      const levels = await base44.entities.UserLevel.filter({ user_email: user.email });
      return levels[0] || { current_level: 'Initiate', experience_points: 0, lessons_completed: 0 };
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (subscription?.tier) {
      setUserTier(subscription.tier);
    }
  }, [subscription]);

  const completedLessons = userProgress?.filter(p => p.completed).length || 0;

  const tierBenefits = {
    free: { name: 'Free', color: 'text-slate-600', icon: Star },
    premium: { name: 'Premium', color: 'text-blue-600', icon: Crown },
    elite: { name: 'Elite', color: 'text-amber-600', icon: Crown }
  };

  const currentTier = tierBenefits[userTier];

  const dailyWisdom = [
    {
      text: "It is a great mitzvah to always be happy.",
      source: "Likutey Moharan II:24"
    },
    {
      text: "All the world is a very narrow bridge, but the essential thing is not to fear at all.",
      source: "Likutey Moharan II:48"
    },
    {
      text: "If you believe that you can damage, then believe that you can fix.",
      source: "Likutey Moharan II:112"
    },
    {
      text: "The whole world was created for my sake, therefore I must constantly examine myself.",
      source: "Based on Likutey Moharan"
    },
    {
      text: "Prayer is the highest form of wisdom.",
      source: "Likutey Moharan I:9"
    }
  ];

  const todayWisdom = dailyWisdom[new Date().getDay() % dailyWisdom.length];

  const levelInfo = {
    Initiate: { next: 'Student', pointsNeeded: 100, color: 'from-slate-400 to-slate-500' },
    Student: { next: 'Scholar', pointsNeeded: 500, color: 'from-blue-400 to-blue-500' },
    Scholar: { next: 'Sage', pointsNeeded: 1500, color: 'from-purple-400 to-purple-500' },
    Sage: { next: 'Master', pointsNeeded: 3000, color: 'from-amber-400 to-amber-500' },
    Master: { next: null, pointsNeeded: null, color: 'from-amber-500 to-amber-600' }
  };

  const currentLevelInfo = levelInfo[userLevel?.current_level || 'Initiate'];
  const progressToNext = currentLevelInfo.pointsNeeded 
    ? ((userLevel?.experience_points || 0) / currentLevelInfo.pointsNeeded) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-16 px-4 py-8 md:py-12">
        {/* Welcome Header - Oxford Inspired */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[3rem] premium-shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400 rounded-full blur-[140px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-400 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/20" />
          
          <div className="relative p-10 md:p-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
              <div className="flex-1 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <div className="inline-flex items-center space-x-3 mb-6">
                    <div className="p-2.5 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-xl shadow-xl">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-amber-300 font-semibold text-sm tracking-wider uppercase">Breslov Academy</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none mb-4">
                    Shalom,<br />
                    <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-transparent bg-clip-text">
                      {user?.full_name?.split(' ')[0] || 'Student'}
                    </span>
                  </h1>
                  <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
                    Continue your scholarly journey through the profound wisdom of Rebbe Nachman of Breslov
                  </p>
                </motion.div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.08, y: -4 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-5 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                        <Flame className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">{studyStreak?.current_streak || 0}</div>
                        <div className="text-slate-300 text-xs">Day Streak</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.08, y: -4 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-5 py-3 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-lg">{completedLessons}</div>
                        <div className="text-slate-300 text-xs">Lessons</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.08, y: -4, rotate: 2 }}
                    className={`backdrop-blur-xl bg-gradient-to-r ${currentLevelInfo.color} border border-white/20 rounded-2xl px-5 py-3 shadow-xl hover:shadow-2xl transition-all duration-300`}
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-white" />
                      <div className="text-white font-bold">{userLevel?.current_level || 'Initiate'}</div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Level Progress Card */}
              {currentLevelInfo.next && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 min-w-[280px] shadow-2xl"
                >
                  <div className="text-slate-300 text-xs mb-2 font-semibold uppercase tracking-widest">Next Rank</div>
                  <div className="text-white text-2xl font-black mb-6">{currentLevelInfo.next}</div>
                  <div className="relative h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 1.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full bg-gradient-to-r ${currentLevelInfo.color} relative`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{userLevel?.experience_points || 0} XP</span>
                    <span className="text-white font-bold">{currentLevelInfo.pointsNeeded} XP</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Daily Wisdom - Academic Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Card className="relative overflow-hidden border border-amber-100/50 premium-shadow-xl rounded-[3rem]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-blue-50/80 backdrop-blur-3xl" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200 rounded-full blur-[140px] opacity-20" />
            
            <CardHeader className="relative pb-8 pt-10">
              <div className="inline-flex items-center space-x-3 bg-amber-100/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Star className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800 font-bold text-sm">Daily Wisdom</span>
              </div>
            </CardHeader>
            <CardContent className="relative pb-12 px-10">
              <blockquote className="space-y-8">
                <p className="text-slate-800 text-2xl md:text-4xl lg:text-5xl font-serif leading-[1.5] font-medium">
                  "{todayWisdom.text}"
                </p>
                <footer className="flex items-center space-x-4 pt-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-300 via-amber-400 to-transparent" />
                  <cite className="text-slate-600 font-semibold text-base not-italic">{todayWisdom.source}</cite>
                </footer>
              </blockquote>
            </CardContent>
          </Card>
        </motion.div>

        {/* Jewish Learning Paths */}

        {/* Jewish Learning Paths */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-10"
        >
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="inline-flex items-center space-x-2"
            >
              <div className="h-1 w-12 bg-gradient-to-r from-slate-900 to-slate-400 rounded-full" />
              <span className="text-slate-500 font-semibold text-sm uppercase tracking-widest">Your Path</span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Torah Learning Paths</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Talmud', desc: 'Gemara, Mishnah & Daf Yomi', icon: '📖', color: 'from-blue-500 to-blue-600', path: 'TalmudStudy', delay: 0.8 },
              { name: 'Torah', desc: 'Chumash, Parsha & Rashi', icon: '📜', color: 'from-green-500 to-green-600', path: 'TorahStudy', delay: 0.9 },
              { name: 'Kabbalah', desc: 'Zohar & Mystical Wisdom', icon: '✨', color: 'from-purple-500 to-purple-600', path: 'KabbalahStudy', delay: 1.0 },
              { name: 'Halacha', desc: 'Jewish Law & Practice', icon: '⚖️', color: 'from-amber-500 to-amber-600', path: 'HalachaGuide', delay: 1.1 }
            ].map((item, idx) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
              >
                <Link to={createPageUrl(item.path)}>
                  <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-xl transition-all duration-500 group cursor-pointer h-full rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-8 space-y-6">
                      <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-[1.5rem] flex items-center justify-center text-5xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{item.name}</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                      <Button className={`w-full bg-gradient-to-r ${item.color} hover:shadow-2xl text-white font-bold py-6 rounded-2xl transition-all duration-300 btn-premium group relative overflow-hidden`}>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Begin Study
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}


          </div>
        </motion.div>
      </div>
    </div>
  );
}