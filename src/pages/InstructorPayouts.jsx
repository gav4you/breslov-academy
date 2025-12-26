import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InstructorPayouts() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts', user?.email],
    queryFn: () => base44.entities.InstructorPayout.filter({ instructor_email: user.email }, '-payout_date'),
    enabled: !!user?.email
  });

  const totalEarnings = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  const earningsData = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1800 },
    { month: 'Mar', amount: 2400 },
    { month: 'Apr', amount: 3200 },
    { month: 'May', amount: 4100 },
    { month: 'Jun', amount: 5200 }
  ];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-slate-900 mb-2">Earnings & Payouts</h1>
          <p className="text-slate-600 text-lg">Track your teaching revenue</p>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-effect border-0 premium-shadow rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-slate-600">Total Earnings</div>
              </div>
              <div className="text-4xl font-black text-slate-900">
                ${totalEarnings.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 premium-shadow rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-slate-600">Pending Payout</div>
              </div>
              <div className="text-4xl font-black text-slate-900">
                ${pendingAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 premium-shadow rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-slate-600">This Month</div>
              </div>
              <div className="text-4xl font-black text-slate-900">
                ${earningsData[earningsData.length - 1].amount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Revenue Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Payout History</h3>
            <div className="space-y-3">
              {payouts.map((payout, idx) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl"
                >
                  <div>
                    <div className="font-bold text-slate-900">${payout.amount}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(payout.payout_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={
                      payout.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {payout.status}
                    </Badge>
                    {payout.status === 'paid' && (
                      <Button size="sm" variant="outline" className="rounded-xl">
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}