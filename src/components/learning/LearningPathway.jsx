import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningPathway({ pathway }) {
  const steps = pathway || [
    { title: 'Foundations', completed: true, locked: false },
    { title: 'Intermediate', completed: true, locked: false },
    { title: 'Advanced', completed: false, locked: false },
    { title: 'Mastery', completed: false, locked: true },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black text-slate-900">Your Learning Path</h3>
      <div className="relative">
        <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-200" />
        
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <Card className={`ml-12 ${
                step.completed
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                  : step.locked
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-white border-blue-200'
              } rounded-2xl shadow-md hover:shadow-lg transition-all`}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="absolute left-0 -ml-12 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : step.locked ? (
                        <Lock className="w-6 h-6 text-slate-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-600">
                        {step.completed ? 'Completed' : step.locked ? 'Locked' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  {!step.locked && (
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}