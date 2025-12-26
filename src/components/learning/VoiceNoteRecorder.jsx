import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoiceNoteRecorder({ onSave }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-red-600" />
          <h3 className="font-black text-slate-900">Voice Notes</h3>
          <span className="text-sm text-slate-600" dir="rtl">הערות קוליות</span>
        </div>

        {!audioURL ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <motion.div
                animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-500 to-red-600' 
                    : 'bg-gradient-to-br from-slate-200 to-slate-300'
                }`}>
                  <Mic className={`w-12 h-12 ${isRecording ? 'text-white' : 'text-slate-600'}`} />
                </div>
              </motion.div>
              
              {isRecording && (
                <div className="text-2xl font-black text-red-600 mb-2">
                  {formatTime(duration)}
                </div>
              )}
              
              <div className="text-slate-600">
                {isRecording ? 'Recording in progress...' : 'Ready to record'}
              </div>
            </div>

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
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Play className="w-6 h-6 text-blue-600" />
                <div className="text-sm font-bold text-slate-900">
                  Recording ready ({formatTime(duration)})
                </div>
              </div>
              <audio src={audioURL} controls className="w-full" />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAudioURL(null);
                  setDuration(0);
                }}
                className="flex-1 rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Discard
              </Button>
              <Button
                onClick={() => onSave?.(audioURL)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Note
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}