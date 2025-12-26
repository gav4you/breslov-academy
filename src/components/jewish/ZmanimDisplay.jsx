import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Moon, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ZmanimDisplay({ location = 'Jerusalem' }) {
  const [zmanim, setZmanim] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // In production, use a proper Zmanim API like KosherJava or MyZmanim
    const calculateZmanim = () => {
      const now = new Date();
      const dawn = new Date(now);
      dawn.setHours(5, 30, 0);
      
      const sunrise = new Date(now);
      sunrise.setHours(6, 15, 0);
      
      const sofZmanShma = new Date(now);
      sofZmanShma.setHours(9, 30, 0);
      
      const chatzot = new Date(now);
      chatzot.setHours(12, 30, 0);
      
      const minchaGedola = new Date(now);
      minchaGedola.setHours(13, 15, 0);
      
      const sunset = new Date(now);
      sunset.setHours(18, 45, 0);
      
      const nightfall = new Date(now);
      nightfall.setHours(19, 30, 0);
      
      setZmanim({
        alotHashachar: dawn,
        netz: sunrise,
        sofZmanShma,
        chatzot,
        minchaGedola,
        shkiah: sunset,
        tzeitHakochavim: nightfall
      });
    };

    calculateZmanim();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      calculateZmanim();
    }, 60000);

    return () => clearInterval(interval);
  }, [location]);

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isCurrentPeriod = (startTime, endTime) => {
    return currentTime >= startTime && currentTime <= endTime;
  };

  const zmanimItems = [
    { 
      name: 'Alot HaShachar', 
      nameHebrew: 'עלות השחר',
      time: zmanim?.alotHashachar, 
      icon: Star,
      color: 'from-indigo-400 to-purple-500',
      description: 'Dawn - First light'
    },
    { 
      name: 'Netz HaChama', 
      nameHebrew: 'נץ החמה',
      time: zmanim?.netz, 
      icon: Sun,
      color: 'from-orange-400 to-red-500',
      description: 'Sunrise'
    },
    { 
      name: 'Sof Zman Shema', 
      nameHebrew: 'סוף זמן ק"ש',
      time: zmanim?.sofZmanShma, 
      icon: Clock,
      color: 'from-amber-400 to-yellow-500',
      description: 'Latest Shema'
    },
    { 
      name: 'Chatzot', 
      nameHebrew: 'חצות',
      time: zmanim?.chatzot, 
      icon: Sun,
      color: 'from-blue-400 to-cyan-500',
      description: 'Midday'
    },
    { 
      name: 'Mincha Gedola', 
      nameHebrew: 'מנחה גדולה',
      time: zmanim?.minchaGedola, 
      icon: Clock,
      color: 'from-teal-400 to-green-500',
      description: 'Earliest Mincha'
    },
    { 
      name: 'Shkiah', 
      nameHebrew: 'שקיעה',
      time: zmanim?.shkiah, 
      icon: Sun,
      color: 'from-orange-500 to-pink-600',
      description: 'Sunset'
    },
    { 
      name: 'Tzeit HaKochavim', 
      nameHebrew: 'צאת הכוכבים',
      time: zmanim?.tzeitHakochavim, 
      icon: Moon,
      color: 'from-slate-600 to-indigo-800',
      description: 'Nightfall'
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem] overflow-hidden">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-black text-white mb-2">Zmanim for Today</h3>
            <p className="text-amber-400 font-serif text-lg" dir="rtl">זמני היום</p>
            <p className="text-slate-300 text-sm mt-2">{location} • {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-white">{formatTime(currentTime)}</div>
            <div className="text-slate-400 text-sm">Current Time</div>
          </div>
        </div>
      </div>

      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-4">
          {zmanimItems.map((zman, idx) => {
            const Icon = zman.icon;
            const isCurrent = idx < zmanimItems.length - 1 && 
              isCurrentPeriod(zman.time, zmanimItems[idx + 1]?.time);
            
            return (
              <motion.div
                key={zman.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative p-5 rounded-2xl border-2 transition-all ${
                  isCurrent 
                    ? 'border-amber-400 bg-amber-50 shadow-lg scale-105' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                      NOW
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${zman.color} rounded-xl flex items-center justify-center shrink-0 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-black text-slate-900 text-lg mb-1">{zman.name}</div>
                    <div className="text-amber-700 font-serif text-sm mb-2" dir="rtl">{zman.nameHebrew}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">{zman.description}</span>
                      <span className={`font-bold text-lg ${isCurrent ? 'text-amber-600' : 'text-slate-900'}`}>
                        {formatTime(zman.time)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900 mb-1">Optimal Learning Times</div>
              <div className="text-sm text-slate-700 leading-relaxed">
                The hours after <span className="font-semibold text-blue-700">Alot HaShachar</span> and before <span className="font-semibold text-blue-700">Tzeit HaKochavim</span> are especially auspicious for Torah study. 
                The Breslov tradition emphasizes learning at <span className="font-semibold text-blue-700">Chatzot</span> (midnight) for elevated spiritual connection.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}