import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Trophy, Award, Users, Swords } from 'lucide-react';
import { tokens, cx } from '@/components/theme/tokens';

export default function GamificationLayout({ children, title, subtitle }) {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const tabs = [
    { label: 'Leaderboard', icon: Trophy, route: '/leaderboard' },
    { label: 'Achievements', icon: Award, route: '/achievements' },
    { label: 'Study Buddies', icon: Users, route: '/studybuddies' },
    { label: 'Tournaments', icon: Swords, route: '/tournaments' },
  ];

  return (
    <div className={tokens.layout.sectionGap}>
      {/* Header */}
      <div className={cx(tokens.glass.card, "p-8 md:p-12 overflow-hidden bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 border-none")}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left text-white">
            <h1 className={cx(tokens.text.h1, "text-white mb-2")}>{title}</h1>
            <p className="text-amber-100 text-lg max-w-xl">{subtitle}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px]">
              <p className="text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">Your Rank</p>
              <p className="text-3xl font-bold text-white">#42</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center min-w-[100px]">
              <p className="text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">Points</p>
              <p className="text-3xl font-bold text-white">1,250</p>
            </div>
          </div>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      </div>

      {/* Tabs */}
      <div className="border-b border-border/60">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const isActive = currentPath.includes(tab.route.toLowerCase());
            const Icon = tab.icon;
            
            return (
              <Link
                key={tab.route}
                to={createPageUrl(tab.route.substring(1))} // Remove leading slash for utility
                className={cx(
                  "flex items-center gap-2 px-4 py-3 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap border-b-2",
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  );
}