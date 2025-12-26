import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';

export default function CompletionFunnel({ data }) {
  const funnelStages = [
    { stage: 'Enrolled', count: 500, percentage: 100 },
    { stage: 'Started First Lesson', count: 425, percentage: 85 },
    { stage: 'Completed 25%', count: 350, percentage: 70 },
    { stage: 'Completed 50%', count: 275, percentage: 55 },
    { stage: 'Completed 75%', count: 200, percentage: 40 },
    { stage: 'Completed Course', count: 150, percentage: 30 }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <TrendingDown className="w-5 h-5 text-blue-600" />
          Completion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {funnelStages.map((stage, idx) => (
          <div
            key={idx}
            className="relative"
            style={{ 
              width: `${stage.percentage}%`,
              marginLeft: `${(100 - stage.percentage) / 2}%`
            }}
          >
            <div className="p-4 bg-blue-600 text-white rounded-lg text-center">
              <div className="font-bold text-sm">{stage.stage}</div>
              <div className="text-2xl font-black">{stage.count}</div>
              <div className="text-xs opacity-80">{stage.percentage}%</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}