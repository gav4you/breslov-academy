import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Volume2, Award, TrendingUp, Sparkles, Languages, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageVariants() {
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

  const { data: languageProgress = [] } = useQuery({
    queryKey: ['languageProgress', user?.email],
    queryFn: () => base44.entities.LanguageProgress.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const languages = [
    {
      id: 'biblical_hebrew',
      name: 'Biblical Hebrew',
      nameHebrew: 'עברית מקראית',
      description: 'Master the language of Tanach with ancient grammar and vocabulary',
      icon: '📜',
      color: 'from-blue-500 to-blue-600',
      difficulty: 'Intermediate',
      features: ['Ancient vocabulary', 'Biblical cantillation', 'Masoretic text reading']
    },
    {
      id: 'torah_hebrew',
      name: 'Torah Hebrew',
      nameHebrew: 'עברית תורנית',
      description: 'Learn Torah Hebrew with Rashi script and traditional pronunciation',
      icon: '✡️',
      color: 'from-indigo-500 to-indigo-600',
      difficulty: 'Beginner',
      features: ['Rashi script', 'Trop/cantillation', 'Torah vocabulary']
    },
    {
      id: 'aramaic',
      name: 'Aramaic',
      nameHebrew: 'ארמית',
      description: 'Study the language of the Talmud, Zohar, and ancient texts',
      icon: '📖',
      color: 'from-purple-500 to-purple-600',
      difficulty: 'Advanced',
      features: ['Talmudic Aramaic', 'Targum Onkelos', 'Zohar vocabulary']
    },
    {
      id: 'talmud_bavli',
      name: 'Talmud Bavli Hebrew',
      nameHebrew: 'עברית תלמוד בבלי',
      description: 'Navigate Babylonian Talmud with rabbinic Hebrew and Aramaic',
      icon: '📚',
      color: 'from-amber-500 to-amber-600',
      difficulty: 'Advanced',
      features: ['Gemara terminology', 'Sugya comprehension', 'Rashi/Tosafot']
    },
    {
      id: 'modern_hebrew',
      name: 'Modern Hebrew',
      nameHebrew: 'עברית חדשה',
      description: 'Speak conversational Hebrew used in Israel today',
      icon: '🇮🇱',
      color: 'from-green-500 to-green-600',
      difficulty: 'Beginner',
      features: ['Conversational Hebrew', 'Modern vocabulary', 'Israeli culture']
    },
    {
      id: 'old_hebrew',
      name: 'Ancient Hebrew',
      nameHebrew: 'עברית עתיקה',
      description: 'Explore pre-exilic Hebrew and archaeological texts',
      icon: '🏛️',
      color: 'from-slate-600 to-slate-700',
      difficulty: 'Expert',
      features: ['Paleo-Hebrew', 'Dead Sea Scrolls', 'Archaeological texts']
    },
    {
      id: 'yiddish',
      name: 'Yiddish',
      nameHebrew: 'אידיש',
      description: 'Connect with Ashkenazi heritage through Yiddish language',
      icon: '🎭',
      color: 'from-rose-500 to-rose-600',
      difficulty: 'Intermediate',
      features: ['Yiddish alphabet', 'Jewish culture', 'Classical literature']
    }
  ];

  const getProgress = (langId) => {
    return languageProgress.find(lp => lp.language_variant === langId);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-purple-100 text-purple-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto space-y-12 px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 shadow-lg">
            <Languages className="w-5 h-5 text-blue-600" />
            <span className="text-slate-700 font-bold">Immersive Language Learning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">
            Master <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Sacred Languages</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Learn Hebrew, Aramaic, and Yiddish through our revolutionary Rosetta Stone-inspired method. 
            Immersive, image-based learning without translation.
          </p>
        </motion.div>

        {/* Method Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-amber-500" />
                Rosetta Stone Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { icon: '👁️', title: 'Visual Immersion', desc: 'Learn through images, not translation' },
                  { icon: '🎯', title: 'Intuitive Discovery', desc: 'Natural pattern recognition' },
                  { icon: '🗣️', title: 'Speech Recognition', desc: 'Perfect your pronunciation' },
                  { icon: '📈', title: 'Adaptive Learning', desc: 'Personalized difficulty' }
                ].map((method, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="text-center space-y-3"
                  >
                    <div className="text-5xl">{method.icon}</div>
                    <h3 className="font-bold text-slate-900">{method.title}</h3>
                    <p className="text-sm text-slate-600">{method.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {languages.map((lang, idx) => {
            const progress = getProgress(lang.id);
            const progressPercent = progress ? (progress.units_completed.length * 10) : 0;
            
            return (
              <motion.div
                key={lang.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-xl transition-all duration-300 h-full rounded-[2rem] overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${lang.color}`} />
                  
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="text-6xl">{lang.icon}</div>
                      <Badge className={getDifficultyColor(lang.difficulty)}>
                        {lang.difficulty}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-1">{lang.name}</h3>
                      <p className="text-lg text-amber-700 font-serif mb-3" dir="rtl">{lang.nameHebrew}</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{lang.description}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 font-semibold">Progress</span>
                          <span className="text-slate-900 font-bold">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Level {progress.level}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            <span>{progress.vocabulary_mastered.length} words</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">Features</div>
                      <div className="flex flex-wrap gap-2">
                        {lang.features.map((feature, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Link to={createPageUrl(`RosettaStoneLesson?lang=${lang.id}`)}>
                        <Button className={`w-full bg-gradient-to-r ${lang.color} text-white font-bold py-4 rounded-2xl hover:shadow-2xl transition-all`}>
                          {progress ? 'Continue' : 'Start'}
                        </Button>
                      </Link>
                      <Link to={createPageUrl(`LanguageLearning?lang=${lang.id}`)}>
                        <Button variant="outline" className="w-full py-4 rounded-2xl font-bold">
                          All Features
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}