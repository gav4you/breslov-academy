import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Languages, Type, BookOpen } from 'lucide-react';

export default function HebrewTextReader({ hebrewText, englishText, commentary }) {
  const [fontSize, setFontSize] = useState(18);
  const [showNikud, setShowNikud] = useState(true);

  return (
    <Card className="glass-card border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Text Reader</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setFontSize(Math.max(14, fontSize - 2))}>
              A-
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFontSize(Math.min(24, fontSize + 2))}>
              A+
            </Button>
            <Button 
              variant={showNikud ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowNikud(!showNikud)}
            >
              Nikud
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="split" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hebrew">עברית</TabsTrigger>
            <TabsTrigger value="split">Both</TabsTrigger>
            <TabsTrigger value="english">English</TabsTrigger>
          </TabsList>

          <TabsContent value="hebrew" className="space-y-4">
            <div 
              className="p-6 bg-amber-50 rounded-xl border-r-4 border-amber-500 leading-loose"
              dir="rtl"
              style={{ fontSize: `${fontSize}px` }}
            >
              {hebrewText || 'טקסט עברי יבוא כאן'}
            </div>
          </TabsContent>

          <TabsContent value="split" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div 
                className="p-6 bg-amber-50 rounded-xl border-r-4 border-amber-500 leading-loose"
                dir="rtl"
                style={{ fontSize: `${fontSize}px` }}
              >
                {hebrewText || 'טקסט עברי יבוא כאן'}
              </div>
              <div 
                className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500 leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
              >
                {englishText || 'English text will appear here'}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="english" className="space-y-4">
            <div 
              className="p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500 leading-relaxed"
              style={{ fontSize: `${fontSize}px` }}
            >
              {englishText || 'English text will appear here'}
            </div>
          </TabsContent>
        </Tabs>

        {commentary && (
          <div className="mt-6 p-6 bg-slate-50 rounded-xl border-l-4 border-slate-400">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Languages className="w-5 h-5" />
              <span>Commentary</span>
            </h4>
            <p className="text-slate-700 leading-relaxed">{commentary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}