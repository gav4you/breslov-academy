import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Users, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudyGroupChat({ groupId, currentUser }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: 'Moshe',
      text: 'Great shiur today on Likutey Moharan!',
      time: new Date(Date.now() - 120000),
      isOwn: false
    },
    {
      id: 2,
      user: 'You',
      text: 'Yes! The concept of Azamra really resonated with me',
      time: new Date(Date.now() - 60000),
      isOwn: true
    },
    {
      id: 3,
      user: 'David',
      text: 'Can someone share notes from yesterday?',
      time: new Date(),
      isOwn: false
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        user: 'You',
        text: newMessage,
        time: new Date(),
        isOwn: true
      }]);
      setNewMessage('');
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem] h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <div>Study Group Chat</div>
            <div className="text-sm text-slate-600 font-normal">3 members online</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${msg.isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!msg.isOwn && (
                    <div className="text-xs font-bold text-slate-600 mb-1">{msg.user}</div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.isOwn 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                      : 'bg-white border border-slate-200 text-slate-900'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {msg.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-200 bg-white/50">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 rounded-xl"
            />
            <Button
              onClick={sendMessage}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}