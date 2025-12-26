import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Plus, Mail, Award, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AutomationBuilder() {
  const [automations, setAutomations] = useState([
    {
      trigger: 'Course completion',
      action: 'Send certificate email',
      status: 'active'
    },
    {
      trigger: '7 days inactive',
      action: 'Send reminder',
      status: 'active'
    }
  ]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Zap className="w-5 h-5 text-purple-600" />
          Automations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-sm text-purple-900">
            Create automated workflows to engage students
          </div>
        </div>

        {automations.map((auto, idx) => (
          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-bold text-slate-900">When: {auto.trigger}</div>
                <div className="text-sm text-slate-600">Then: {auto.action}</div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {auto.status}
              </Badge>
            </div>
          </div>
        ))}

        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Create Automation
        </Button>
      </CardContent>
    </Card>
  );
}