import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InteractiveTimeline({ milestones = [] }) {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const defaultMilestones = [
    {
      id: 1,
      title: 'Course Enrollment',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completed: true,
      description: 'Joined Likutey Moharan study'
    },
    {
      id: 2,
      title: 'First Lesson',
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      completed: true,
      description: 'Completed introduction to Torah 1'
    },
    {
      id: 3,
      title: 'Week 1 Complete',
      date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000),
      completed: true,
      description: 'Finished first 5 lessons'
    },
    {
      id: 4,
      title: 'Midpoint',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      completed: true,
      description: '50% course completion'
    },
    {
      id: 5,
      title: 'Final Assessment',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      completed: false,
      description: 'Complete final quiz'
    },
    {
      id: 6,
      title: 'Certificate Earned',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      completed: false,
      description: 'Receive completion certificate'
    }
  ];

  const activeMilestones = milestones.length > 0 ? milestones : defaultMilestones;

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardContent className="p-8">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-slate-200" />

          <div className="space-y-8">
            {activeMilestones.map((milestone, idx) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-12 cursor-pointer"
                onClick={() => setSelectedMilestone(selectedMilestone?.id === milestone.id ? null : milestone)}
              >
                {/* Timeline dot */}
                <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg ${
                  milestone.completed 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-600' 
                    : 'bg-gradient-to-br from-slate-300 to-slate-400'
                }`}>
                  {milestone.completed ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMilestone?.id === milestone.id
                    ? 'bg-blue-50 border-blue-300'
                    : milestone.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-black text-slate-900">{milestone.title}</div>
                      <div className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        {milestone.date.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <Badge className={milestone.completed ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
                      {milestone.completed ? 'Complete' : 'Upcoming'}
                    </Badge>
                  </div>

                  {selectedMilestone?.id === milestone.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-slate-200"
                    >
                      <p className="text-sm text-slate-700">{milestone.description}</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}