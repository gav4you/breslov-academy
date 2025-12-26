import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, XCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SkillAssessment({ assessment, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const questions = assessment?.questions || [];
  const question = questions[currentQuestion];

  const handleAnswer = (optionIdx) => {
    setAnswers({ ...answers, [currentQuestion]: optionIdx });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      const correct = Object.entries(answers).filter(([qIdx, aIdx]) => 
        questions[qIdx].correct_option === aIdx
      ).length;
      
      const finalScore = (correct / questions.length) * 100;
      setScore(finalScore);
      setCompleted(true);
      onComplete?.(finalScore);
    }
  };

  if (completed) {
    return (
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
              score >= 80 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : score >= 60
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}>
              <Award className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <div>
            <h2 className="text-4xl font-black text-slate-900 mb-2">
              {score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Job!' : 'Keep Learning!'}
            </h2>
            <p className="text-xl text-slate-600">You scored {score.toFixed(0)}%</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="font-bold text-slate-900 mb-2">Your Results:</div>
            <div className="text-slate-700">
              {Object.entries(answers).filter(([qIdx, aIdx]) => 
                questions[qIdx].correct_option === aIdx
              ).length} out of {questions.length} correct
            </div>
          </div>

          <Button
            onClick={() => {
              setCompleted(false);
              setCurrentQuestion(0);
              setAnswers({});
            }}
            variant="outline"
            className="rounded-xl"
          >
            Retake Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Skill Assessment
          </CardTitle>
          <Badge variant="outline">
            Question {currentQuestion + 1} / {questions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold text-slate-900">{question?.question_text}</h3>

            <div className="space-y-3">
              {question?.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion] === idx
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === idx
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-300'
                    }`}>
                      {answers[currentQuestion] === idx && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-slate-900">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}