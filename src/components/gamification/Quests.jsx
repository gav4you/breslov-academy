import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords, Star, Award, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function Quests() {
  const quests = [
    {
      type: 'daily',
      title: 'Daily Scholar',
      description: 'Complete 1 lesson today',
      progress: 0,
      target: 1,
      reward: '50 XP',
      timeLeft: '8 hours',
      icon: '📚'
    },
    {
      type: 'weekly',
      title: 'Torah Champion',
      description: 'Study 5 days this week',
      progress: 3,
      target: 5,
      reward: '200 XP + Badge',
      timeLeft: '3 days',
      icon: '🏆'
    },
    {
      type: 'special',
      title: 'Midnight Scholar',
      description: 'Study during Chatzot 5 times',
      progress: 2,
      target: 5,
      reward: '500 XP + Exclusive Badge',
      timeLeft: 'Ongoing',
      icon: '🌙'
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Swords className="w-5 h-5 text-purple-600" />
          <div>
            <div>Active Quests</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">משימות פעילות</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quests.map((quest, idx) => {
          const progressPercent = (quest.progress / quest.target) * 100;
          
          return (
            <div
              key={idx}
              className="p-4 rounded-xl border-2 bg-white border-slate-200 hover:border-purple-300 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-4xl">{quest.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-black text-slate-900">{quest.title}</div>
                    <Badge className="bg-purple-100 text-purple-800 text-xs capitalize">
                      {quest.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">{quest.description}</div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{quest.timeLeft}</span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-bold text-slate-900">{quest.progress} / {quest.target}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <Badge className="bg-amber-100 text-amber-800">
                    <Award className="w-3 h-3 mr-1" />
                    {quest.reward}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}