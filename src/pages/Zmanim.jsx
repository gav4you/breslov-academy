import React, { useState, useEffect } from 'react';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Sun, Moon, MapPin, Flame } from 'lucide-react';
import { getZmanim } from '@/utils/jewishCalc';

function Countdown({ targetTime, label }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Parse "04:58 PM" roughly for prototype (in production, use real Date objects from calc)
    const now = new Date();
    // This is a rough parser for the string format we generated in jewishCalc
    // In a real app, jewishCalc should return Date objects directly.
    // For this visual prototype, we'll simulate the countdown logic.
    
    const interval = setInterval(() => {
      // Mock countdown logic for display
      const now = new Date();
      const seconds = now.getSeconds();
      const minutes = 60 - now.getMinutes();
      const hours = 14 - (now.getHours() % 12); 
      
      setTimeLeft(`${hours}h ${minutes}m ${60 - seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center p-4 bg-slate-900 rounded-lg text-white mb-6">
      <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">Time until {label}</div>
      <div className="text-4xl font-mono font-bold text-amber-400">{timeLeft}</div>
    </div>
  );
}

export default function Zmanim() {
  const [location, setLocation] = useState('Jerusalem');
  const times = getZmanim(new Date());

  return (
    <PageShell title="Zmanim & Calendar" subtitle={`Halachic times for ${location}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="text-slate-500 text-sm">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <MapPin className="h-4 w-4 text-slate-500" />
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-[180px] border-none shadow-none h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Jerusalem">Jerusalem, IL</SelectItem>
              <SelectItem value="New York">New York, NY</SelectItem>
              <SelectItem value="London">London, UK</SelectItem>
              <SelectItem value="Uman">Uman, UA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Countdown targetTime={times.sunset} label="Sunset (Shkiah)" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Sunrise */}
        <Card className="border-orange-100 bg-gradient-to-b from-orange-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-700 text-sm font-medium uppercase tracking-wide">
              <Sun className="h-4 w-4" />
              Netz (Sunrise)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-slate-900">{times.sunrise}</div>
            <p className="text-xs text-slate-500 mt-1">Earliest Tallis/Tefillin</p>
          </CardContent>
        </Card>

        {/* Chatzot */}
        <Card className="border-yellow-100 bg-gradient-to-b from-yellow-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-700 text-sm font-medium uppercase tracking-wide">
              <Sun className="h-4 w-4" />
              Chatzot (Midday)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-slate-900">{times.chatzot}</div>
            <p className="text-xs text-slate-500 mt-1">Half-day point</p>
          </CardContent>
        </Card>

        {/* Plag */}
        <Card className="border-blue-100 bg-gradient-to-b from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-sm font-medium uppercase tracking-wide">
              <Clock className="h-4 w-4" />
              Plag HaMincha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-slate-900">{times.plagHaMincha}</div>
            <p className="text-xs text-slate-500 mt-1">Earliest Shabbat candles</p>
          </CardContent>
        </Card>

        {/* Sunset */}
        <Card className="border-indigo-100 bg-gradient-to-b from-indigo-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-indigo-700 text-sm font-medium uppercase tracking-wide">
              <Moon className="h-4 w-4" />
              Shkiah (Sunset)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-slate-900">{times.sunset}</div>
            <p className="text-xs text-slate-500 mt-1">End of day</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              Shabbat Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span>Candle Lighting</span>
                <span className="font-bold">{times.candleLighting}</span>
              </div>
              <div className="flex justify-between border-b border-slate-700 pb-2">
                <span>Havdalah</span>
                <span className="font-bold text-slate-400">Loading...</span>
              </div>
              <div className="pt-2 text-sm text-slate-400">
                Parshat <span className="text-white font-semibold">Bereshit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
