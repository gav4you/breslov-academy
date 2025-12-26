import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationToggle() {
  const [enabled, setEnabled] = useState(false);
  const [notificationTypes, setNotificationTypes] = useState({
    newCourses: true,
    achievements: true,
    reminders: true,
    community: false,
  });

  const toggleType = (type) => {
    setNotificationTypes({ ...notificationTypes, [type]: !notificationTypes[type] });
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled ? <Bell className="w-5 h-5 text-blue-600" /> : <BellOff className="w-5 h-5 text-slate-400" />}
            <div>
              <h3 className="font-bold text-slate-900">Push Notifications</h3>
              <p className="text-sm text-slate-600">Stay updated on your learning</p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <div className="space-y-3 pl-8 border-l-2 border-blue-200">
            {Object.entries(notificationTypes).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <Switch checked={value} onCheckedChange={() => toggleType(key)} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}