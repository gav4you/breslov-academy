import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SpacedRepetition({ card, onComplete, userEmail, languageVariant }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const queryClient = useQueryClient();

  const updateSRSMutation = useMutation({
    mutationFn: async ({ quality }) => {
      // SuperMemo SM-2 algorithm
      const srsData = card.srsData || {
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 0
      };

      let newEaseFactor = srsData.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (newEaseFactor < 1.3) newEaseFactor = 1.3;

      let newInterval;
      let newRepetitions;

      if (quality < 3) {
        newRepetitions = 0;
        newInterval = 1;
      } else {
        newRepetitions = srsData.repetitions + 1;
        if (newRepetitions === 1) {
          newInterval = 1;
        } else if (newRepetitions === 2) {
          newInterval = 6;
        } else {
          newInterval = Math.round(srsData.interval_days * newEaseFactor);
        }
      }

      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

      return await base44.entities.SpacedRepetitionCard.create({
        user_email: userEmail,
        vocabulary_card_id: card.id,
        language_variant: languageVariant,
        ease_factor: newEaseFactor,
        interval_days: newInterval,
        repetitions: newRepetitions,
        next_review_date: nextReviewDate.toISOString().split('T')[0],
        last_reviewed: new Date().toISOString(),
        correct_streak: quality >= 4 ? (srsData.correct_streak || 0) + 1 : 0,
        mastery_level: newRepetitions > 5 ? 'mastered' : newRepetitions > 2 ? 'familiar' : 'learning'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spacedRepetition']);
      onComplete();
    }
  });

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(card.transliteration || card.word_hebrew);
      utterance.lang = 'he-IL';
      speechSynthesis.speak(utterance);
    }
  };

  const handleResponse = (quality) => {
    updateSRSMutation.mutate({ quality });
    const messages = ['Again', 'Hard', 'Good', 'Easy', 'Perfect'];
    toast.success(`${messages[quality - 1]}! Next review in ${quality} day${quality > 1 ? 's' : ''}`);
  };

  return (
    <div className="perspective-1000 w-full">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-96"
      >
        {/* Front */}
        <Card className={`absolute inset-0 glass-effect border-0 premium-shadow-xl rounded-[2.5rem] ${!isFlipped ? '' : 'invisible'}`} style={{ backfaceVisibility: 'hidden' }}>
          <CardContent className="flex flex-col items-center justify-center h-full p-8 space-y-6">
            <div className="text-8xl font-bold text-slate-900" dir="rtl">
              {card.word_hebrew}
            </div>
            {card.transliteration && (
              <div className="text-3xl text-slate-600">{card.transliteration}</div>
            )}
            {card.image_url && (
              <div className="text-9xl">{card.image_url}</div>
            )}
            <Button onClick={playAudio} variant="outline" size="lg" className="rounded-2xl">
              <Volume2 className="w-5 h-5 mr-2" />
              Listen
            </Button>
            <Button onClick={() => setIsFlipped(true)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl">
              Show Answer
            </Button>
          </CardContent>
        </Card>

        {/* Back */}
        <Card className={`absolute inset-0 glass-effect border-0 premium-shadow-xl rounded-[2.5rem] ${isFlipped ? '' : 'invisible'}`} style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
          <CardContent className="flex flex-col items-center justify-center h-full p-8 space-y-6">
            <div className="text-5xl font-bold text-slate-900">{card.translation}</div>
            {card.example_sentence && (
              <div className="text-xl text-slate-600 text-center italic" dir="rtl">
                "{card.example_sentence}"
              </div>
            )}
            {card.grammar_notes && (
              <div className="text-sm text-slate-500 bg-amber-50 p-4 rounded-xl border border-amber-200">
                {card.grammar_notes}
              </div>
            )}
            <div className="w-full space-y-3 pt-4">
              <div className="text-sm font-bold text-center text-slate-700">How well did you know this?</div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Again', color: 'bg-red-500', quality: 1 },
                  { label: 'Hard', color: 'bg-orange-500', quality: 2 },
                  { label: 'Good', color: 'bg-yellow-500', quality: 3 },
                  { label: 'Easy', color: 'bg-green-500', quality: 4 },
                  { label: 'Perfect', color: 'bg-blue-500', quality: 5 }
                ].map((btn) => (
                  <Button
                    key={btn.quality}
                    onClick={() => handleResponse(btn.quality)}
                    className={`${btn.color} text-white hover:opacity-90 rounded-xl`}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={() => setIsFlipped(false)} variant="ghost" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Flip Back
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}