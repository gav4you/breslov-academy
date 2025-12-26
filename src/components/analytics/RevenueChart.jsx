import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';

export default function RevenueChart({ data }) {
  const totalRevenue = data?.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const growth = data?.length > 1 ? ((data[data.length - 1].revenue - data[0].revenue) / data[0].revenue * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <div className="flex items-center space-x-4 text-sm text-slate-600 mt-2">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            <span className="font-bold text-2xl text-slate-900">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{growth}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}