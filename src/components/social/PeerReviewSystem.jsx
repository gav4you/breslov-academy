import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Star, MessageCircle, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PeerReviewSystem({ assignment, peers = [] }) {
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const peerSubmissions = [
    {
      student: 'Moshe L.',
      title: 'Essay: The Concept of Azamra',
      submitted: new Date(Date.now() - 86400000),
      wordCount: 842,
      needsReview: true
    },
    {
      student: 'David K.',
      title: 'Reflection on Likutey Moharan Torah 1',
      submitted: new Date(Date.now() - 172800000),
      wordCount: 615,
      needsReview: true
    }
  ];

  const submitReview = () => {
    console.log('Submitting review:', { feedback, rating });
    setSelectedPeer(null);
    setFeedback('');
    setRating(0);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <div>Peer Review</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">ביקורת עמיתים</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-900 font-serif leading-relaxed">
            "Through reviewing others' work, we deepen our own understanding" - Learn by teaching
          </div>
        </div>

        {!selectedPeer ? (
          <div className="space-y-3">
            <div className="text-sm font-bold text-slate-700">
              Submissions awaiting your review
            </div>
            {peerSubmissions.map((submission, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold text-slate-900">{submission.student}</div>
                    <div className="text-sm text-slate-600">{submission.title}</div>
                  </div>
                  {submission.needsReview && (
                    <Badge className="bg-orange-100 text-orange-800">
                      Review Needed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                  <span>{submission.wordCount} words</span>
                  <span>Submitted {submission.submitted.toLocaleDateString()}</span>
                </div>
                <Button
                  onClick={() => setSelectedPeer(submission)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Review Submission
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="font-bold text-slate-900 mb-1">
                Reviewing: {selectedPeer.student}
              </div>
              <div className="text-sm text-slate-600">{selectedPeer.title}</div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Rate this submission
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className={`w-12 h-12 rounded-xl border-2 transition-all ${
                      rating >= num 
                        ? 'bg-amber-500 border-amber-600' 
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <Star className={`w-6 h-6 mx-auto ${rating >= num ? 'text-white fill-white' : 'text-slate-400'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Constructive feedback
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts and suggestions..."
                className="min-h-[150px] rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedPeer(null)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                disabled={!rating || !feedback}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Submit Review
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}