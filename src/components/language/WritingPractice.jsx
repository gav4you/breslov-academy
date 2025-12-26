import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PenTool, Check, X, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WritingPractice({ exercise, onComplete }) {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const checkAnswer = () => {
    const correct = userInput.trim() === exercise.correct_answer.trim();
    setFeedback({
      correct,
      message: correct 
        ? 'Perfect! מצוין!' 
        : 'Not quite. Try again or check the hint.',
      corrections: correct ? [] : exercise.common_mistakes || []
    });
    
    if (correct) {
      setTimeout(() => onComplete(), 2000);
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <PenTool className="w-6 h-6 text-blue-600" />
            Writing Practice
          </CardTitle>
          <Badge className="bg-blue-100 text-blue-800">
            {exercise.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt */}
        <div className="space-y-2">
          <div className="text-lg font-bold text-slate-900">{exercise.prompt}</div>
          {exercise.context && (
            <div className="text-slate-600 bg-slate-50 p-4 rounded-xl">
              {exercise.context}
            </div>
          )}
        </div>

        {/* Input */}
        {exercise.type === 'sentence' ? (
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer in Hebrew..."
            className="text-2xl text-right p-6 rounded-2xl"
            dir="rtl"
          />
        ) : (
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Write your paragraph here..."
            className="text-xl text-right p-6 rounded-2xl min-h-32"
            dir="rtl"
          />
        )}

        {/* Hint Button */}
        {exercise.hint && (
          <Button
            onClick={() => setShowHint(!showHint)}
            variant="outline"
            className="rounded-xl"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
        )}

        {showHint && exercise.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
          >
            <div className="text-amber-900">{exercise.hint}</div>
          </motion.div>
        )}

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-6 border-2 ${
              feedback.correct
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {feedback.correct ? (
                <Check className="w-6 h-6 text-green-600" />
              ) : (
                <X className="w-6 h-6 text-red-600" />
              )}
              <div className={`text-xl font-bold ${feedback.correct ? 'text-green-900' : 'text-red-900'}`}>
                {feedback.message}
              </div>
            </div>
            
            {!feedback.correct && exercise.correct_answer && (
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-700">Correct Answer:</div>
                <div className="text-2xl text-slate-900" dir="rtl">{exercise.correct_answer}</div>
                {feedback.corrections.length > 0 && (
                  <div className="text-sm text-red-700 mt-2">
                    Common mistakes: {feedback.corrections.join(', ')}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          onClick={checkAnswer}
          disabled={!userInput.trim()}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl"
        >
          Check Answer
        </Button>
      </CardContent>
    </Card>
  );
}