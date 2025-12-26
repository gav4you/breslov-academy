import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CertificateGenerator({ courseName, userName, completionDate }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <Card className="border-8 border-amber-500 rounded-[2rem] overflow-hidden shadow-2xl print:shadow-none">
          <div className="bg-gradient-to-br from-amber-50 via-white to-blue-50 p-12 md:p-16">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-xl">
                <Award className="w-12 h-12 text-white" />
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
                  Certificate of Completion
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto rounded-full" />
              </div>

              <div className="space-y-2">
                <p className="text-xl text-slate-600">This is to certify that</p>
                <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  {userName || 'Student Name'}
                </h2>
                <p className="text-xl text-slate-600">has successfully completed</p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {courseName || 'Torah Study Course'}
                </h3>
              </div>

              <div className="pt-8 text-slate-600">
                <p>Issued on {completionDate || new Date().toLocaleDateString()}</p>
              </div>

              <div className="flex justify-center gap-4 pt-8">
                <div className="text-center">
                  <div className="h-px w-32 bg-slate-300 mb-2" />
                  <p className="text-sm text-slate-600 font-semibold">Rabbi Nachman</p>
                  <p className="text-xs text-slate-500">Director</p>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Breslov Academy • breslovacademy.com
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex gap-3 print:hidden">
        <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" className="flex-1 rounded-2xl">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}