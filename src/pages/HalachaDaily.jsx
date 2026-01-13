import React from 'react';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scroll } from 'lucide-react';

export default function HalachaDaily() {
  return (
    <PageShell title="Daily Halacha" subtitle="Halacha Yomis and Mishnah Berurah">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scroll className="h-5 w-5" />
              Today's Halacha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <h3>Morning Blessings</h3>
              <p>When waking up in the morning, one should immediately recite "Modeh Ani"...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
