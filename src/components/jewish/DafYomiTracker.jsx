import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DafYomiTracker({ userProgress = 0 }) {
  const totalDapim = 2711; // Total pages in Shas
  const currentCycle = Math.floor(userProgress / totalDapim) + 1;
  const currentDaf = (userProgress % totalDapim) || 1;
  const progressPercent = (currentDaf / totalDapim) * 100;

  const masechtos = {
    current: 'Berachot',
    currentHebrew: 'ברכות',
    dafInMasechta: currentDaf,
    totalDafim: 64
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <div>
            <div>Daf Yomi Journey</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">מסע הדף היומי</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-2xl text-white">
          <div className="text-sm opacity-80 mb-2">Current Masechta</div>
          <div className="text-3xl font-black mb-1">{masechtos.current}</div>
          <div className="text-2xl text-blue-300 font-serif" dir="rtl">{masechtos.currentHebrew}</div>
          <div className="mt-4 text-sm">
            Daf {masechtos.dafInMasechta} of {masechtos.totalDafim}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold text-slate-700">
            <span>Shas Progress</span>
            <span>{currentDaf} / {totalDapim}</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="text-xs text-slate-600">
            Cycle {currentCycle} • {Math.round(progressPercent)}% Complete
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{currentDaf}</div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
            <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{totalDapim - currentDaf}</div>
            <div className="text-xs text-slate-600">Remaining</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-200">
            <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{currentCycle}</div>
            <div className="text-xs text-slate-600">Cycles</div>
          </div>
        </div>

        <Link to={createPageUrl('TalmudStudy')}>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-4 rounded-xl">
            Continue Learning
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}