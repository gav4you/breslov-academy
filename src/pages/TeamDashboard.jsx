import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Award, BookOpen, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TeamDashboard() {
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

  const { data: team } = useQuery({
    queryKey: ['team', user?.email],
    queryFn: async () => {
      const teams = await base44.entities.Team.filter({ admin_email: user.email });
      return teams[0];
    },
    enabled: !!user?.email
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members', team?.id],
    queryFn: async () => {
      // Get all enrollments for team members
      return [];
    },
    enabled: !!team?.id
  });

  const chartData = [
    { name: 'Week 1', completed: 12 },
    { name: 'Week 2', completed: 18 },
    { name: 'Week 3', completed: 25 },
    { name: 'Week 4', completed: 32 },
  ];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Team Dashboard</h1>
            <p className="text-slate-600 text-lg">Manage your team's learning progress</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl">
            <Plus className="w-5 h-5 mr-2" />
            Add Team Member
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Team Members', value: '24', icon: Users, color: 'from-blue-500 to-blue-600' },
            { label: 'Active Learners', value: '18', icon: TrendingUp, color: 'from-green-500 to-green-600' },
            { label: 'Courses Completed', value: '142', icon: Award, color: 'from-purple-500 to-purple-600' },
            { label: 'Avg Progress', value: '68%', icon: BookOpen, color: 'from-amber-500 to-amber-600' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-effect border-0 premium-shadow rounded-2xl">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Team Learning Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="completed" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Team Members</h3>
            <div className="space-y-3">
              {[1,2,3,4,5].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      M
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Team Member {idx + 1}</div>
                      <div className="text-sm text-slate-600">member{idx + 1}@company.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800">
                      {Math.floor(Math.random() * 50 + 30)}% Complete
                    </Badge>
                    <Button variant="outline" size="sm" className="rounded-xl">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}