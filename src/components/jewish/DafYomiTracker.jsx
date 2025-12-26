import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Flame, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DafYomiTracker({ progress, onMarkComplete }) {
  if (!progress) return null;

  const cycleProgress = (progress.total_dapim_completed / 2711) * 100; // 2711 pages in Shas

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
        <CardTitle className="flex items-center space-x-3">
          <Calendar className="w-6 h-6" />
          <span>Daf Yomi - Daily Talmud</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Current Daf */}
          <div className="text-center">
            <p className="text-slate-600 text-sm font-medium mb-2">Today's Daf</p>
            <h2 className="text-4xl font-bold text-slate-900">
              {progress.current_masechta} {progress.current_daf}
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center"
            >
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{progress.total_dapim_completed}</div>
              <div className="text-xs text-green-700">Dapim</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center"
            >
              <Flame className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-900">{progress.current_streak}</div>
              <div className="text-xs text-amber-700">Day Streak</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center"
            >
              <Trophy className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{Math.round(cycleProgress)}%</div>
              <div className="text-xs text-blue-700">Cycle</div>
            </motion.div>
          </div>

          {/* Cycle Progress */}
          <div>
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Shas Cycle Progress</span>
              <span className="font-bold">{progress.total_dapim_completed} / 2711</span>
            </div>
            <Progress value={cycleProgress} className="h-3" />
          </div>

          <Button 
            onClick={onMarkComplete}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold"
          >
            Mark Today's Daf Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}