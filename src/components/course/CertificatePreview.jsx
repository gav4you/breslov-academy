import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CertificatePreview({ certificate }) {
  const downloadPDF = () => {
    console.log('Downloading certificate...');
  };

  const share = () => {
    console.log('Sharing certificate...');
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem] overflow-hidden">
      <CardContent className="p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-amber-50 via-white to-blue-50 p-12 border-8 border-double border-amber-600"
        >
          <div className="text-center space-y-6">
            <Award className="w-24 h-24 text-amber-600 mx-auto" />
            
            <div>
              <div className="text-sm uppercase tracking-widest text-slate-600 mb-2">
                Certificate of Completion
              </div>
              <div className="text-3xl font-black text-slate-900" dir="rtl">
                תעודת השלמה
              </div>
            </div>

            <div className="text-5xl font-black text-slate-900 my-8">
              {certificate?.user_name}
            </div>

            <div className="text-lg text-slate-700 max-w-lg mx-auto leading-relaxed font-serif">
              has successfully completed the sacred learning journey of
            </div>

            <div className="text-3xl font-black text-blue-900 my-6">
              {certificate?.course_title}
            </div>

            <div className="text-slate-600">
              under the guidance of <span className="font-bold">{certificate?.instructor_name}</span>
            </div>

            <div className="pt-8 border-t-2 border-amber-200">
              <div className="text-sm text-slate-600">
                {new Date(certificate?.completion_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Certificate #{certificate?.certificate_number}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <Button
            onClick={downloadPDF}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={share}
            variant="outline"
            className="flex-1 rounded-2xl"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}