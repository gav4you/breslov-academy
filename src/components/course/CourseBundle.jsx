import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, BookOpen, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CourseBundle({ bundle }) {
  const sampleBundle = {
    name: 'Complete Breslov Mastery',
    courses: [
      'Likutey Moharan - Volume 1',
      'Likutey Moharan - Volume 2',
      'Hebrew Mastery',
      'Talmudic Aramaic'
    ],
    totalValue: 596,
    bundlePrice: 399,
    savings: 197
  };

  const savingsPercent = Math.round((sampleBundle.savings / sampleBundle.totalValue) * 100);

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Package className="w-5 h-5 text-purple-600" />
          Course Bundle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-2xl text-white text-center">
          <div className="text-3xl font-black mb-2">{sampleBundle.name}</div>
          <Badge className="bg-green-600 text-white">
            Save {savingsPercent}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-700">Includes {sampleBundle.courses.length} Courses:</div>
          {sampleBundle.courses.map((course, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-slate-900">{course}</span>
            </div>
          ))}
        </div>

        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 text-center">
          <div className="text-sm text-green-700 mb-2">Bundle Price</div>
          <div className="text-5xl font-black text-slate-900 mb-2">${sampleBundle.bundlePrice}</div>
          <div className="text-sm text-green-800">
            Save ${sampleBundle.savings} (was ${sampleBundle.totalValue})
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl"
        >
          Get Bundle Now
        </Button>
      </CardContent>
    </Card>
  );
}