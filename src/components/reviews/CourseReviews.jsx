import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function CourseReviews({ courseId, reviews, userEmail }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: () => base44.entities.CourseReview.create({
      course_id: courseId,
      user_email: userEmail,
      rating: rating,
      comment: comment
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      setRating(0);
      setComment('');
    }
  });

  const helpfulMutation = useMutation({
    mutationFn: (review) => base44.entities.CourseReview.update(review.id, {
      helpful_count: (review.helpful_count || 0) + 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
    }
  });

  const avgRating = reviews?.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-6xl font-black text-slate-900">{avgRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <div className="text-sm text-slate-600">{reviews?.length || 0} reviews</div>
            </div>
            <div className="flex-1 space-y-2">
              {[5,4,3,2,1].map(stars => {
                const count = reviews?.filter(r => r.rating === stars).length || 0;
                const percentage = reviews?.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 w-12">{stars} stars</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-sm text-slate-600 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-lg mb-4">Write a Review</h3>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                >
                  <Star className={`w-8 h-8 transition-all ${
                    star <= (hoveredStar || rating) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-300'
                  }`} />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this course..."
              className="mb-4 rounded-xl"
              rows={4}
            />
            <Button
              onClick={() => createReviewMutation.mutate()}
              disabled={!rating || !comment.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
            >
              Submit Review
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews?.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-slate-900">{review.user_name || 'Student'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-600">
                        {new Date(review.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-700 mb-3">{review.comment}</p>
                <button
                  onClick={() => helpfulMutation.mutate(review)}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful_count || 0})
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}