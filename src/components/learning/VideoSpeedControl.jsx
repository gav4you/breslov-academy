import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gauge } from 'lucide-react';

export default function VideoSpeedControl({ onChange }) {
  const [speed, setSpeed] = useState(1.0);
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    onChange?.(newSpeed);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-sm rounded-xl">
      <Gauge className="w-4 h-4 text-white" />
      <div className="flex gap-1">
        {speeds.map((s) => (
          <Button
            key={s}
            onClick={() => handleSpeedChange(s)}
            variant="ghost"
            size="sm"
            className={`rounded-lg text-white hover:bg-white/20 ${speed === s ? 'bg-white/30' : ''}`}
          >
            {s}x
          </Button>
        ))}
      </div>
    </div>
  );
}