import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Clock, Award, Play } from 'lucide-react';

export default function CourseLandingPage({ course }) {
  const sampleCourse = {
    title: 'Master Likutey Moharan',
    subtitle: 'Deep dive into Rebbe Nachman\'s core teachings',
    rating: 4.9,
    students: 1247,
    duration: 24,
    instructor: 'Rabbi Cohen',
    price: 199,
    highlights: [
      '24 comprehensive video lessons',
      'Downloadable study guides',
      'Hebrew & Aramaic resources',
      'Certificate of completion',
      'Lifetime access'
    ]
  };

  return (
    <div className="space-y-12">
      <div className="relative overflow-hidden rounded-[3rem] premium-shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950" />
        <div className="relative p-16 text-white">
          <div className="max-w-4xl">
            <Badge className="bg-amber-500 text-white mb-4">Bestseller</Badge>
            <h1 className="text-6xl font-black mb-4">{sampleCourse.title}</h1>
            <p className="text-2xl text-blue-200 mb-6">{sampleCourse.subtitle}</p>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="font-bold">{sampleCourse.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{sampleCourse.students} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{sampleCourse.duration} hours</span>
              </div>
            </div>

            <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl px-12 py-6 text-xl">
              <Play className="w-6 h-6 mr-3" />
              Enroll Now - ${sampleCourse.price}
            </Button>
          </div>
        </div>
      </div>

      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8">
          <h2 className="text-3xl font-black text-slate-900 mb-6">What You'll Learn</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sampleCourse.highlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Award className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">{highlight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}