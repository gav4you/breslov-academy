import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageCircle, ThumbsUp, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function QASection({ lessonId, questions, userEmail, instructorEmail }) {
  const [newQuestion, setNewQuestion] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const queryClient = useQueryClient();

  const askQuestionMutation = useMutation({
    mutationFn: () => base44.entities.Discussion.create({
      lesson_id: lessonId,
      user_email: userEmail,
      content: newQuestion,
      discussion_type: 'question',
      upvotes: 0,
      is_answered: false
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      setNewQuestion('');
    }
  });

  const replyMutation = useMutation({
    mutationFn: () => base44.entities.Comment.create({
      discussion_id: replyTo.id,
      user_email: userEmail,
      content: replyText
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
      setReplyTo(null);
      setReplyText('');
    }
  });

  const upvoteMutation = useMutation({
    mutationFn: (question) => base44.entities.Discussion.update(question.id, {
      upvotes: (question.upvotes || 0) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
    }
  });

  const markAnsweredMutation = useMutation({
    mutationFn: (questionId) => base44.entities.Discussion.update(questionId, {
      is_answered: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions']);
    }
  });

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Questions & Answers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ask Question */}
        <div className="p-4 bg-blue-50 rounded-xl space-y-3">
          <Textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question about this lesson..."
            className="rounded-xl bg-white"
            rows={3}
          />
          <Button
            onClick={() => askQuestionMutation.mutate()}
            disabled={!newQuestion.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <AnimatePresence>
            {questions?.map((question, idx) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {question.user_name?.[0] || 'S'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{question.user_name || 'Student'}</span>
                        {question.is_answered && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Answered
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-700">{question.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <button
                          onClick={() => upvoteMutation.mutate(question)}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {question.upvotes || 0}
                        </button>
                        <button
                          onClick={() => setReplyTo(question)}
                          className="hover:text-blue-600 transition-colors"
                        >
                          Reply
                        </button>
                        {userEmail === instructorEmail && !question.is_answered && (
                          <button
                            onClick={() => markAnsweredMutation.mutate(question.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Mark as Answered
                          </button>
                        )}
                      </div>

                      {/* Reply Form */}
                      {replyTo?.id === question.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 space-y-2"
                        >
                          <Textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your answer..."
                            className="rounded-xl"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => replyMutation.mutate()}
                              disabled={!replyText.trim()}
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
                            >
                              Submit Reply
                            </Button>
                            <Button
                              onClick={() => setReplyTo(null)}
                              size="sm"
                              variant="outline"
                              className="rounded-xl"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      {/* Replies */}
                      {question.replies?.map((reply, rIdx) => (
                        <div key={rIdx} className="mt-3 ml-6 p-3 bg-slate-50 rounded-xl">
                          <div className="font-bold text-sm text-slate-900 mb-1">
                            {reply.user_name}
                            {reply.user_email === instructorEmail && (
                              <Badge className="ml-2 bg-purple-100 text-purple-800">Instructor</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-700">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}