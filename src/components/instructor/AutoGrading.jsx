import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function AutoGrading({ quizId, submissions, rubric, onComplete }) {
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState(null);

  const handleAutoGrade = async () => {
    setGrading(true);
    
    const gradedSubmissions = [];
    
    for (const submission of submissions) {
      try {
        // Use AI to grade essay/short answer questions
        const gradingPrompt = `
          Grade this student submission based on the rubric.
          Question: ${submission.question}
          Student Answer: ${submission.answer}
          Rubric: ${JSON.stringify(rubric)}
          
          Provide a score out of 100 and brief feedback.
        `;
        
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: gradingPrompt,
          response_json_schema: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              feedback: { type: 'string' }
            }
          }
        });

        await base44.entities.Submission.update(submission.id, {
          grade_points: result.score,
          feedback: result.feedback,
          graded: true
        });

        gradedSubmissions.push({
          ...submission,
          score: result.score,
          feedback: result.feedback
        });
      } catch (error) {
        console.error('Grading error:', error);
      }
    }

    setResults(gradedSubmissions);
    setGrading(false);
    onComplete?.();
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-600" />
          AI Auto-Grading
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!results ? (
          <>
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="font-bold text-slate-900 mb-2">Auto-Grade Submissions</div>
              <p className="text-sm text-slate-700">
                AI will automatically grade {submissions?.length || 0} submissions based on your rubric criteria.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="font-bold text-slate-900 mb-2">How it works:</div>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• AI analyzes each response against rubric criteria</li>
                <li>• Provides scores and constructive feedback</li>
                <li>• You can review and adjust grades if needed</li>
              </ul>
            </div>

            <Button
              onClick={handleAutoGrade}
              disabled={grading || !submissions?.length}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-6 rounded-2xl"
            >
              {grading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Grading in Progress...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Auto-Grade {submissions?.length || 0} Submissions
                </>
              )}
            </Button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-900 mb-1">Grading Complete!</div>
              <div className="text-sm text-green-700">
                All {results.length} submissions have been graded
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900 mb-2">Grade Distribution:</div>
              {results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <span className="text-sm text-slate-700">{result.student_name}</span>
                  <Badge className={
                    result.score >= 90 ? 'bg-green-100 text-green-800' :
                    result.score >= 80 ? 'bg-blue-100 text-blue-800' :
                    result.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {result.score}%
                  </Badge>
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="text-3xl font-black text-slate-900 mb-1">
                {(results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Average Score</div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}