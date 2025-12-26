import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Zap, Star, Flame, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PowerUpShop({ userXP = 0 }) {
  const items = [
    {
      id: 'double_xp',
      name: 'Double XP Boost',
      description: '2x experience for 1 hour',
      cost: 100,
      icon: Star,
      color: 'from-amber-400 to-yellow-600'
    },
    {
      id: 'streak_saver',
      name: 'Streak Freeze',
      description: 'Protect your streak for 1 day',
      cost: 75,
      icon: Shield,
      color: 'from-blue-400 to-cyan-600'
    },
    {
      id: 'mega_boost',
      name: 'Mega XP Boost',
      description: '5x experience for 15 minutes',
      cost: 250,
      icon: Flame,
      color: 'from-red-400 to-orange-600'
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Power-Up Shop
          </div>
          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {userXP} XP
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const canAfford = userXP >= item.cost;
          
          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border-2 ${
                canAfford 
                  ? 'bg-white border-slate-200' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="font-black text-slate-900 mb-1">{item.name}</div>
                  <div className="text-sm text-slate-600 mb-3">{item.description}</div>
                  
                  <Button
                    disabled={!canAfford}
                    size="sm"
                    className={`w-full rounded-xl ${
                      canAfford 
                        ? `bg-gradient-to-r ${item.color} text-white` 
                        : 'bg-slate-300 text-slate-600'
                    }`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {item.cost} XP
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}