import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Swords, CheckCircle, Clock, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function DailyQuest({ quests = [] }) {
  const defaultQuests = [
    {
      id: 1,
      title: 'Morning Learner',
      description: 'Complete a lesson before noon',
      xp: 50,
      progress: 0,
      total: 1,
      completed: false,
      icon: '🌅'
    },
    {
      id: 2,
      title: 'Chavruta Connection',
      description: 'Ask 3 questions to AI study partner',
      xp: 30,
      progress: 2,
      total: 3,
      completed: false,
      icon: '👥'
    },
    {
      id: 3,
      title: 'Torah Verses',
      description: 'Review 10 vocabulary flashcards',
      xp: 40,
      progress: 10,
      total: 10,
      completed: true,
      icon: '📖'
    },
    {
      id: 4,
      title: 'Wisdom Seeker',
      description: 'Watch a complete shiur video',
      xp: 75,
      progress: 0,
      total: 1,
      completed: false,
      icon: '🎓'
    }
  ];

  const activeQuests = quests.length > 0 ? quests : defaultQuests;
  const completedCount = activeQuests.filter(q => q.completed).length;
  const totalXP = activeQuests.reduce((sum, q) => sum + (q.completed ? q.xp : 0), 0);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-black text-slate-900">Daily Quests</h3>
              <p className="text-xs text-slate-600" dir="rtl">משימות יומיות</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full">
            <Award className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-amber-900">{totalXP} XP</span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
          <Clock className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">
              {completedCount} / {activeQuests.length} Complete
            </div>
            <div className="text-xs text-slate-600">Resets at midnight</div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {Math.round((completedCount / activeQuests.length) * 100)}%
          </Badge>
        </div>

        <div className="space-y-3">
          {activeQuests.map((quest, idx) => {
            const progressPercent = (quest.progress / quest.total) * 100;
            
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  quest.completed 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{quest.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-bold text-slate-900">{quest.title}</div>
                        <div className="text-xs text-slate-600">{quest.description}</div>
                      </div>
                      {quest.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Badge className="bg-purple-100 text-purple-800">
                          +{quest.xp} XP
                        </Badge>
                      )}
                    </div>

                    {!quest.completed && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Progress</span>
                          <span>{quest.progress} / {quest.total}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {completedCount === activeQuests.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 text-center"
          >
            <div className="text-5xl mb-3">🏆</div>
            <div className="text-xl font-black text-slate-900 mb-2">All Quests Complete!</div>
            <div className="text-amber-800 font-serif">
              Come back tomorrow for new challenges
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}