import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Send } from 'lucide-react';

export default function QuestionSubmit({ lessonId }) {
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (question.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setQuestion('');
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitted ? (
          <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-center text-white">
            <h3 className="text-xl font-bold mb-2">Question Submitted!</h3>
            <p className="text-sm">The instructor will respond soon</p>
          </div>
        ) : (
          <>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this lesson?"
              className="min-h-[120px] rounded-2xl"
            />
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-2xl"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Question
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}