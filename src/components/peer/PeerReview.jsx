import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, MessageCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PeerReview({ projects, onReview, userEmail }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [review, setReview] = useState({ rating: 0, feedback: '' });
  const [hoveredStar, setHoveredStar] = useState(0);

  const submitReview = () => {
    onReview?.({
      project_id: selectedProject.id,
      reviewer_email: userEmail,
      rating: review.rating,
      feedback: review.feedback
    });
    setSelectedProject(null);
    setReview({ rating: 0, feedback: '' });
  };

  if (selectedProject) {
    return (
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8 space-y-6">
          <div>
            <Button
              onClick={() => setSelectedProject(null)}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              ← Back to Projects
            </Button>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {selectedProject.title}
            </h3>
            <p className="text-slate-600">by {selectedProject.author_name}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-slate-700">{selectedProject.description}</p>
            {selectedProject.project_url && (
              <a
                href={selectedProject.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                View Project
              </a>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Rating
            </label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setReview({ ...review, rating: star })}
                >
                  <Star className={`w-8 h-8 transition-all ${
                    star <= (hoveredStar || review.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Constructive Feedback
            </label>
            <Textarea
              value={review.feedback}
              onChange={(e) => setReview({ ...review, feedback: e.target.value })}
              placeholder="What did you like? What could be improved?"
              className="min-h-[150px] rounded-xl"
            />
          </div>

          <Button
            onClick={submitReview}
            disabled={!review.rating || !review.feedback.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-6 rounded-2xl"
          >
            Submit Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-black text-slate-900">Peer Projects</h3>
      <p className="text-slate-600">Review your classmates' projects and provide feedback</p>

      {projects?.filter(p => p.user_email !== userEmail).map((project, idx) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-slate-900">{project.title}</h4>
                  <p className="text-sm text-slate-600">by {project.author_name}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {project.reviews_count || 0} reviews
                </Badge>
              </div>

              <p className="text-slate-700 mb-4 line-clamp-2">{project.description}</p>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setSelectedProject(project)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Review Project
                </Button>
                {project.project_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(project.project_url, '_blank')}
                    className="rounded-xl"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}