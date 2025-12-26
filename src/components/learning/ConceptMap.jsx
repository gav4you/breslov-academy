import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConceptMap({ concepts = [] }) {
  const [zoom, setZoom] = useState(1);

  const defaultConcepts = [
    { id: 1, name: 'Azamra', x: 50, y: 30, connections: [2, 3], mastered: true },
    { id: 2, name: 'Finding Good', x: 30, y: 60, connections: [4], mastered: true },
    { id: 3, name: 'Self-Worth', x: 70, y: 60, connections: [4], mastered: false },
    { id: 4, name: 'Joy', x: 50, y: 90, connections: [], mastered: false }
  ];

  const activeConcepts = concepts.length > 0 ? concepts : defaultConcepts;

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <Network className="w-5 h-5 text-purple-600" />
            <div>
              <div>Concept Map</div>
              <div className="text-sm text-slate-600 font-normal" dir="rtl">מפת מושגים</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 overflow-hidden"
          style={{ height: '400px' }}
        >
          <svg className="w-full h-full">
            {/* Draw connections */}
            {activeConcepts.map(concept => 
              concept.connections.map(targetId => {
                const target = activeConcepts.find(c => c.id === targetId);
                if (!target) return null;
                
                return (
                  <line
                    key={`${concept.id}-${targetId}`}
                    x1={`${concept.x}%`}
                    y1={`${concept.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />
                );
              })
            )}
          </svg>

          {/* Draw nodes */}
          {activeConcepts.map((concept, idx) => (
            <div
              key={concept.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${concept.x}%`, top: `${concept.y}%` }}
            >
              <div className={`px-6 py-3 rounded-2xl border-2 shadow-lg cursor-pointer transition-all hover:scale-110 ${
                concept.mastered 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-300 text-white' 
                  : 'bg-white border-blue-300 text-slate-900'
              }`}>
                <div className="font-bold text-center">{concept.name}</div>
                {concept.mastered && (
                  <Badge className="bg-white/20 text-white text-xs mt-1 border-white/30">
                    Mastered
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-blue-300 rounded" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-slate-300" style={{ strokeDasharray: '2' }} />
            <span>Related</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}