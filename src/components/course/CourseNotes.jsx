import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseNotes({ workbookUrl, lectureNotesUrl, courseName }) {
  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Course Materials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workbookUrl && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Course Workbook</div>
                <div className="text-sm text-slate-600">Interactive exercises and practice</div>
              </div>
            </div>
            <Button
              onClick={() => window.open(workbookUrl, '_blank')}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </motion.div>
        )}

        {lectureNotesUrl && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-slate-900">Lecture Notes</div>
                <div className="text-sm text-slate-600">Key concepts and summaries</div>
              </div>
            </div>
            <Button
              onClick={() => window.open(lectureNotesUrl, '_blank')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </motion.div>
        )}

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-900">
            <strong>Study Tip:</strong> Download these materials to follow along with the lessons and enhance your learning experience.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}