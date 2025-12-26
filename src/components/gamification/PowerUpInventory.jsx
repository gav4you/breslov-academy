import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PowerUpInventory() {
  const powerUps = [
    { name: '2x XP Boost', icon: Zap, quantity: 3, duration: '1 hour', color: 'from-yellow-500 to-orange-600' },
    { name: 'Hint Token', icon: Sparkles, quantity: 5, duration: 'Single use', color: 'from-blue-500 to-purple-600' },
    { name: 'Streak Saver', icon: Flame, quantity: 1, duration: 'Auto', color: 'from-red-500 to-pink-600' },
    { name: 'Time Extension', icon: Star, quantity: 2, duration: '+10 min', color: 'from-green-500 to-teal-600' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Power-Ups
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {powerUps.map((powerUp, idx) => {
            const Icon = powerUp.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`relative p-4 bg-gradient-to-br ${powerUp.color} rounded-2xl shadow-xl cursor-pointer`}>
                  <Badge className="absolute top-2 right-2 bg-white text-slate-900 font-bold">
                    {powerUp.quantity}
                  </Badge>
                  <Icon className="w-8 h-8 text-white mb-2" />
                  <div className="text-white font-bold text-sm mb-1">{powerUp.name}</div>
                  <div className="text-white/80 text-xs">{powerUp.duration}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}