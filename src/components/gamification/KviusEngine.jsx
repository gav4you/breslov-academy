import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Moon, Sun, Clock, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KviusEngine({ userEmail, streak }) {
  const [zmanim, setZmanim] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState('day');

  useEffect(() => {
    // Calculate Zmanim (simplified - in production use proper library)
    const now = new Date();
    const sunset = new Date(now);
    sunset.setHours(17, 30, 0); // Approximate
    
    const chatzot = new Date(now);
    chatzot.setHours(0, 0, 0); // Midnight
    
    setZmanim({
      sunrise: '6:45 AM',
      sunset: '5:30 PM',
      chatzot: '12:00 AM'
    });

    // Determine current period
    const hour = now.getHours();
    if (hour >= 0 && hour < 6) setCurrentPeriod('chatzot');
    else if (hour >= 6 && hour < 12) setCurrentPeriod('morning');
    else if (hour >= 12 && hour < 17) setCurrentPeriod('afternoon');
    else setCurrentPeriod('evening');
  }, []);

  const achievements = [
    {
      id: 'vatikin',
      name: 'Vatikin Learner',
      description: 'Study at sunrise for 7 consecutive days',
      icon: Sun,
      color: 'from-orange-500 to-amber-600',
      progress: 3,
      total: 7,
      unlocked: false
    },
    {
      id: 'chatzot',
      name: 'Midnight Scholar',
      description: 'Learn after Chatzot (midnight) 5 times',
      icon: Moon,
      color: 'from-indigo-500 to-purple-600',
      progress: 2,
      total: 5,
      unlocked: false
    },
    {
      id: 'kvius',
      name: 'Kovat Itim',
      description: 'Fixed study time - 30 day streak',
      icon: Flame,
      color: 'from-red-500 to-orange-600',
      progress: streak?.current_streak || 0,
      total: 30,
      unlocked: false
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-serif">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <div className="text-2xl font-black text-slate-900">Kvius Itim LaTorah</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">קביעות עתים לתורה</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Zman */}
        <div className="p-6 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl text-white">
          <div className="text-sm opacity-80 mb-2 uppercase tracking-wider">Current Period</div>
          <div className="text-3xl font-black mb-4 capitalize font-serif">{currentPeriod}</div>
          
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Sun className="w-4 h-4 mx-auto mb-1 text-amber-300" />
              <div className="text-white/60">Sunrise</div>
              <div className="font-bold">{zmanim?.sunrise}</div>
            </div>
            <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Sun className="w-4 h-4 mx-auto mb-1 text-orange-300 rotate-180" />
              <div className="text-white/60">Sunset</div>
              <div className="font-bold">{zmanim?.sunset}</div>
            </div>
            <div className="text-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Moon className="w-4 h-4 mx-auto mb-1 text-indigo-300" />
              <div className="text-white/60">Chatzot</div>
              <div className="font-bold">{zmanim?.chatzot}</div>
            </div>
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-600" />
              <div>
                <div className="font-black text-2xl text-slate-900">{streak?.current_streak || 0} Days</div>
                <div className="text-sm text-slate-600 font-serif">Current Streak</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-slate-900">{streak?.longest_streak || 0}</div>
              <div className="text-xs text-slate-600">Best Streak</div>
            </div>
          </div>
          
          {/* Weekly Streak Calendar */}
          <div className="flex gap-1 mt-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
              const completed = idx < ((streak?.current_streak || 0) % 7);
              return (
                <div
                  key={idx}
                  className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                    completed 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Zman Achievements */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 font-serif">Zman Achievements</h4>
          {achievements.map((achievement, idx) => {
            const Icon = achievement.icon;
            const progressPercent = (achievement.progress / achievement.total) * 100;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white rounded-xl border border-slate-200"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900 font-serif">{achievement.name}</h5>
                    <p className="text-xs text-slate-600">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <Award className="w-6 h-6 text-amber-500" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress</span>
                    <span className="font-bold">{achievement.progress}/{achievement.total}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${achievement.color} transition-all duration-500`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}