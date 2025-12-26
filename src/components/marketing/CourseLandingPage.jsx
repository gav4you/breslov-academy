import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, PlayCircle, Award, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseLandingPage({ course, onEnroll }) {
  const testimonials = [
    { name: 'David Cohen', text: 'This course changed my understanding completely!', rating: 5 },
    { name: 'Sarah Levy', text: 'Clear explanations and excellent structure.', rating: 5 },
    { name: 'Rachel Klein', text: 'Highly recommend to anyone interested in Torah study.', rating: 5 },
  ];

  return (
    <div className="space-y-12">
      {/* Video Preview */}
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem] overflow-hidden">
        <div className="aspect-video bg-gradient-to-br from-slate-900 to-blue-900 relative flex items-center justify-center">
          <PlayCircle className="w-24 h-24 text-white/30" />
          <Button className="absolute bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white">
            <PlayCircle className="w-5 h-5 mr-2" />
            Watch Preview
          </Button>
        </div>
      </Card>

      {/* Benefits */}
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8">
          <h2 className="text-3xl font-black text-slate-900 mb-6">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Lifetime access to all lessons',
              'Downloadable resources',
              'Certificate of completion',
              'Interactive quizzes',
              'Discussion forum',
              'Mobile app access'
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="p-1 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-slate-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Proof */}
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900 mb-2">2,456</div>
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="text-slate-600">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900 mb-2">4.9</div>
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <div className="text-slate-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900 mb-2">98%</div>
              <Award className="w-8 h-8 text-amber-500 mx-auto mb-1" />
              <div className="text-slate-600">Completion Rate</div>
            </div>
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-6">What Students Say</h3>
          <div className="space-y-4">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="flex">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-700">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="glass-effect border-0 premium-shadow-xl rounded-[2rem] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-white/90 mb-6 text-lg">Join thousands of students already learning</p>
          <Button
            onClick={onEnroll}
            className="bg-white text-blue-600 hover:bg-slate-100 font-bold px-8 py-6 rounded-2xl text-lg"
          >
            {course?.price ? `Enroll Now - $${course.price}` : 'Enroll Free'}
          </Button>
        </div>
      </Card>
    </div>
  );
}