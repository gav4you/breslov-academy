import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Star, Flame, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function PowerUpInventory({ userPowerUps = [] }) {
  const inventory = [
    { type: 'double_xp', quantity: 2, icon: Star, color: 'from-amber-400 to-yellow-600' },
    { type: 'streak_freeze', quantity: 1, icon: Shield, color: 'from-blue-400 to-cyan-600' },
    { type: 'xp_boost', quantity: 3, icon: Zap, color: 'from-purple-400 to-pink-600' }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Zap className="w-5 h-5 text-purple-600" />
          Power-Up Inventory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {inventory.map((item, idx) => {
          const Icon = item.icon;
          
          return (
            <div
              key={idx}
              className="p-4 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 capitalize">
                    {item.type.replace('_', ' ')}
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {item.quantity} available
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                className={`bg-gradient-to-r ${item.color} text-white rounded-xl`}
              >
                Use
              </Button>
            </div>
          );
        })}

        {inventory.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Zap className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No power-ups yet</p>
            <p className="text-sm">Earn XP to unlock power-ups</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}