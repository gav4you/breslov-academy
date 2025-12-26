import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Send, Users, Filter } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BulkMessaging({ students = [] }) {
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [filter, setFilter] = useState('all');

  const toggleStudent = (email) => {
    if (selectedStudents.includes(email)) {
      setSelectedStudents(selectedStudents.filter(e => e !== email));
    } else {
      setSelectedStudents([...selectedStudents, email]);
    }
  };

  const selectAll = () => {
    setSelectedStudents(students.map(s => s.email));
  };

  const sendBulkMessage = async () => {
    for (const email of selectedStudents) {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: 'Message from your Rebbe',
        body: message
      });
    }
    setMessage('');
    setSelectedStudents([]);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Send className="w-5 h-5 text-blue-600" />
          <div>
            <div>Bulk Messaging</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">שליחת הודעות מרובות</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="rounded-lg"
          >
            Select All
          </Button>
          <Badge className="bg-blue-100 text-blue-800">
            {selectedStudents.length} selected
          </Badge>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 p-4 bg-slate-50 rounded-xl">
          {students.slice(0, 20).map((student, idx) => (
            <div
              key={student.email}
              className="flex items-center gap-3 p-2 bg-white rounded-lg hover:bg-blue-50 transition-all"
            >
              <Checkbox
                checked={selectedStudents.includes(student.email)}
                onCheckedChange={() => toggleStudent(student.email)}
              />
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm">
                  {student.name || student.email}
                </div>
                <div className="text-xs text-slate-600">
                  {student.completed_lessons || 0} lessons completed
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Message to Talmidim
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share encouragement, Torah wisdom, or upcoming shiurim..."
            className="min-h-[150px] rounded-xl font-serif"
          />
        </div>

        <Button
          onClick={sendBulkMessage}
          disabled={selectedStudents.length === 0 || !message}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
        >
          <Send className="w-5 h-5 mr-2" />
          Send to {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
        </Button>
      </CardContent>
    </Card>
  );
}