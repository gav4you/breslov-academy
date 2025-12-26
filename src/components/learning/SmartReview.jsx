import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, RefreshCw, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartReview({ courseId, userProgress }) {
  const [reviewTopics, setReviewTopics] = useState([
    {
      lesson: 'Lesson 3: Understanding Azamra',
      topic: 'Finding the good in everyone',
      lastReviewed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      priority: 'high',
      retention: 62
    },
    {
      lesson: 'Lesson 1: Introduction to Joy',
      topic: 'Mitzvah gedolah concept',
      lastReviewed: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      priority: 'medium',
      retention: 45
    },
    {
      lesson: 'Lesson 5: The Power of Prayer',
      topic: 'Hitbodedut meditation',
      lastReviewed: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      priority: 'critical',
      retention: 38
    }
  ]);

  const priorityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-blue-100 text-blue-800 border-blue-300',
    low: 'bg-green-100 text-green-800 border-green-300'
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Brain className="w-5 h-5 text-purple-600" />
          <div>
            <div>Smart Review</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">חזרה חכמה</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <div className="font-bold text-purple-900 mb-1">AI-Powered Spaced Repetition</div>
              <div className="text-sm text-purple-800">
                Our algorithm identifies concepts you're most likely to forget and schedules optimal review times
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {reviewTopics.map((topic, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl border-2 ${priorityColors[topic.priority]}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Badge className={`${priorityColors[topic.priority]} text-xs mb-2 capitalize`}>
                    {topic.priority} priority
                  </Badge>
                  <div className="font-bold text-slate-900 mb-1">{topic.lesson}</div>
                  <div className="text-sm text-slate-700">{topic.topic}</div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Retention estimate</span>
                  <span className="font-bold">{topic.retention}%</span>
                </div>
                <Progress value={topic.retention} className="h-2" />
              </div>

              <div className="text-xs text-slate-600 mb-3">
                Last reviewed: {topic.lastReviewed.toLocaleDateString()}
              </div>

              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Review Now
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="text-sm text-green-900 font-serif leading-relaxed">
            ✨ <strong>Next review session:</strong> Tomorrow at 9:00 AM for optimal retention
          </div>
        </div>
      </CardContent>
    </Card>
  );
}