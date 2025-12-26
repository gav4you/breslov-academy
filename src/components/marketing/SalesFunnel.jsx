import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function SalesFunnel() {
  const stages = [
    { name: 'Visitors', count: 5000, conversion: 100, icon: Users },
    { name: 'Free Trial Started', count: 1200, conversion: 24, icon: Filter },
    { name: 'Engaged (>3 lessons)', count: 600, conversion: 12, icon: TrendingUp },
    { name: 'Purchased', count: 180, conversion: 3.6, icon: DollarSign }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Filter className="w-5 h-5 text-purple-600" />
          Sales Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          
          return (
            <div
              key={idx}
              className="p-4 bg-white rounded-xl border-2 border-slate-200"
              style={{ 
                width: `${100 - idx * 15}%`,
                marginLeft: `${idx * 7.5}%`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-bold text-slate-900">{stage.name}</div>
                    <div className="text-xs text-slate-600">{stage.conversion}%</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{stage.count}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}