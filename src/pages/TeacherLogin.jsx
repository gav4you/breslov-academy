import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Video, BarChart3, DollarSign, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeacherLogin() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
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
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white font-serif">Breslov Academy</h1>
              <p className="text-amber-400 font-semibold">For Torah Teachers</p>
            </div>
          </div>

          <h2 className="text-5xl font-black text-white font-serif leading-tight">
            Teach Torah<br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">
              To The World
            </span>
          </h2>

          <p className="text-xl text-slate-300 font-serif leading-relaxed">
            Share your wisdom with thousands of students. Build courses, track progress, 
            and earn from your Torah teachings on the world's premier platform.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              { icon: Video, label: 'Course Creation', color: 'from-blue-500 to-blue-600' },
              { icon: BarChart3, label: 'Analytics', color: 'from-purple-500 to-purple-600' },
              { icon: DollarSign, label: 'Revenue Share', color: 'from-green-500 to-green-600' },
              { icon: Crown, label: 'Premium Tools', color: 'from-amber-500 to-amber-600' }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white font-serif">{item.label}</span>
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
          <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem] bg-white/95">
            <CardContent className="p-10 space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 font-serif mb-2">
                  Teacher Portal
                </h3>
                <p className="text-slate-600 font-serif">
                  Access your instructor dashboard
                </p>
              </div>

              <Button
                onClick={() => base44.auth.redirectToLogin(createPageUrl('InstructorDashboard'))}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-6 rounded-2xl text-lg font-serif hover:shadow-2xl transition-all"
              >
                Sign In as Teacher
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
                onClick={() => window.location.href = createPageUrl('StudentLogin')}
                variant="outline"
                className="w-full py-6 rounded-2xl text-lg font-serif border-2"
              >
                I'm a Student
              </Button>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="text-xs text-amber-900 font-serif text-center">
                  <strong>New Teacher?</strong> Contact us to get instructor access
                </div>
              </div>

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