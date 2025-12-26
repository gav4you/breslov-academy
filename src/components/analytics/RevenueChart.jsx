import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';

export default function RevenueChart() {
  const monthlyData = [
    { month: 'Jul', revenue: 4200, students: 12 },
    { month: 'Aug', revenue: 5800, students: 18 },
    { month: 'Sep', revenue: 7200, students: 24 },
    { month: 'Oct', revenue: 8900, students: 31 },
    { month: 'Nov', revenue: 11200, students: 38 },
    { month: 'Dec', revenue: 14500, students: 47 }
  ];

  const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = Math.round(totalRevenue / monthlyData.length);

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <DollarSign className="w-5 h-5 text-green-600" />
            Revenue Analytics
          </div>
          <Badge className="bg-green-100 text-green-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            +34% growth
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
            <div className="text-3xl font-black text-green-600">${totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-slate-600">Total Revenue</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <div className="text-3xl font-black text-blue-600">${avgRevenue.toLocaleString()}</div>
            <div className="text-xs text-slate-600">Monthly Avg</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-slate-700 mb-3">Revenue Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="text-sm font-bold text-slate-700 mb-3">Student Growth</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="students" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}