import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Award, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonQuiz({ quiz, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const question = quiz.questions[currentQ];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQ + 1) / totalQuestions) * 100;

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQ]: answer });
    
    setTimeout(() => {
      if (currentQ < totalQuestions - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        calculateResults();
      }
    }, 500);
  };

  const calculateResults = () => {
    const correct = Object.keys(answers).filter(idx => 
      answers[idx] === quiz.questions[idx].correct_answer
    ).length;
    
    const score = (correct / totalQuestions) * 100;
    setShowResults(true);
    onComplete?.({ score, passed: score >= (quiz.passing_score || 70) });
  };

  if (showResults) {
    const correct = Object.keys(answers).filter(idx => 
      answers[idx] === quiz.questions[idx].correct_answer
    ).length;
    const score = (correct / totalQuestions) * 100;
    const passed = score >= (quiz.passing_score || 70);

    return (
      <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
        <CardContent className="p-12 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 ${
              passed 
                ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
                : 'bg-gradient-to-br from-orange-400 to-red-600'
            }`}>
              <div className="text-5xl font-black text-white">{Math.round(score)}%</div>
            </div>
          </motion.div>

          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">
              {passed ? 'Excellent Work!' : 'Keep Learning!'}
            </h2>
            <div className="text-lg text-slate-600" dir="rtl">
              {passed ? 'יישר כח!' : 'המשך ללמוד!'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{correct}</div>
              <div className="text-xs text-slate-600">Correct</div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{totalQuestions - correct}</div>
              <div className="text-xs text-slate-600">Incorrect</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{passed ? '+100' : '+25'}</div>
              <div className="text-xs text-slate-600">XP</div>
            </div>
          </div>

          {passed ? (
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <div className="text-green-900 font-serif leading-relaxed">
                "One who increases knowledge increases life" - Pirkei Avot. You've mastered this material!
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
              <div className="text-amber-900 font-serif leading-relaxed">
                Review the material and try again. "Even one who learns with difficulty, their reward is great"
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
          >
            Continue Learning
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 font-serif">{quiz.title}</h2>
        <Badge className="bg-blue-100 text-blue-800">
          Question {currentQ + 1} / {totalQuestions}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
            <CardContent className="p-8 space-y-6">
              <div className="text-xl font-bold text-slate-900">
                {question.question}
              </div>
              {question.question_hebrew && (
                <div className="text-lg text-amber-700 font-serif" dir="rtl">
                  {question.question_hebrew}
                </div>
              )}

              <div className="grid gap-3">
                {question.options.map((option, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    variant="outline"
                    className="w-full p-6 rounded-2xl text-left justify-start text-lg font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}