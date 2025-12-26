import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function PomodoroStudy() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer completed
            setIsActive(false);
            if (!isBreak) {
              setSessionsCompleted(sessionsCompleted + 1);
              setIsBreak(true);
              setMinutes(5);
            } else {
              setIsBreak(false);
              setMinutes(25);
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds, isBreak, sessionsCompleted]);

  const totalSeconds = isBreak ? 5 * 60 : 25 * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progressPercent = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  const reset = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-8 text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-black text-slate-900">Pomodoro Timer</h3>
        </div>

        <div className={`relative w-48 h-48 mx-auto rounded-full ${
          isBreak ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'
        } flex items-center justify-center shadow-2xl`}>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <motion.div
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl font-black text-slate-900"
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </motion.div>
          </div>
        </div>

        <div className="text-lg font-bold text-slate-900">
          {isBreak ? 'Break Time' : 'Study Session'}
        </div>

        <Progress value={progressPercent} className="h-2" />

        <div className="flex gap-3">
          <Button
            onClick={() => setIsActive(!isActive)}
            size="lg"
            className={`flex-1 rounded-2xl ${
              isBreak 
                ? 'bg-gradient-to-r from-green-600 to-emerald-700' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-700'
            } text-white`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            size="lg"
            className="rounded-2xl"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-sm text-slate-600">
          Sessions completed today: <span className="font-bold text-slate-900">{sessionsCompleted}</span>
        </div>
      </CardContent>
    </Card>
  );
}