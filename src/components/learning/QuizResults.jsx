import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, RotateCcw, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressRing from '@/components/ui/progress-ring';

export default function QuizResults({ score, total, timeTaken, onRetry }) {
  const percentage = (score / total) * 100;

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2rem]">
      <CardContent className="p-8 text-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <ProgressRing progress={percentage} size={200} strokeWidth={12} />
        </motion.div>

        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">
            {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
          </h2>
          <p className="text-xl text-slate-600">
            You scored {score} out of {total}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{percentage.toFixed(0)}%</div>
            <div className="text-xs text-slate-600">Accuracy</div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{score}</div>
            <div className="text-xs text-slate-600">Correct</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{timeTaken}s</div>
            <div className="text-xs text-slate-600">Time</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            variant="outline"
            className="flex-1 rounded-2xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}