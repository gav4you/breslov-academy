import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ThumbsUp, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function QASection({ lessonId }) {
  const [showAskForm, setShowAskForm] = useState(false);

  const questions = [
    {
      question: 'How do I practice Azamra in difficult situations?',
      author: 'Moshe L.',
      answers: 3,
      likes: 12,
      answered: true,
      topAnswer: 'Start by finding one small good point, no matter how tiny...'
    },
    {
      question: 'What is the connection between joy and Torah study?',
      author: 'David K.',
      answers: 5,
      likes: 18,
      answered: true
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Q&A
          </div>
          <Button
            onClick={() => setShowAskForm(!showAskForm)}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ask
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAskForm && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
            <Textarea
              placeholder="Ask your question..."
              className="min-h-[100px] rounded-xl"
            />
            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl">
              Post Question
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={idx} className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-bold text-slate-900 mb-1">{q.question}</div>
                  <div className="text-xs text-slate-600">by {q.author}</div>
                </div>
                {q.answered && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>

              {q.topAnswer && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 mt-3 text-sm text-slate-700">
                  {q.topAnswer}
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {q.answers}
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" />
                  {q.likes}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}