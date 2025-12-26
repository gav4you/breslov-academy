import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Brain } from 'lucide-react';

export default function SkillRadarChart({ userSkills }) {
  const skills = [
    { subject: 'Torah', A: userSkills?.torah || 65, fullMark: 100 },
    { subject: 'Talmud', A: userSkills?.talmud || 72, fullMark: 100 },
    { subject: 'Kabbalah', A: userSkills?.kabbalah || 58, fullMark: 100 },
    { subject: 'Halacha', A: userSkills?.halacha || 80, fullMark: 100 },
    { subject: 'Hebrew', A: userSkills?.hebrew || 85, fullMark: 100 },
    { subject: 'Aramaic', A: userSkills?.aramaic || 45, fullMark: 100 }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Brain className="w-5 h-5 text-purple-600" />
          <div>
            <div>Knowledge Mastery</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">שליטה בחומר</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={skills}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              stroke="#64748b"
              tick={{ fill: '#475569', fontWeight: 'bold' }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" />
            <Radar 
              dataKey="A" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.6}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {skills.map((skill, idx) => (
            <div key={idx} className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-xs text-slate-600 mb-1">{skill.subject}</div>
              <div className="text-lg font-black text-purple-600">{skill.A}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}