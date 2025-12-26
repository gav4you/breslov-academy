import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Mic, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConversationSimulator({ conversation, onComplete }) {
  const [currentLine, setCurrentLine] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const dialogue = conversation?.dialogue || [];
  const line = dialogue[currentLine];

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      speechSynthesis.speak(utterance);
    }
  };

  const handleResponse = (response) => {
    setSelectedResponse(response);
    setTimeout(() => {
      if (currentLine < dialogue.length - 1) {
        setCurrentLine(currentLine + 1);
        setSelectedResponse(null);
      } else {
        onComplete();
      }
    }, 1500);
  };

  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      handleResponse('recorded');
    }, 2000);
  };

  if (!line) return null;

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">{conversation.conversation_title}</CardTitle>
          <Badge className="bg-purple-100 text-purple-800">
            {currentLine + 1} / {dialogue.length}
          </Badge>
        </div>
        <p className="text-slate-600">{conversation.scenario}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Dialogue */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLine}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Character speaking */}
            <div className={`flex items-start gap-4 ${line.speaker === 'you' ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">
                {line.speaker === 'you' ? '🧑' : '👤'}
              </div>
              <div className={`flex-1 space-y-2 ${line.speaker === 'you' ? 'text-right' : ''}`}>
                <div className="font-bold text-slate-900">{line.speaker === 'you' ? 'You' : line.speaker}</div>
                <Card className={`${line.speaker === 'you' ? 'bg-blue-100' : 'bg-white'}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-2xl font-bold" dir="rtl">{line.hebrew}</div>
                    <div className="text-slate-600">{line.transliteration}</div>
                    <div className="text-slate-500 italic">{line.translation}</div>
                  </CardContent>
                </Card>
                <Button onClick={() => playAudio(line.transliteration)} variant="ghost" size="sm">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen
                </Button>
              </div>
            </div>

            {/* Response Options */}
            {line.responses && (
              <div className="space-y-3">
                <div className="text-sm font-bold text-slate-700">Choose your response:</div>
                {line.responses.map((response, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleResponse(response)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedResponse === response
                        ? 'bg-green-100 border-green-500'
                        : 'bg-white border-slate-200 hover:border-blue-500'
                    }`}
                  >
                    <div className="font-bold text-slate-900" dir="rtl">{response.hebrew}</div>
                    <div className="text-sm text-slate-600">{response.translation}</div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Speaking Practice */}
            {line.speaking_practice && (
              <div className="space-y-3">
                <div className="text-sm font-bold text-slate-700">Try speaking this phrase:</div>
                <Button
                  onClick={startRecording}
                  disabled={isRecording}
                  size="lg"
                  className={`w-full rounded-2xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white`}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {isRecording ? 'Recording...' : 'Speak Now'}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Cultural Note */}
        {conversation.cultural_notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-amber-600 mt-1" />
              <div>
                <div className="font-bold text-amber-900 mb-1">Cultural Note</div>
                <div className="text-sm text-amber-800">{conversation.cultural_notes}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}