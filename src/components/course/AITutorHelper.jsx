import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, BookOpen, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

export default function AITutorHelper({ lessonContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Shalom! I\'m your AI Torah study assistant. Ask me anything about this lesson, request explanations, or explore deeper meanings.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'Explain this concept simply',
    'How does this apply today?',
    'What\'s the deeper meaning?',
    'Give me a practical example'
  ];

  const sendMessage = async (text) => {
    const userMessage = text || input;
    if (!userMessage.trim()) return;

    setMessages([...messages, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Torah study AI tutor specializing in Breslov teachings. 
        Lesson context: ${lessonContext}
        Student question: ${userMessage}
        Provide a clear, educational response that deepens understanding.`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, I\'m having trouble responding right now. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem] h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-black text-slate-900">AI Study Assistant</h3>
            <p className="text-xs text-slate-600" dir="rtl">עוזר לימוד AI</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                  : 'bg-white border border-slate-200 text-slate-900'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {quickQuestions.map((q, idx) => (
              <Button
                key={idx}
                onClick={() => sendMessage(q)}
                variant="outline"
                size="sm"
                className="rounded-lg text-xs"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {q}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 rounded-xl"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}