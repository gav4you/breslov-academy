import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookOpen, Trophy, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileNav({ currentPage }) {
  const navItems = [
    { name: 'Home', path: 'Dashboard', icon: Home },
    { name: 'Learn', path: 'Courses', icon: BookOpen },
    { name: 'Challenges', path: 'Challenges', icon: Trophy },
    { name: 'Community', path: 'Community', icon: Users },
    { name: 'Profile', path: 'MyAchievements', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 z-50 md:hidden">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.path;
          
          return (
            <Link key={item.name} to={createPageUrl(item.path)}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-blue-600' : 'text-slate-600'
                }`}
              >
                <div className={`relative ${isActive ? 'text-blue-600' : ''}`}>
                  <Icon className="w-6 h-6" />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                    />
                  )}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : ''}`}>
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}