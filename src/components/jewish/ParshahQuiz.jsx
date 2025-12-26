import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, XCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ParshahQuiz({ parshah = 'Bereishit' }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: 'On which day did God create light?',
      questionHebrew: 'באיזה יום ברא הקב"ה את האור?',
      options: ['Day 1', 'Day 2', 'Day 3', 'Day 4'],
      correct: 'Day 1',
      reference: 'Genesis 1:3-5'
    },
    {
      question: 'What did God create on the sixth day?',
      questionHebrew: 'מה ברא הקב"ה ביום השישי?',
      options: ['Fish', 'Birds', 'Humans', 'Plants'],
      correct: 'Humans',
      reference: 'Genesis 1:26-27'
    },
    {
      question: 'What was the name of the first garden?',
      questionHebrew: 'מה שם הגן הראשון?',
      options: ['Gan Eden', 'Promised Land', 'Mount Sinai', 'Jerusalem'],
      correct: 'Gan Eden',
      reference: 'Genesis 2:8'
    }
  ];

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQ]: answer });
    
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else {
        setShowResults(true);
      }
    }, 500);
  };

  if (showResults) {
    const correct = Object.keys(answers).filter(idx => 
      answers[idx] === questions[idx].correct
    ).length;
    const score = (correct / questions.length) * 100;

    return (
      <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
        <CardContent className="p-12 text-center space-y-6">
          <Award className="w-24 h-24 text-amber-600 mx-auto" />
          <div>
            <div className="text-4xl font-black text-slate-900 mb-2">{Math.round(score)}%</div>
            <div className="text-xl text-slate-600" dir="rtl">יישר כח!</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{correct}</div>
              <div className="text-xs text-slate-600">Correct</div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{questions.length - correct}</div>
              <div className="text-xs text-slate-600">Incorrect</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">+{Math.round(score)}</div>
              <div className="text-xs text-slate-600">XP</div>
            </div>
          </div>
          <Button
            onClick={() => {
              setCurrentQ(0);
              setAnswers({});
              setShowResults(false);
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQ];

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>Parshat {parshah} Quiz</div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {currentQ + 1} / {questions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <div className="text-xl font-bold text-slate-900 mb-2">
              {question.question}
            </div>
            <div className="text-lg text-amber-700 font-serif" dir="rtl">
              {question.questionHebrew}
            </div>
          </div>

          <div className="grid gap-3">
            {question.options.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className="w-full p-6 rounded-2xl text-left justify-start text-lg hover:bg-blue-50 hover:border-blue-300"
              >
                {option}
              </Button>
            ))}
          </div>

          <Badge variant="outline" className="text-xs">
            📖 {question.reference}
          </Badge>
        </motion.div>
      </CardContent>
    </Card>
  );
}