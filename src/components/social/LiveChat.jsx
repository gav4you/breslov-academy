import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveChat({ viewers = 42 }) {
  const [messages, setMessages] = useState([
    { user: 'Sarah', message: 'Great explanation!', time: '2m ago' },
    { user: 'David', message: 'Can you repeat that?', time: '1m ago' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { user: 'You', message: input, time: 'Just now' }]);
      setInput('');
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem] h-[500px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Live Chat
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-600" />
            <span className="font-bold text-slate-900">{viewers}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-sm">{msg.user}</span>
                  <span className="text-xs text-slate-500">{msg.time}</span>
                </div>
                <p className="text-slate-700 text-sm">{msg.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Send a message..."
            className="flex-1 rounded-xl"
          />
          <Button
            onClick={sendMessage}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}