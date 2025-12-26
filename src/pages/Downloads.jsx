import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, BookOpen, Headphones } from 'lucide-react';

export default function Downloads() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: downloads = [] } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => base44.entities.Download.list()
  });

  const iconMap = {
    pdf: FileText,
    ebook: BookOpen,
    audio: Headphones,
    workbook: BookOpen,
    template: FileText
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <Download className="w-12 h-12" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Digital Downloads</h1>
            <p className="text-green-200 text-lg">Workbooks, eBooks & Study Materials</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {downloads.map((download) => {
          const Icon = iconMap[download.type] || FileText;
          
          return (
            <Card key={download.id} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <Badge>{download.type}</Badge>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-2">{download.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{download.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {download.download_count} downloads
                  </span>
                  <Button
                    onClick={() => window.open(download.file_url, '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {download.price > 0 ? `$${download.price}` : 'Free'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}