import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DownloadManager() {
  const [downloads, setDownloads] = useState([
    { id: 1, title: 'Talmud Berachot Audio', size: '45 MB', progress: 100, status: 'completed' },
    { id: 2, title: 'Likutey Moharan PDF', size: '12 MB', progress: 67, status: 'downloading' },
  ]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Downloads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {downloads.map((download, idx) => (
            <motion.div
              key={download.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 bg-white rounded-xl shadow-md"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm">{download.title}</div>
                  <div className="text-xs text-slate-600">{download.size}</div>
                </div>
                {download.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
              </div>

              {download.status === 'downloading' && (
                <div className="space-y-1">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${download.progress}%` }}
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    />
                  </div>
                  <div className="text-xs text-slate-600 text-right">{download.progress}%</div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}