import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Volume2, Check, X, Sparkles, Trophy, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RosettaStoneLesson() {
  const [user, setUser] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const languageId = urlParams.get('lang') || 'biblical_hebrew';
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: progress } = useQuery({
    queryKey: ['languageProgress', user?.email, languageId],
    queryFn: async () => {
      const progs = await base44.entities.LanguageProgress.filter({
        user_email: user.email,
        language_variant: languageId
      });
      return progs[0];
    },
    enabled: !!user?.email
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (progress) {
        return await base44.entities.LanguageProgress.update(progress.id, data);
      } else {
        return await base44.entities.LanguageProgress.create({
          user_email: user.email,
          language_variant: languageId,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['languageProgress']);
    }
  });

  // Sample lessons with immersive visual learning
  const lessons = {
    biblical_hebrew: [
      {
        type: 'image-word',
        question: 'Which image represents this word?',
        word: 'אֱלֹהִים',
        transliteration: 'Elohim',
        images: [
          { id: 1, url: '🌟', alt: 'star' },
          { id: 2, url: '☁️', alt: 'divine light', correct: true },
          { id: 3, url: '🌊', alt: 'water' },
          { id: 4, url: '🏔️', alt: 'mountain' }
        ]
      },
      {
        type: 'listening',
        question: 'Type what you hear',
        word: 'שָׁלוֹם',
        transliteration: 'Shalom',
        correctAnswer: 'שלום'
      },
      {
        type: 'image-word',
        question: 'Select the correct word for this image',
        word: null,
        images: [{ id: 1, url: '📖', alt: 'book', correct: true }],
        options: ['סֵפֶר', 'מַיִם', 'אוֹר', 'שָׁמַיִם'],
        correctAnswer: 'סֵפֶר'
      },
      {
        type: 'audio-match',
        question: 'Listen and select the matching image',
        word: 'תּוֹרָה',
        transliteration: 'Torah',
        images: [
          { id: 1, url: '📜', alt: 'scroll', correct: true },
          { id: 2, url: '🎵', alt: 'music' },
          { id: 3, url: '🏛️', alt: 'temple' },
          { id: 4, url: '👑', alt: 'crown' }
        ]
      },
      {
        type: 'sentence-build',
        question: 'Arrange the words to form the phrase',
        correctOrder: ['בְּרֵאשִׁית', 'בָּרָא', 'אֱלֹהִים'],
        translation: 'In the beginning, God created',
        words: ['אֱלֹהִים', 'בָּרָא', 'בְּרֵאשִׁית']
      },
      {
        type: 'image-word',
        question: 'Which word matches this image?',
        images: [{ id: 1, url: '💧', alt: 'water' }],
        options: ['אוֹר', 'מַיִם', 'אֶרֶץ', 'רוּחַ'],
        correctAnswer: 'מַיִם'
      }
    ],
    aramaic: [
      {
        type: 'image-word',
        question: 'Which image represents this Aramaic word?',
        word: 'מַלְכָּא',
        transliteration: 'Malka',
        images: [
          { id: 1, url: '👑', alt: 'king', correct: true },
          { id: 2, url: '⚔️', alt: 'sword' },
          { id: 3, url: '🏰', alt: 'castle' },
          { id: 4, url: '📜', alt: 'decree' }
        ]
      }
    ],
    modern_hebrew: [
      {
        type: 'image-word',
        question: 'Select the matching image',
        word: 'שָׁלוֹם',
        transliteration: 'Shalom',
        images: [
          { id: 1, url: '👋', alt: 'greeting', correct: true },
          { id: 2, url: '🏠', alt: 'house' },
          { id: 3, url: '🍞', alt: 'bread' },
          { id: 4, url: '☕', alt: 'coffee' }
        ]
      }
    ]
  };

  const currentLessons = lessons[languageId] || lessons.biblical_hebrew;
  const lesson = currentLessons[currentQuestion];
  const totalQuestions = currentLessons.length;

  const playAudio = () => {
    if ('speechSynthesis' in window && lesson.word) {
      const utterance = new SpeechSynthesisUtterance(lesson.transliteration || lesson.word);
      utterance.lang = 'he-IL';
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (answer) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    
    let correct = false;
    if (lesson.type === 'image-word' && lesson.images) {
      const img = lesson.images.find(i => i.id === answer);
      correct = img?.correct;
    } else if (lesson.options) {
      correct = answer === lesson.correctAnswer;
    } else if (lesson.type === 'audio-match') {
      const img = lesson.images.find(i => i.id === answer);
      correct = img?.correct;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
      toast.success('נכון! Correct!', { icon: '✅' });
    } else {
      toast.error('לא נכון. Try again!', { icon: '❌' });
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Lesson complete
      const newLevel = (progress?.level || 1) + 1;
      updateProgressMutation.mutate({
        level: newLevel,
        units_completed: [...(progress?.units_completed || []), `unit_${newLevel}`],
        total_minutes_studied: (progress?.total_minutes_studied || 0) + 10,
        last_studied: new Date().toISOString()
      });
      toast.success('Lesson Complete! 🎉');
    }
  };

  if (!lesson) {
    return <div className="text-center py-20">Loading lesson...</div>;
  }

  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('LanguageVariants')}>
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Languages
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-xl">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="font-bold text-orange-900">{progress?.daily_streak || 0}</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-xl">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-amber-900">{score}/{totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold text-slate-700">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
              <CardContent className="p-10 space-y-8">
                {/* Question */}
                <div className="text-center space-y-4">
                  <Badge className="bg-purple-100 text-purple-800 text-sm">
                    {lesson.type.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <h2 className="text-2xl font-bold text-slate-900">{lesson.question}</h2>
                </div>

                {/* Word Display */}
                {lesson.word && (
                  <div className="text-center space-y-3">
                    <div className="text-7xl font-bold text-slate-900" dir="rtl">
                      {lesson.word}
                    </div>
                    {lesson.transliteration && (
                      <div className="text-2xl text-slate-600 font-serif">
                        {lesson.transliteration}
                      </div>
                    )}
                    <Button
                      onClick={playAudio}
                      variant="outline"
                      size="lg"
                      className="rounded-2xl"
                    >
                      <Volume2 className="w-5 h-5 mr-2" />
                      Listen
                    </Button>
                  </div>
                )}

                {/* Image Options */}
                {lesson.images && lesson.type !== 'sentence-build' && (
                  <div className="grid grid-cols-2 gap-4">
                    {lesson.images.map((img) => (
                      <motion.button
                        key={img.id}
                        onClick={() => handleAnswer(lesson.options ? null : img.id)}
                        disabled={showFeedback}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative aspect-square rounded-3xl flex items-center justify-center text-8xl transition-all ${
                          selectedAnswer === img.id
                            ? isCorrect
                              ? 'bg-green-100 border-4 border-green-500'
                              : 'bg-red-100 border-4 border-red-500'
                            : 'bg-white hover:bg-slate-50 border-4 border-slate-200'
                        }`}
                      >
                        {img.url}
                        {showFeedback && selectedAnswer === img.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4"
                          >
                            {isCorrect ? (
                              <Check className="w-8 h-8 text-green-600" />
                            ) : (
                              <X className="w-8 h-8 text-red-600" />
                            )}
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Word Options */}
                {lesson.options && (
                  <div className="grid grid-cols-2 gap-4">
                    {lesson.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleAnswer(option)}
                        disabled={showFeedback}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative p-8 rounded-3xl text-4xl font-bold transition-all ${
                          selectedAnswer === option
                            ? isCorrect
                              ? 'bg-green-100 border-4 border-green-500'
                              : 'bg-red-100 border-4 border-red-500'
                            : 'bg-white hover:bg-slate-50 border-4 border-slate-200'
                        }`}
                        dir="rtl"
                      >
                        {option}
                        {showFeedback && selectedAnswer === option && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-4 right-4"
                          >
                            {isCorrect ? (
                              <Check className="w-6 h-6 text-green-600" />
                            ) : (
                              <X className="w-6 h-6 text-red-600" />
                            )}
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Next Button */}
                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Button
                      onClick={nextQuestion}
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-6 rounded-2xl"
                    >
                      {currentQuestion < totalQuestions - 1 ? 'Next Question' : 'Complete Lesson'}
                      <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}