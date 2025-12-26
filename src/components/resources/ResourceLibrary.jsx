import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, FileText, Video, Music, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ResourceLibrary() {
  const [searchTerm, setSearchTerm] = useState('');

  const resources = {
    pdfs: [
      { name: 'Azamra Study Guide', size: '2.3 MB', downloads: 156 },
      { name: 'Hebrew Alphabet Chart', size: '1.1 MB', downloads: 234 }
    ],
    videos: [
      { name: 'Likutey Moharan Introduction', duration: '15:30', views: 456 },
      { name: 'Hebrew Pronunciation Guide', duration: '8:45', views: 289 }
    ],
    audio: [
      { name: 'Azamra Meditation', duration: '12:00', plays: 567 },
      { name: 'Morning Blessings', duration: '5:30', plays: 890 }
    ]
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <FolderOpen className="w-5 h-5 text-blue-600" />
          <div>
            <div>Resource Library</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">ספריית משאבים</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            className="pl-10 rounded-xl"
          />
        </div>

        <Tabs defaultValue="pdfs">
          <TabsList className="grid grid-cols-3 bg-white rounded-xl">
            <TabsTrigger value="pdfs">PDFs</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>

          <TabsContent value="pdfs" className="space-y-2 mt-4">
            {resources.pdfs.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-600">{item.size} • {item.downloads} downloads</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="videos" className="space-y-2 mt-4">
            {resources.videos.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-600">{item.duration} • {item.views} views</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="audio" className="space-y-2 mt-4">
            {resources.audio.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                    <div className="text-xs text-slate-600">{item.duration} • {item.plays} plays</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}