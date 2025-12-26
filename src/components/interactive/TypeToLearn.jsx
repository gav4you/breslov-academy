import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Keyboard, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TypeToLearn() {
  const [targetText] = useState('שלום עליכם');
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (userInput === targetText) {
      setIsCorrect(true);
    } else if (userInput.length > 0) {
      setIsCorrect(targetText.startsWith(userInput));
    }
  }, [userInput]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-cyan-600" />
          Type to Learn Hebrew
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl">
          <div className="text-4xl font-bold text-slate-900 mb-2" dir="rtl">
            {targetText}
          </div>
          <div className="text-slate-600">Type this phrase in Hebrew</div>
        </div>

        <div className="relative">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Start typing..."
            className="text-center text-2xl py-6 rounded-2xl"
            dir="rtl"
          />
          {isCorrect !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {isCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </motion.div>
          )}
        </div>

        {userInput === targetText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-center text-white font-bold"
          >
            Perfect! ✨ +50 XP
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}