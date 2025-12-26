import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Eraser, Square, Circle, Type, Trash2, Download, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function InteractiveWhiteboard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const colors = ['#000000', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-slate-900">Whiteboard</h3>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            Shared
          </Badge>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setTool('pen')}
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            className="rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setTool('eraser')}
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            className="rounded-lg"
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <div className="h-8 w-px bg-slate-300" />
          {colors.map((c, idx) => (
            <button
              key={idx}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-lg border-2 ${
                color === c ? 'border-slate-900 scale-110' : 'border-slate-200'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="h-8 w-px bg-slate-300" />
          <Button
            onClick={clearCanvas}
            variant="outline"
            size="sm"
            className="rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full border-2 border-slate-300 rounded-2xl bg-white cursor-crosshair"
        />

        <div className="text-xs text-slate-600 text-center">
          Draw diagrams, Hebrew letters, or visual explanations to enhance understanding
        </div>
      </CardContent>
    </Card>
  );
}