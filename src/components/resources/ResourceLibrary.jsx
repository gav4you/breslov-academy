import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, ExternalLink, File, Image, Video } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResourceLibrary({ resources }) {
  const getIcon = (type) => {
    switch(type) {
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'image': return Image;
      default: return File;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'pdf': return 'from-red-500 to-red-600';
      case 'video': return 'from-blue-500 to-blue-600';
      case 'image': return 'from-green-500 to-green-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Course Resources</h3>
        <div className="space-y-3">
          {resources?.map((resource, idx) => {
            const Icon = getIcon(resource.file_type);
            const colorClass = getColor(resource.file_type);
            
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-all">
                  <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{resource.title}</div>
                    <div className="text-sm text-slate-600">
                      {resource.file_size && `${(resource.file_size / 1024).toFixed(2)} KB`}
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {resource.file_type?.toUpperCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => window.open(resource.file_url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </motion.div>
            );
          })}
          
          {(!resources || resources.length === 0) && (
            <div className="text-center py-8 text-slate-500">
              No resources available yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}