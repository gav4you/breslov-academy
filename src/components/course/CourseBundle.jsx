import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, BookOpen, Clock, Star, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseBundle({ bundle, courses, onEnroll }) {
  const totalPrice = courses?.reduce((sum, c) => sum + (c.price || 0), 0) || 0;
  const discount = bundle.discount_percentage || 0;
  const bundlePrice = totalPrice * (1 - discount / 100);
  const savings = totalPrice - bundlePrice;

  return (
    <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-xl transition-all rounded-[2rem] overflow-hidden">
      <div className="h-3 bg-gradient-to-r from-purple-500 to-pink-600" />
      <CardContent className="p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <Badge className="bg-purple-100 text-purple-800 mb-2">Bundle Deal</Badge>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{bundle.name}</h3>
            <p className="text-slate-600">{bundle.description}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600">Regular Price:</span>
            <span className="text-slate-400 line-through">${totalPrice}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900">Bundle Price:</span>
            <span className="text-3xl font-black text-purple-600">${bundlePrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingDown className="w-4 h-4" />
            <span className="font-bold">Save ${savings.toFixed(2)} ({discount}% off)</span>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-3">Includes {courses?.length || 0} Courses:</h4>
          <div className="space-y-2">
            {courses?.map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white rounded-xl"
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="flex-1 text-sm text-slate-700">{course.title}</span>
                <Badge variant="outline">${course.price}</Badge>
              </motion.div>
            ))}
          </div>
        </div>

        <Button
          onClick={onEnroll}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-6 rounded-2xl"
        >
          Enroll in Bundle
        </Button>
      </CardContent>
    </Card>
  );
}