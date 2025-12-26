import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Mail, Award, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export default function BulkOperations({ students = [] }) {
  const [selected, setSelected] = useState([]);

  const operations = [
    { icon: Mail, label: 'Send Message', color: 'from-blue-600 to-indigo-700' },
    { icon: Award, label: 'Grant Certificate', color: 'from-green-600 to-emerald-700' },
    { icon: UserPlus, label: 'Add to Group', color: 'from-purple-600 to-pink-600' }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <Layers className="w-5 h-5 text-purple-600" />
            Bulk Operations
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            {selected.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {students.slice(0, 10).map((student, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200"
            >
              <Checkbox
                checked={selected.includes(student.email)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelected([...selected, student.email]);
                  } else {
                    setSelected(selected.filter(e => e !== student.email));
                  }
                }}
              />
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm">{student.name || student.email}</div>
                <div className="text-xs text-slate-600">{student.progress || 0}% complete</div>
              </div>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {operations.map((op, idx) => {
              const Icon = op.icon;
              return (
                <Button
                  key={idx}
                  variant="outline"
                  className="rounded-xl flex-col h-auto py-3"
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{op.label}</span>
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}