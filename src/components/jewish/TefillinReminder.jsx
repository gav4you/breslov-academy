import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TefillinReminder() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
  const [completed, setCompleted] = useState([true, true, false, false, false]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-900">Tefillin This Week</h3>
          <Badge className="bg-green-100 text-green-800">
            {completed.filter(Boolean).length} / {days.length}
          </Badge>
        </div>
        <div className="flex justify-between">
          {days.map((day, idx) => (
            <motion.button
              key={day}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newCompleted = [...completed];
                newCompleted[idx] = !newCompleted[idx];
                setCompleted(newCompleted);
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                completed[idx] ? 'bg-green-500' : 'bg-slate-200'
              }`}>
                {completed[idx] ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <span className="text-xs font-medium text-slate-600">{day}</span>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}