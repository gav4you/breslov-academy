import React from 'react';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Flame, Crown, ArrowUp, Minus } from 'lucide-react';
import { getRank, formatXP } from '@/components/gamification/gamificationEngine';

const LEADERBOARD_DATA = [
  { id: 1, name: 'Chaim L.', xp: 15420, streak: 45, avatar: null },
  { id: 2, name: 'Sarah K.', xp: 14200, streak: 12, avatar: null },
  { id: 3, name: 'David B.', xp: 12150, streak: 30, avatar: null },
  { id: 4, name: 'Moshe C.', xp: 9800, streak: 5, avatar: null },
  { id: 5, name: 'Rivka T.', xp: 8500, streak: 21, avatar: null },
];

function Podium({ winners }) {
  return (
    <div className="flex items-end justify-center gap-4 mb-12 h-64">
      {/* 2nd Place */}
      <div className="flex flex-col items-center">
        <Avatar className="w-16 h-16 border-4 border-slate-300 mb-2">
          <AvatarFallback>2nd</AvatarFallback>
        </Avatar>
        <div className="text-sm font-bold mb-1">{winners[1].name}</div>
        <div className="w-24 h-32 bg-slate-200 rounded-t-lg flex items-center justify-center relative">
          <span className="text-3xl font-bold text-slate-400">2</span>
        </div>
      </div>
      {/* 1st Place */}
      <div className="flex flex-col items-center z-10">
        <Crown className="text-yellow-500 w-8 h-8 mb-1 animate-bounce" />
        <Avatar className="w-20 h-20 border-4 border-yellow-400 mb-2">
          <AvatarFallback>1st</AvatarFallback>
        </Avatar>
        <div className="text-sm font-bold mb-1">{winners[0].name}</div>
        <div className="w-28 h-48 bg-yellow-100 rounded-t-lg flex items-center justify-center relative border-t-4 border-yellow-400">
          <span className="text-4xl font-bold text-yellow-600">1</span>
        </div>
      </div>
      {/* 3rd Place */}
      <div className="flex flex-col items-center">
        <Avatar className="w-16 h-16 border-4 border-amber-600 mb-2">
          <AvatarFallback>3rd</AvatarFallback>
        </Avatar>
        <div className="text-sm font-bold mb-1">{winners[2].name}</div>
        <div className="w-24 h-24 bg-amber-100 rounded-t-lg flex items-center justify-center relative">
          <span className="text-3xl font-bold text-amber-700">3</span>
        </div>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  return (
    <PageShell title="Leaderboard" subtitle="Top scholars this week">
      <Tabs defaultValue="global" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="school">My School</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="global">
          <Podium winners={LEADERBOARD_DATA.slice(0, 3)} />
          
          <Card>
            <CardContent className="p-0">
              {LEADERBOARD_DATA.map((user, idx) => {
                const rank = getRank(user.xp);
                return (
                  <div key={user.id} className="flex items-center p-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <div className="w-8 font-bold text-slate-500">{idx + 1}</div>
                    <Avatar className="h-10 w-10 mr-4">
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        {user.name}
                        {idx < 3 && <Badge variant="secondary" className="text-xs">{rank.name}</Badge>}
                      </div>
                      <div className="text-xs text-slate-500">{formatXP(user.xp)} XP</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-orange-500 text-sm font-medium">
                        <Flame className="w-4 h-4 mr-1 fill-orange-500" />
                        {user.streak}
                      </div>
                      {idx % 2 === 0 ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <Minus className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}