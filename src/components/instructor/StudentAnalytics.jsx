import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertCircle, Star, MessageCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function StudentAnalytics({ students = [] }) {
  const analyzeStudent = (student) => {
    const completionRate = (student.completed_lessons / student.total_lessons * 100) || 0;
    const avgScore = student.avg_quiz_score || 0;
    const lastActive = student.last_active ? new Date(student.last_active) : null;
    const daysSinceActive = lastActive ? Math.floor((new Date() - lastActive) / (1000 * 60 * 60 * 24)) : 999;
    
    return {
      completionRate,
      avgScore,
      daysSinceActive,
      needsAttention: daysSinceActive > 7 || completionRate < 30 || avgScore < 60,
      isExcelling: completionRate > 80 && avgScore > 85,
      engagement: daysSinceActive < 2 ? 'high' : daysSinceActive < 7 ? 'medium' : 'low'
    };
  };

  const sortedStudents = [...students].sort((a, b) => {
    const aData = analyzeStudent(a);
    const bData = analyzeStudent(b);
    if (aData.needsAttention && !bData.needsAttention) return -1;
    if (!aData.needsAttention && bData.needsAttention) return 1;
    return bData.completionRate - aData.completionRate;
  });

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-serif">
          <div>
            <div className="text-2xl">Student Analytics</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">ניתוח תלמידים</div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {students.length} Talmidim
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedStudents.slice(0, 10).map((student, idx) => {
          const analysis = analyzeStudent(student);
          
          return (
            <motion.div
              key={student.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                analysis.needsAttention 
                  ? 'bg-red-50 border-red-200' 
                  : analysis.isExcelling
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{student.name || student.email}</span>
                    {analysis.isExcelling && (
                      <Star className="w-4 h-4 text-amber-500" />
                    )}
                    {analysis.needsAttention && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {analysis.engagement === 'high' ? '🟢' : analysis.engagement === 'medium' ? '🟡' : '🔴'} 
                      {' '}{analysis.engagement} engagement
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Last active: {analysis.daysSinceActive}d ago
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Completion</span>
                    <span className="font-bold">{Math.round(analysis.completionRate)}%</span>
                  </div>
                  <Progress value={analysis.completionRate} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Avg Score</span>
                    <span className="font-bold">{Math.round(analysis.avgScore)}%</span>
                  </div>
                  <Progress value={analysis.avgScore} className="h-2" />
                </div>
              </div>

              {analysis.needsAttention && (
                <div className="mt-3 p-2 bg-red-100 rounded-lg">
                  <div className="text-xs text-red-800 font-bold">⚠️ Needs Attention</div>
                  <div className="text-xs text-red-700 mt-1">
                    {analysis.daysSinceActive > 7 && '• Inactive for over a week. '}
                    {analysis.completionRate < 30 && '• Low completion rate. '}
                    {analysis.avgScore < 60 && '• Struggling with assessments.'}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}