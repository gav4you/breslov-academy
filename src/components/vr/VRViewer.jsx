import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Glasses, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function VRViewer({ scene }) {
  const [vrActive, setVrActive] = useState(false);

  const vrExperiences = [
    { name: 'Virtual Torah Study Hall', description: 'Experience a traditional Beis Midrash', icon: '🕍' },
    { name: 'Jerusalem Tour', description: 'Walk through holy sites', icon: '🏛️' },
    { name: '3D Hebrew Letters', description: 'Interactive alphabet learning', icon: '🔤' }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Glasses className="w-5 h-5 text-purple-600" />
          <div>
            <div>VR Experiences</div>
            <div className="text-sm text-slate-600 font-normal">Immersive Learning</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vrExperiences.map((exp, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-purple-300 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="text-4xl">{exp.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 mb-1">{exp.name}</div>
                <p className="text-sm text-slate-600 mb-3">{exp.description}</p>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Launch VR
                </Button>
              </div>
            </div>
          </div>
        ))}

        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-sm text-purple-900">
            🥽 Requires VR headset or smartphone VR viewer
          </div>
        </div>
      </CardContent>
    </Card>
  );
}