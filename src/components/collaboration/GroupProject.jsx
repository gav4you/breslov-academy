import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Upload, MessageCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function GroupProject({ projectId }) {
  const project = {
    title: 'Breslov Teachings Presentation',
    members: ['You', 'Moshe L.', 'David K.', 'Sarah M.'],
    tasks: [
      { name: 'Research', assignee: 'You', status: 'completed' },
      { name: 'Script Writing', assignee: 'Moshe L.', status: 'in_progress' },
      { name: 'Slides Design', assignee: 'David K.', status: 'pending' },
      { name: 'Final Review', assignee: 'Sarah M.', status: 'pending' }
    ],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };

  const completedTasks = project.tasks.filter(t => t.status === 'completed').length;
  const progress = (completedTasks / project.tasks.length) * 100;

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Users className="w-5 h-5 text-purple-600" />
          Group Project
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-2xl font-black text-slate-900 mb-2">{project.title}</div>
          <div className="text-sm text-slate-600">
            Due: {project.dueDate.toLocaleDateString()}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-bold text-slate-700">Overall Progress</span>
            <span className="text-slate-900">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-700">Tasks</div>
          {project.tasks.map((task, idx) => (
            <div key={idx} className={`p-3 rounded-xl border ${
              task.status === 'completed' 
                ? 'bg-green-50 border-green-200' 
                : task.status === 'in_progress'
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{task.name}</div>
                  <div className="text-xs text-slate-600">{task.assignee}</div>
                </div>
                <Badge className={
                  task.status === 'completed' ? 'bg-green-600 text-white' :
                  task.status === 'in_progress' ? 'bg-blue-600 text-white' :
                  'bg-slate-400 text-white'
                }>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-xl">
            <MessageCircle className="w-4 h-4 mr-2" />
            Team Chat
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}