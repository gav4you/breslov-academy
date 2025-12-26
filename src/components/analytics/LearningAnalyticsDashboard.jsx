import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Clock, Target, Award, Flame, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningAnalyticsDashboard({ userEmail, courseId }) {
  const weeklyActivity = [
    { day: 'Mon', hours: 2.5, lessons: 3 },
    { day: 'Tue', hours: 3.2, lessons: 4 },
    { day: 'Wed', hours: 1.8, lessons: 2 },
    { day: 'Thu', hours: 4.1, lessons: 5 },
    { day: 'Fri', hours: 2.9, lessons: 3 },
    { day: 'Sat', hours: 5.5, lessons: 6 },
    { day: 'Sun', hours: 3.3, lessons: 4 }
  ];

  const skillsRadar = [
    { skill: 'Torah', score: 85 },
    { skill: 'Talmud', score: 72 },
    { skill: 'Kabbalah', score: 68 },
    { skill: 'Halacha', score: 78 },
    { skill: 'Hebrew', score: 90 }
  ];

  const learningStyle = [
    { name: 'Visual', value: 35 },
    { name: 'Auditory', value: 25 },
    { name: 'Reading', value: 30 },
    { name: 'Kinesthetic', value: 10 }
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  const stats = [
    { label: 'Study Streak', value: '12 days', icon: Flame, color: 'from-orange-500 to-red-600' },
    { label: 'Total Hours', value: '148h', icon: Clock, color: 'from-blue-500 to-blue-600' },
    { label: 'Avg Score', value: '87%', icon: Target, color: 'from-green-500 to-green-600' },
    { label: 'Completion', value: '76%', icon: Award, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="glass-effect border-0 premium-shadow rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-xs text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Weekly Study Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Radar */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Knowledge Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={skillsRadar}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" stroke="#64748b" />
                <PolarRadiusAxis stroke="#64748b" />
                <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Learning Style */}
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardHeader>
          <CardTitle>Your Learning Style Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={learningStyle}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {learningStyle.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {learningStyle.map((style, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[idx] }}
                    />
                    <span className="text-slate-700">{style.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{style.value}%</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  We adapt content delivery based on your learning preferences to optimize retention and engagement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}