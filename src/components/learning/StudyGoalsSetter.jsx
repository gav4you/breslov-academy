import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function StudyGoalsSetter({ userGoals = [], onSave }) {
  const [goals, setGoals] = useState(userGoals);
  const [newGoal, setNewGoal] = useState({
    type: 'daily',
    target: '',
    metric: 'lessons'
  });

  const goalTemplates = [
    { label: 'Complete 1 lesson daily', type: 'daily', target: 1, metric: 'lessons' },
    { label: 'Study 30 minutes daily', type: 'daily', target: 30, metric: 'minutes' },
    { label: 'Finish 1 course this month', type: 'monthly', target: 1, metric: 'courses' },
    { label: 'Master 20 vocabulary words weekly', type: 'weekly', target: 20, metric: 'words' },
    { label: 'Maintain 7-day streak', type: 'streak', target: 7, metric: 'days' }
  ];

  const addGoal = (goal) => {
    const newGoalObj = {
      ...goal,
      id: Date.now(),
      current: 0,
      completed: false,
      startDate: new Date().toISOString()
    };
    setGoals([...goals, newGoalObj]);
    onSave?.([...goals, newGoalObj]);
  };

  const deleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    onSave?.(updated);
  };

  const getProgressPercent = (goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Target className="w-5 h-5 text-green-600" />
          <div>
            <div>Learning Goals</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">יעדי לימוד</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Templates */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Quick Goals</label>
          <div className="flex flex-wrap gap-2">
            {goalTemplates.map((template, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => addGoal(template)}
                className="rounded-xl text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Goals */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-slate-700">Active Goals</label>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No goals set yet</p>
              <p className="text-sm">Set goals to stay motivated</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = getProgressPercent(goal);
              const isCompleted = progress >= 100;
              
              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">
                          {goal.target} {goal.metric} {goal.type === 'daily' ? 'per day' : goal.type === 'weekly' ? 'per week' : 'per month'}
                        </span>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 text-xs capitalize">
                        {goal.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Progress</span>
                      <span className="font-bold">
                        {goal.current} / {goal.target} {goal.metric}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Custom Goal Form */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="text-sm font-bold text-slate-700">Create Custom Goal</label>
          <div className="grid grid-cols-3 gap-2">
            <Select value={newGoal.type} onValueChange={(v) => setNewGoal({...newGoal, type: v})}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Target"
              value={newGoal.target}
              onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
              className="rounded-lg"
            />
            <Select value={newGoal.metric} onValueChange={(v) => setNewGoal({...newGoal, metric: v})}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lessons">Lessons</SelectItem>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="courses">Courses</SelectItem>
                <SelectItem value="words">Words</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              if (newGoal.target) {
                addGoal({ ...newGoal, target: parseInt(newGoal.target) });
                setNewGoal({ type: 'daily', target: '', metric: 'lessons' });
              }
            }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}