import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Star, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentLogin() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user.role === 'admin') {
          window.location.href = createPageUrl('InstructorDashboard');
        } else {
          window.location.href = createPageUrl('Dashboard');
        }
      } catch (error) {
        // Not logged in, show login page
      }
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl shadow-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 font-serif">Breslov Academy</h1>
              <p className="text-amber-600 font-semibold">Torah of Rebbe Nachman</p>
            </div>
          </div>

          <h2 className="text-5xl font-black text-slate-900 font-serif leading-tight">
            Begin Your<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Torah Journey
            </span>
          </h2>

          <p className="text-xl text-slate-600 font-serif leading-relaxed">
            Access world-class Torah education from the greatest Breslov teachers. 
            Learn at your own pace with our premium learning platform.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { icon: Star, label: 'Premium Courses' },
              { icon: Users, label: 'Study Groups' },
              { icon: Award, label: 'Certificates' },
              { icon: BookOpen, label: 'Unlimited Access' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200"
                >
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-slate-700 font-serif">{item.label}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right side - Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
            <CardContent className="p-10 space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 font-serif mb-2">
                  Student Portal
                </h3>
                <p className="text-slate-600 font-serif">
                  Sign in to continue your learning
                </p>
              </div>

              <Button
                onClick={() => base44.auth.redirectToLogin(createPageUrl('Dashboard'))}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-6 rounded-2xl text-lg font-serif hover:shadow-2xl transition-all"
              >
                Sign In as Student
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-serif">or</span>
                </div>
              </div>

              <Button
                onClick={() => window.location.href = createPageUrl('TeacherLogin')}
                variant="outline"
                className="w-full py-6 rounded-2xl text-lg font-serif border-2"
              >
                I'm a Teacher
              </Button>

              <div className="text-center text-xs text-slate-500 font-serif">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}