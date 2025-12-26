import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Send, Pause, Play, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function VoiceMessageSender({ recipient, onSend }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration] = useState(0);

  const startRecording = () => {
    setIsRecording(true);
    // In production, implement actual audio recording
    const interval = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioBlob({ url: 'mock-url', duration });
  };

  const sendVoice = () => {
    onSend?.(audioBlob, recipient);
    setAudioBlob(null);
    setDuration(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900">Voice Message</h3>
            <p className="text-sm text-slate-600">to {recipient?.name}</p>
          </div>
          {isRecording && (
            <Badge className="bg-red-100 text-red-800 animate-pulse">
              Recording
            </Badge>
          )}
        </div>

        {!audioBlob ? (
          <div className="text-center space-y-4">
            <motion.div
              animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
                isRecording 
                  ? 'bg-gradient-to-br from-red-500 to-red-600' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}
            >
              <Mic className="w-16 h-16 text-white" />
            </motion.div>

            {isRecording && (
              <div className="text-3xl font-black text-slate-900">
                {formatTime(duration)}
              </div>
            )}

            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={`w-full rounded-2xl ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Record Message
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-slate-900">Voice Note Ready</span>
                </div>
                <span className="text-sm text-slate-600">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAudioBlob(null);
                  setDuration(0);
                }}
                className="flex-1 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Discard
              </Button>
              <Button
                onClick={sendVoice}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to {recipient?.name}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}