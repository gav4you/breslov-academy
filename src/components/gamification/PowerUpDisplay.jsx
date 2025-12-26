import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Star, Flame, Shield, Clock, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PowerUpDisplay({ userPowerUps = [], onActivate }) {
  const availablePowerUps = [
    {
      id: 'double_xp',
      name: 'Double XP',
      nameHebrew: 'נקודות כפולות',
      description: 'Earn 2x experience points for 1 hour',
      icon: Star,
      color: 'from-yellow-400 to-amber-500',
      duration: '1 hour',
      cost: 50
    },
    {
      id: 'streak_freeze',
      name: 'Streak Freeze',
      nameHebrew: 'הקפאת רצף',
      description: 'Protect your streak if you miss a day',
      icon: Shield,
      color: 'from-blue-400 to-cyan-500',
      duration: '1 day',
      cost: 30
    },
    {
      id: 'chavruta_boost',
      name: 'Chavruta Boost',
      nameHebrew: 'חיזוק חברותא',
      description: 'Unlock unlimited AI study partner questions',
      icon: Brain,
      color: 'from-purple-400 to-pink-500',
      duration: '24 hours',
      cost: 75
    },
    {
      id: 'time_extension',
      name: 'Time Extension',
      nameHebrew: 'הארכת זמן',
      description: 'Extra time on quizzes and tests',
      icon: Clock,
      color: 'from-green-400 to-emerald-500',
      duration: 'Next 3 quizzes',
      cost: 40
    },
    {
      id: 'fire_boost',
      name: 'Fire of Torah',
      nameHebrew: 'אש התורה',
      description: 'Boost all learning activities by 50%',
      icon: Flame,
      color: 'from-red-400 to-orange-500',
      duration: '2 hours',
      cost: 100
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Power-Ups</h3>
            <p className="text-sm text-slate-600" dir="rtl">כוחות מיוחדים</p>
          </div>
          <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full">
            <Zap className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-amber-900">250 pts</span>
          </div>
        </div>

        <div className="grid gap-3">
          {availablePowerUps.map((powerUp, idx) => {
            const Icon = powerUp.icon;
            const userHas = userPowerUps.find(p => p.type === powerUp.id);
            
            return (
              <motion.div
                key={powerUp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${powerUp.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="font-bold text-slate-900">{powerUp.name}</h4>
                        <p className="text-xs text-amber-700 font-serif" dir="rtl">{powerUp.nameHebrew}</p>
                      </div>
                      {userHas && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{powerUp.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        Duration: {powerUp.duration}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onActivate?.(powerUp.id)}
                        disabled={!!userHas}
                        className={`rounded-lg text-xs ${
                          userHas ? 'opacity-50' : `bg-gradient-to-r ${powerUp.color} text-white hover:shadow-lg`
                        }`}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {powerUp.cost} pts
                      </Button>
                    </div>
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