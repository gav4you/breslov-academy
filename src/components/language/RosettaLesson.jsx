import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Volume2, ArrowRight } from 'lucide-react';

// Mock data for prototype
const LESSON_DATA = [
  {
    id: 1,
    type: 'match',
    prompt: 'Tapuach (Apple)',
    audio: null, // Would be a URL
    correctId: 'img1',
    options: [
      { id: 'img1', label: 'Apple', color: 'bg-red-200' },
      { id: 'img2', label: 'Bread', color: 'bg-amber-200' },
      { id: 'img3', label: 'Water', color: 'bg-blue-200' },
      { id: 'img4', label: 'Book', color: 'bg-slate-200' }
    ]
  },
  {
    id: 2,
    type: 'match',
    prompt: 'Mayim (Water)',
    audio: null,
    correctId: 'img3',
    options: [
      { id: 'img1', label: 'Apple', color: 'bg-red-200' },
      { id: 'img2', label: 'Bread', color: 'bg-amber-200' },
      { id: 'img3', label: 'Water', color: 'bg-blue-200' },
      { id: 'img4', label: 'Book', color: 'bg-slate-200' }
    ]
  }
];

export default function RosettaLesson({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, correct, wrong
  const [streak, setStreak] = useState(0);

  const currentStep = LESSON_DATA[currentIdx];
  const progress = ((currentIdx) / LESSON_DATA.length) * 100;

  const handleSelect = (id) => {
    if (status !== 'idle') return;
    setSelectedId(id);
    
    if (id === currentStep.correctId) {
      setStatus('correct');
      setStreak(s => s + 1);
      // Play success sound
    } else {
      setStatus('wrong');
      setStreak(0);
      // Play error sound
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= LESSON_DATA.length) {
      onComplete(streak);
    } else {
      setCurrentIdx(p => p + 1);
      setStatus('idle');
      setSelectedId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Lesson Progress</span>
          <span>{currentIdx + 1} / {LESSON_DATA.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Prompt Area */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{currentStep.prompt}</h2>
        <Button variant="outline" size="icon" className="rounded-full w-12 h-12">
          <Volume2 className="h-6 w-6" />
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {currentStep.options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrect = status === 'correct' && isSelected;
          const isWrong = status === 'wrong' && isSelected;

          return (
            <motion.div
              key={opt.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(opt.id)}
              className="cursor-pointer"
            >
              <Card className={`
                h-48 flex items-center justify-center relative overflow-hidden transition-all duration-300
                ${isSelected ? 'ring-4 ring-offset-2' : ''}
                ${isCorrect ? 'ring-green-500' : ''}
                ${isWrong ? 'ring-red-500' : ''}
                ${!isSelected && status !== 'idle' ? 'opacity-50 grayscale' : ''}
              `}>
                {/* Visual Placeholder */}
                <div className={`absolute inset-0 ${opt.color} opacity-30`} />
                <span className="z-10 text-xl font-medium">{opt.label}</span>
                
                {isCorrect && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600 drop-shadow-md" />
                  </div>
                )}
                {isWrong && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <XCircle className="h-12 w-12 text-red-600 drop-shadow-md" />
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Button 
                size="lg" 
                onClick={handleNext}
                className={status === 'correct' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {status === 'correct' ? 'Continue' : 'Got it'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
