import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Users, DollarSign, BookOpen, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function RebbeDashboard({ instructorEmail, students, courses }) {
  const [recording, setRecording] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messageText, setMessageText] = useState('');

  const stats = [
    { label: 'Active Talmidim', value: students?.length || 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Shiurim', value: courses?.length || 0, icon: BookOpen, color: 'from-purple-500 to-purple-600' },
    { label: 'Monthly Pidyon', value: '$2,340', icon: DollarSign, color: 'from-green-500 to-green-600' },
    { label: 'Completion Rate', value: '87%', icon: TrendingUp, color: 'from-amber-500 to-amber-600' }
  ];

  const sendVoiceNote = async (studentEmail) => {
    // In production, integrate with voice recording API
    console.log('Sending voice note to:', studentEmail);
  };

  const sendPidyonRequest = async (amount, purpose) => {
    await base44.integrations.Core.SendEmail({
      to: selectedStudent.email,
      subject: `Pidyon Request - ${purpose}`,
      body: `Shalom ${selectedStudent.name},\n\nI would be grateful for your support of $${amount} to help continue our holy work of spreading the teachings of Rebbe Nachman.\n\nWith blessing,\nYour Rebbe`
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-effect border-0 premium-shadow rounded-2xl">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-black text-slate-900 font-serif">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Personal Messages - "Tish" Communication */}
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8">
          <div className="mb-6">
            <h3 className="text-3xl font-black text-slate-900 font-serif mb-2">The Rebbe's Tish</h3>
            <p className="text-amber-700 font-serif" dir="rtl">טיש של הרבי - הדרכה אישית</p>
            <p className="text-slate-600 mt-2">Personal guidance and connection with your Talmidim</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 font-serif">Select Talmid</label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students?.slice(0, 10).map((student, idx) => (
                  <button
                    key={student.email}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedStudent?.email === student.email
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-white border-2 border-transparent hover:border-blue-200'
                    }`}
                  >
                    <div className="font-bold text-slate-900 font-serif">{student.name || student.email}</div>
                    <div className="text-xs text-slate-600">
                      {student.completed_lessons || 0} lessons completed
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Composer */}
            {selectedStudent && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="font-bold text-slate-900 mb-1 font-serif">
                    Sending to: {selectedStudent.name || selectedStudent.email}
                  </div>
                  <div className="text-sm text-slate-600">
                    Last active: {new Date().toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 font-serif">
                    Personal Message
                  </label>
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Share words of encouragement, guidance, or Torah wisdom..."
                    className="min-h-[150px] rounded-xl font-serif"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => sendVoiceNote(selectedStudent.email)}
                    variant="outline"
                    className="rounded-xl font-serif"
                  >
                    <Mic className={`w-4 h-4 mr-2 ${recording ? 'text-red-600 animate-pulse' : ''}`} />
                    Voice Note
                  </Button>
                  <Button
                    onClick={() => {
                      // Send text message
                      console.log('Send message:', messageText);
                      setMessageText('');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-serif"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>

                {/* Pidyon Request */}
                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-3 font-serif">
                    Request Support (Pidyon)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[18, 36, 72].map(amount => (
                      <Button
                        key={amount}
                        onClick={() => sendPidyonRequest(amount, 'General Support')}
                        variant="outline"
                        className="rounded-xl font-serif border-green-200 hover:bg-green-50"
                      >
                        <Heart className="w-4 h-4 mr-2 text-green-600" />
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}