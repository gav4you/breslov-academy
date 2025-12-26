import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Award, Crown, Scroll, Scale, Sparkles, GraduationCap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CareerPaths() {
  const paths = [
    {
      title: 'Torah Scholar',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      description: 'Master the Five Books of Moses, become proficient in Hebrew, and understand deep Torah commentary',
      level: 'Beginner to Advanced',
      duration: '2-3 years',
      skills: ['Hebrew Reading', 'Chumash', 'Rashi', 'Textual Analysis'],
      courses: 12,
      students: 1240
    },
    {
      title: 'Talmud Expert',
      icon: Scroll,
      color: 'from-green-500 to-green-600',
      description: 'Deep dive into Gemara, Mishnah, and Talmudic reasoning. Complete Daf Yomi and master complex legal discussions',
      level: 'Intermediate to Expert',
      duration: '3-5 years',
      skills: ['Aramaic', 'Logic', 'Talmudic Methodology', 'Tosafot'],
      courses: 18,
      students: 890
    },
    {
      title: 'Kabbalah Mystic',
      icon: Sparkles,
      color: 'from-purple-500 to-purple-600',
      description: 'Explore the mystical dimensions of Judaism through Zohar, Sefirot, and esoteric teachings',
      level: 'Advanced',
      duration: '4-6 years',
      skills: ['Zohar Study', 'Meditative Practice', 'Symbolism', 'Mystical Hebrew'],
      courses: 15,
      students: 650
    },
    {
      title: 'Halacha Authority',
      icon: Scale,
      color: 'from-amber-500 to-amber-600',
      description: 'Become well-versed in Jewish law, contemporary applications, and practical halachic decision-making',
      level: 'Intermediate to Expert',
      duration: '3-4 years',
      skills: ['Shulchan Aruch', 'Poskim', 'Legal Reasoning', 'Contemporary Issues'],
      courses: 14,
      students: 780
    },
    {
      title: 'Breslov Chassid',
      icon: Star,
      color: 'from-orange-500 to-red-600',
      description: 'Immerse yourself in the teachings of Rebbe Nachman, practice hitbodedut, and master Likutey Moharan',
      level: 'All Levels',
      duration: '2-4 years',
      skills: ['Likutey Moharan', 'Hitbodedut', 'Simcha Practice', 'Spiritual Growth'],
      courses: 16,
      students: 1520
    },
    {
      title: 'Community Rabbi',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Comprehensive training in all areas of Torah, leadership, counseling, and community guidance',
      level: 'Expert',
      duration: '5-7 years',
      skills: ['All Torah Areas', 'Leadership', 'Public Speaking', 'Pastoral Care'],
      courses: 25,
      students: 340
    },
  ];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] premium-shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-400 rounded-full blur-[140px]" />
          </div>
          
          <div className="relative p-12 md:p-16">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-xl">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight">Torah Learning Paths</h1>
                <p className="text-slate-300 text-xl font-light mt-2">Choose your journey of spiritual mastery</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path, idx) => {
            const Icon = path.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-xl transition-all duration-500 group cursor-pointer h-full rounded-[2.5rem] overflow-hidden">
                  <div className={`h-3 bg-gradient-to-r ${path.color}`} />
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className={`w-16 h-16 bg-gradient-to-br ${path.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 font-bold">
                        {path.level}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                        {path.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {path.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-2xl font-black text-slate-900">{path.courses}</div>
                        <div className="text-xs text-slate-600">Courses</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-2xl font-black text-slate-900">{path.students}</div>
                        <div className="text-xs text-slate-600">Students</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-900 mb-2">Core Skills:</div>
                      <div className="flex flex-wrap gap-2">
                        {path.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} className="bg-blue-100 text-blue-800">
                            {skill}
                          </Badge>
                        ))}
                        {path.skills.length > 3 && (
                          <Badge className="bg-slate-200 text-slate-700">
                            +{path.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
                      <span className="font-medium">Duration: {path.duration}</span>
                    </div>

                    <Button className={`w-full bg-gradient-to-r ${path.color} text-white font-bold py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 btn-premium group`}>
                      <span className="flex items-center justify-center gap-2">
                        Begin Path
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl font-black text-slate-900">Why Choose a Learning Path?</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-4xl">🎯</div>
                  <h3 className="font-bold text-slate-900">Structured Growth</h3>
                  <p className="text-slate-600 text-sm">Follow a proven curriculum designed by Torah scholars</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">📜</div>
                  <h3 className="font-bold text-slate-900">Expert Guidance</h3>
                  <p className="text-slate-600 text-sm">Learn from experienced rabbis and teachers</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">👥</div>
                  <h3 className="font-bold text-slate-900">Community Support</h3>
                  <p className="text-slate-600 text-sm">Connect with fellow learners on the same path</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}