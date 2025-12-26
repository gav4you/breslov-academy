import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import Specialization from '../components/specializations/Specialization';

export default function Specializations() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['all-courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const specializations = [
    {
      id: 1,
      name: 'Torah Scholar Specialization',
      description: 'Master the Five Books of Moses with comprehensive study of text, commentary, and interpretation',
      courseIds: courses.filter(c => c.category === 'Torah').slice(0, 5).map(c => c.id)
    },
    {
      id: 2,
      name: 'Talmud Expert Specialization',
      description: 'Deep dive into Talmudic reasoning, Mishnah, and Gemara across multiple tractates',
      courseIds: courses.filter(c => c.category === 'Talmud').slice(0, 6).map(c => c.id)
    },
    {
      id: 3,
      name: 'Kabbalah Mystic Specialization',
      description: 'Explore Jewish mysticism through Zohar, Sefirot, and esoteric teachings',
      courseIds: courses.filter(c => c.category === 'Kabbalah').slice(0, 4).map(c => c.id)
    },
    {
      id: 4,
      name: 'Halachic Authority Specialization',
      description: 'Comprehensive training in Jewish law and contemporary halachic issues',
      courseIds: courses.filter(c => c.category === 'Halacha').slice(0, 5).map(c => c.id)
    }
  ];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900">Specializations</h1>
              <p className="text-xl text-slate-600">Multi-course programs leading to professional credentials</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {specializations.map((spec, idx) => {
            const specCourses = courses.filter(c => spec.courseIds.includes(c.id));
            
            return (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Specialization
                  specialization={spec}
                  courses={specCourses}
                  progress={userProgress}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}