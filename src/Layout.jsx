import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { BookOpen, GraduationCap, TrendingUp, Crown, Menu, X, LogOut, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/theme/ThemeToggle';
import NotificationCenter from '@/components/notifications/NotificationCenter';

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

  const navigation = [
    { name: 'Dashboard', path: 'Dashboard', icon: BookOpen },
    { name: 'Talmud', path: 'TalmudStudy', icon: BookOpen },
    { name: 'Torah', path: 'TorahStudy', icon: Menu },
    { name: 'Kabbalah', path: 'KabbalahStudy', icon: Crown },
    { name: 'Halacha', path: 'HalachaGuide', icon: Menu },
  ];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-xl border-b border-white/10 premium-shadow-lg sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-amber-400/60 transition-all group-hover:scale-110 group-hover:rotate-6 duration-300">
                <BookOpen className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Breslov Academy</h1>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/95 backdrop-blur-xl border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-slate-300 font-semibold mb-2">
              © 2024 Breslov Academy • Spreading the Torah of Rebbe Nachman of Breslov
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