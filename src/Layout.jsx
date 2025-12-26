import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { BookOpen, Menu, X, LogOut, Crown, GraduationCap, BarChart3, MessageCircle, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/theme/ThemeToggle';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import SkipToContent from '@/components/accessibility/SkipToContent';
import { motion } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const isInstructor = user?.role === 'admin'; // Instructors are admins

  const navigation = isInstructor ? [
    { name: 'Dashboard', path: 'Dashboard', icon: BookOpen },
    { name: 'Teach', path: 'InstructorDashboard', icon: GraduationCap },
    { name: 'Analytics', path: 'InstructorAnalytics', icon: BarChart3 },
    { name: 'Messages', path: 'TeacherMessaging', icon: MessageCircle },
  ] : [
    { name: 'Dashboard', path: 'Dashboard', icon: BookOpen },
    { name: 'Seder Halimud', path: 'SederPaths', icon: BookOpen },
    { name: 'My Learning', path: 'MyLearning', icon: FileText },
    { name: 'Marketplace', path: 'Marketplace', icon: Award },
  ];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <SkipToContent />
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-xl border-b border-white/10 premium-shadow-lg sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl(user?.role === 'admin' ? 'InstructorDashboard' : 'Dashboard')} className="flex items-center space-x-3 group">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 6 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-amber-400/60 transition-all duration-300"
              >
                <BookOpen className="w-7 h-7 text-white drop-shadow-lg" />
              </motion.div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Breslov Academy</h1>
                <p className="text-xs text-amber-400 font-semibold">Torah of Rebbe Nachman</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl font-bold scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-white/10 font-semibold hover:scale-105 hover:shadow-lg'
                    }`}

                                  >
                                    <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                                    <span className="text-sm">{item.name}</span>
                                    {isActive && (
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                                    )}
                                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user && (
                <>
                  <NotificationCenter user={user} />
                  <ThemeToggle userEmail={user.email} />
                  <div className="text-right ml-2">
                    <p className="text-sm font-medium text-white">{user.full_name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => base44.auth.logout()}
                    className="text-slate-400 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.path;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.path)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive
                        ? 'bg-amber-500 text-slate-900'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              {user && (
                <button
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Learn</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Torah</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Talmud</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Kabbalah</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Halacha</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Study Groups</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Forums</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Events</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Teachers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Library</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Audio Shiurim</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Video Lessons</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Downloads</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Donate</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center border-t border-white/10 pt-8">
            <p className="text-slate-300 font-semibold mb-2">
              © 2025 Breslov Academy • Spreading the Torah of Rebbe Nachman of Breslov
            </p>
            <p className="text-slate-400 italic">
              "It is a great mitzvah to always be happy" - Likutey Moharan II:24
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}