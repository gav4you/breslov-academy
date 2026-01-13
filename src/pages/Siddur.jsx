import React from 'react';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Siddur() {
  return (
    <PageShell title="Siddur & Tehillim" subtitle="Prayer texts and Psalms">
      <Tabs defaultValue="shacharit" className="w-full">
        <TabsList>
          <TabsTrigger value="shacharit">Shacharit</TabsTrigger>
          <TabsTrigger value="mincha">Mincha</TabsTrigger>
          <TabsTrigger value="arvit">Arvit</TabsTrigger>
          <TabsTrigger value="tehillim">Tehillim</TabsTrigger>
        </TabsList>
        <TabsContent value="shacharit" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center font-serif text-xl leading-relaxed" dir="rtl">
                מודה אני לפניך מלך חי וקים...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
