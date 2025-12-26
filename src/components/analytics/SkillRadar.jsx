import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

export default function SkillRadar() {
  const skills = [
    { name: 'Torah', level: 85 },
    { name: 'Talmud', level: 72 },
    { name: 'Kabbalah', level: 60 },
    { name: 'Halacha', level: 78 },
    { name: 'Hebrew', level: 90 },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-red-600" />
          Skill Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {skills.map((skill, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-900">{skill.name}</span>
                <span className="font-medium text-slate-600">{skill.level}%</span>
              </div>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-600 transition-all duration-500"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}