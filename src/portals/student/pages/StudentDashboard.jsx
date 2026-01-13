import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db } from '@/lib/db';
import { getZmanim } from '@/utils/jewishCalc';
import { getRank, formatXP } from '@/components/gamification/gamificationEngine';
import { tokens, cx } from '@/components/theme/tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Flame, 
  Play, 
  ArrowRight, 
  Trophy,
  Sun,
  Moon,
  Star
} from 'lucide-react';
import CourseCard from '@/components/courses/CourseCard';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Boker Tov';
  if (hour < 17) return 'Tzaharaim Tovim';
  if (hour < 21) return 'Erev Tov';
  return 'Laila Tov';
}

function ZmanimWidget() {
  const [times, setTimes] = useState(getZmanim(new Date()));
  const [nextZman, setNextZman] = useState({ label: '', time: '' });

  useEffect(() => {
    // In a real app, calculate time delta to find "Next"
    // For now, just show sunset as the anchor
    setNextZman({ label: 'Sunset', time: times.sunset });
  }, [times]);

  return (
    <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-2 opacity-10">
        <Clock className="w-32 h-32" />
      </div>
      <CardContent className="p-4 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-medium uppercase tracking-wider text-indigo-300">Jewish Time</div>
          <Badge variant="outline" className="border-indigo-400 text-indigo-200 bg-indigo-950/50">Jerusalem</Badge>
        </div>
        <div className="text-2xl font-serif font-bold mb-1">{nextZman.time}</div>
        <div className="text-xs text-indigo-200">Upcoming: {nextZman.label}</div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-indigo-950/50 p-2 rounded flex items-center justify-between">
            <span className="text-indigo-300">Netz</span>
            <span>{times.sunrise}</span>
          </div>
          <div className="bg-indigo-950/50 p-2 rounded flex items-center justify-between">
            <span className="text-indigo-300">Chatzot</span>
            <span>{times.chatzot}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [rank, setRank] = useState({ name: 'Initiate', icon: '🌱' });

  // Load User Data
  useEffect(() => {
    db.getUser().then(u => {
      setUser(u);
      if (u?.xp) setRank(getRank(u.xp));
    });
  }, []);

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => db.list('Course'), // Use universal list
  });

  // Calculate stats (Mocked for now until progress table is populated)
  const stats = { completed: 12, inProgress: 3, streak: user?.streak || 0 };

  return (
    <div className={tokens.layout.sectionGap}>
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome & Main Action */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {getGreeting()}, {user?.name || 'Student'}
              </h1>
              <p className="text-slate-500 mt-1">Ready to continue your studies?</p>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-full border shadow-sm pr-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                {rank.icon}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Rank</p>
                <p className="text-sm font-bold text-slate-800">{rank.name}</p>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2" />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">XP</p>
                <p className="text-sm font-bold text-indigo-600">{formatXP(user?.xp || 0)}</p>
              </div>
            </div>
          </div>

          {/* Primary Action Card (Next Lesson) */}
          <Card className="bg-white border-l-4 border-l-primary shadow-md overflow-hidden relative group cursor-pointer hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                    Up Next
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    The Power of Tefillah
                  </h2>
                  <p className="text-slate-500 mb-6 max-w-lg">
                    Continue exactly where you left off in Lesson 4: "Hitbodedut Basics"
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      Resume
                    </Button>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      15 min remaining
                    </div>
                  </div>
                </div>
                
                {/* Visual Graphic */}
                <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-50 to-transparent">
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <BookOpen className="w-32 h-32 text-slate-900" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <ZmanimWidget />
          
          {/* Streak Widget */}
          <Card className="bg-orange-50 border-orange-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">Current Streak</div>
                <div className="text-3xl font-bold text-orange-900">{stats.streak} Days</div>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link to={createPageUrl('DafYomi')} className="block">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <span className="text-xs font-medium">Daf Yomi</span>
              </Button>
            </Link>
            <Link to={createPageUrl('Forums')} className="block">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 border-slate-200 hover:border-green-300 hover:bg-green-50">
                <Clock className="w-6 h-6 text-green-600" />
                <span className="text-xs font-medium">Community</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">My Courses</h2>
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
            View All
          </Button>
        </div>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
            <CardContent className="py-12 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">Start your journey</h3>
              <p className="text-slate-500 mb-6 max-w-sm">
                Explore our catalog of Torah, Chassidus, and skill-building courses.
              </p>
              <Button>Browse Catalog</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}