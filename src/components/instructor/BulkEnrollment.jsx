import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function BulkEnrollment({ courseId, onComplete }) {
  const [emails, setEmails] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleBulkEnroll = async () => {
    setProcessing(true);
    const emailList = emails.split('\n').map(e => e.trim()).filter(e => e);
    
    const successful = [];
    const failed = [];

    for (const email of emailList) {
      try {
        await base44.entities.CourseRegistration.create({
          user_email: email,
          course_id: courseId,
          enrollment_date: new Date().toISOString(),
          status: 'active'
        });
        successful.push(email);
      } catch (error) {
        failed.push({ email, error: error.message });
      }
    }

    setResults({ successful, failed, total: emailList.length });
    setProcessing(false);
    onComplete?.();
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Bulk Student Enrollment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!results ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Student Email Addresses (one per line)
              </label>
              <Textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="student1@example.com&#10;student2@example.com&#10;student3@example.com"
                className="min-h-[200px] font-mono text-sm rounded-xl"
              />
              <div className="text-sm text-slate-600 mt-2">
                {emails.split('\n').filter(e => e.trim()).length} email(s) entered
              </div>
            </div>

            <Button
              onClick={handleBulkEnroll}
              disabled={processing || !emails.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-6 rounded-2xl"
            >
              <Upload className="w-5 h-5 mr-2" />
              {processing ? 'Enrolling Students...' : 'Enroll All Students'}
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-black text-slate-900">{results.successful.length}</div>
                <div className="text-sm text-slate-600">Successful</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-3xl font-black text-slate-900">{results.failed.length}</div>
                <div className="text-sm text-slate-600">Failed</div>
              </div>
            </div>

            {results.failed.length > 0 && (
              <div className="p-4 bg-red-50 rounded-xl">
                <div className="font-bold text-red-900 mb-2">Failed Enrollments:</div>
                <div className="space-y-1 text-sm text-red-700">
                  {results.failed.map((f, idx) => (
                    <div key={idx}>{f.email}</div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setResults(null);
                setEmails('');
              }}
              variant="outline"
              className="w-full rounded-xl"
            >
              Enroll More Students
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}