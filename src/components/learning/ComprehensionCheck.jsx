import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Lightbulb, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ComprehensionCheck({ questions, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit?.(answers);
    setSubmitted(true);
  };

  const defaultQuestions = [
    {
      id: 1,
      question: 'Summarize the main teaching in your own words',
      questionHebrew: 'סכם את הלימוד המרכזי במילים שלך',
      type: 'short_answer'
    },
    {
      id: 2,
      question: 'How does this teaching apply to your daily life?',
      questionHebrew: 'כיצד הלימוד הזה רלוונטי לחייך?',
      type: 'short_answer'
    },
    {
      id: 3,
      question: 'What question would you ask the Rebbe about this topic?',
      questionHebrew: 'איזו שאלה היית שואל את הרבי?',
      type: 'short_answer'
    }
  ];

  const activeQuestions = questions || defaultQuestions;

  if (submitted) {
    return (
      <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
        <CardContent className="p-12 text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-24 h-24 text-green-600 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-3xl font-black text-slate-900">Reflections Submitted!</h3>
          <p className="text-lg text-slate-600" dir="rtl">תשובותיך נשמרו</p>
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="text-green-900 font-serif">
              "Learning without reflection is wasted" - Continue to ponder these teachings
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">
            +50 XP for deep reflection
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-amber-600" />
          <div>
            <h3 className="text-2xl font-black text-slate-900">Reflection Questions</h3>
            <p className="text-sm text-slate-600" dir="rtl">שאלות הרהור</p>
          </div>
        </div>

        <div className="space-y-6">
          {activeQuestions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-3"
            >
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  {idx + 1}. {q.question}
                </label>
                {q.questionHebrew && (
                  <div className="text-sm text-amber-700 font-serif" dir="rtl">
                    {q.questionHebrew}
                  </div>
                )}
              </div>
              <Textarea
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Share your thoughts..."
                className="min-h-[100px] rounded-xl"
              />
            </motion.div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < activeQuestions.length}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
        >
          <Send className="w-5 h-5 mr-2" />
          Submit Reflections
        </Button>
      </CardContent>
    </Card>
  );
}