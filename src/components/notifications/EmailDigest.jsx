import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mail, Bell, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EmailDigest({ userEmail }) {
  const [preferences, setPreferences] = useState({
    daily_digest: true,
    weekly_summary: true,
    course_updates: true,
    new_content: true,
    digest_time: 'morning',
    frequency: 'daily'
  });

  const savePreferences = async () => {
    await base44.auth.updateMe({
      email_preferences: preferences
    });
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Email Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <div className="font-bold text-slate-900">Daily Learning Digest</div>
              <div className="text-sm text-slate-600">Your progress and recommendations</div>
            </div>
            <Switch
              checked={preferences.daily_digest}
              onCheckedChange={(val) => setPreferences({ ...preferences, daily_digest: val })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <div className="font-bold text-slate-900">Weekly Summary</div>
              <div className="text-sm text-slate-600">Overview of your week</div>
            </div>
            <Switch
              checked={preferences.weekly_summary}
              onCheckedChange={(val) => setPreferences({ ...preferences, weekly_summary: val })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <div className="font-bold text-slate-900">New Content Alerts</div>
              <div className="text-sm text-slate-600">When new lessons are added</div>
            </div>
            <Switch
              checked={preferences.new_content}
              onCheckedChange={(val) => setPreferences({ ...preferences, new_content: val })}
            />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preferred Time
            </label>
            <Select 
              value={preferences.digest_time} 
              onValueChange={(val) => setPreferences({ ...preferences, digest_time: val })}
            >
              <SelectTrigger className="rounded-xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning (8 AM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (2 PM)</SelectItem>
                <SelectItem value="evening">Evening (6 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Frequency
            </label>
            <Select 
              value={preferences.frequency} 
              onValueChange={(val) => setPreferences({ ...preferences, frequency: val })}
            >
              <SelectTrigger className="rounded-xl bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={savePreferences}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
        >
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}