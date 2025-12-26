import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrueFalseQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    { question: 'Rebbe Nachman emphasized the importance of joy in serving God', answer: true },
    { question: 'Hitbodedut should only be practiced in groups', answer: false },
  ];

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      }
    }, 2000);
  };

  const question = questions[currentQ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          True or False?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-6">
              <p className="text-xl text-slate-900 font-medium leading-relaxed">
                {question.question}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer(true)}
                disabled={answered}
                className={`py-8 rounded-2xl font-bold text-lg ${
                  answered
                    ? selectedAnswer === true
                      ? question.answer === true
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                }`}
              >
                {answered && selectedAnswer === true && (
                  question.answer === true ? <CheckCircle className="w-6 h-6 mr-2" /> : <XCircle className="w-6 h-6 mr-2" />
                )}
                True
              </Button>

              <Button
                onClick={() => handleAnswer(false)}
                disabled={answered}
                className={`py-8 rounded-2xl font-bold text-lg ${
                  answered
                    ? selectedAnswer === false
                      ? question.answer === false
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                    : 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                }`}
              >
                {answered && selectedAnswer === false && (
                  question.answer === false ? <CheckCircle className="w-6 h-6 mr-2" /> : <XCircle className="w-6 h-6 mr-2" />
                )}
                False
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="text-center text-sm text-slate-600">
          Question {currentQ + 1} of {questions.length}
        </div>
      </CardContent>
    </Card>
  );
}