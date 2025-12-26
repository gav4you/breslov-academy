import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, BookOpen, Video, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RelatedContent() {
  const related = [
    { title: 'Introduction to Hitbodedut', type: 'video', icon: Video, color: 'from-red-500 to-red-600' },
    { title: 'Simcha Practice Guide', type: 'article', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { title: 'Advanced Breslov Concepts', type: 'course', icon: BookOpen, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-cyan-600" />
          Related Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {related.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 truncate">{item.title}</div>
                <div className="text-xs text-slate-600 capitalize">{item.type}</div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}