import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, PenLine } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FillInTheBlank() {
  const [answers, setAnswers] = useState(['', '']);
  const [submitted, setSubmitted] = useState(false);

  const question = {
    text: "Rebbe Nachman taught that ___ is a great mitzvah, and one should never ___.",
    correctAnswers: ['simcha', 'despair'],
  };

  const checkAnswers = () => {
    setSubmitted(true);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenLine className="w-5 h-5 text-blue-600" />
          Fill in the Blanks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <p className="text-lg text-slate-900 leading-relaxed">
            {question.text.split('___').map((part, idx) => (
              <React.Fragment key={idx}>
                {part}
                {idx < question.correctAnswers.length && (
                  <span className="inline-block mx-2 relative">
                    <Input
                      value={answers[idx]}
                      onChange={(e) => {
                        const newAnswers = [...answers];
                        newAnswers[idx] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      disabled={submitted}
                      className="w-32 inline-block"
                    />
                    {submitted && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -right-6 top-1/2 -translate-y-1/2"
                      >
                        {answers[idx].toLowerCase() === question.correctAnswers[idx] ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </motion.span>
                    )}
                  </span>
                )}
              </React.Fragment>
            ))}
          </p>
        </div>

        {!submitted ? (
          <Button
            onClick={checkAnswers}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
          >
            Check Answers
          </Button>
        ) : (
          <div className="text-center">
            {answers.every((ans, idx) => ans.toLowerCase() === question.correctAnswers[idx]) ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white font-bold"
              >
                Perfect! +150 XP
              </motion.div>
            ) : (
              <div className="p-4 bg-orange-100 rounded-2xl text-orange-900 font-medium">
                Try again! The correct answers are: {question.correctAnswers.join(', ')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}