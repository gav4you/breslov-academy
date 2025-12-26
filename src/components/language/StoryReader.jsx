import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Eye, EyeOff, BookOpen, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoryReader({ story, onComplete }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  const playAudio = () => {
    if ('speechSynthesis' in window && story.story_text) {
      const utterance = new SpeechSynthesisUtterance(story.story_text);
      utterance.lang = 'he-IL';
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswer = (answer) => {
    setAnswers([...answers, answer]);
    if (currentQuestion < (story.comprehension_questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete(answers);
    }
  };

  const renderStoryText = () => {
    if (!story.vocabulary_highlights) return story.story_text;
    
    let text = story.story_text;
    story.vocabulary_highlights.forEach((vocab, idx) => {
      const regex = new RegExp(vocab.word, 'g');
      text = text.replace(regex, `<mark class="bg-yellow-200 cursor-pointer hover:bg-yellow-300 rounded px-1" data-idx="${idx}">${vocab.word}</mark>`);
    });
    return text;
  };

  return (
    <div className="space-y-6">
      {/* Story Card */}
      <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">{story.title}</CardTitle>
              {story.title_hebrew && (
                <div className="text-xl text-amber-700 mt-1" dir="rtl">{story.title_hebrew}</div>
              )}
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              Level {story.difficulty_level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Controls */}
          <div className="flex gap-3">
            <Button onClick={playAudio} variant="outline" className="rounded-xl">
              <Volume2 className="w-4 h-4 mr-2" />
              Listen
            </Button>
            <Button
              onClick={() => setShowTranslation(!showTranslation)}
              variant="outline"
              className="rounded-xl"
            >
              {showTranslation ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showTranslation ? 'Hide' : 'Show'} Translation
            </Button>
          </div>

          {/* Story Text */}
          <div className="space-y-4">
            <div
              className="text-2xl leading-relaxed text-slate-900"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: renderStoryText() }}
              onClick={(e) => {
                const idx = e.target.getAttribute('data-idx');
                if (idx) setHighlightedWord(parseInt(idx));
              }}
            />
            
            {showTranslation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-lg text-slate-600 p-4 bg-slate-50 rounded-2xl border border-slate-200"
              >
                {story.translation}
              </motion.div>
            )}
          </div>

          {/* Vocabulary Tooltip */}
          {highlightedWord !== null && story.vocabulary_highlights?.[highlightedWord] && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-blue-500 rounded-2xl p-4 shadow-xl"
            >
              <div className="font-bold text-blue-900">
                {story.vocabulary_highlights[highlightedWord].word}
              </div>
              <div className="text-slate-600">
                {story.vocabulary_highlights[highlightedWord].translation}
              </div>
            </motion.div>
          )}

          {/* Cultural Context */}
          {story.cultural_context && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-amber-600 mt-1" />
                <div>
                  <div className="font-bold text-amber-900 mb-1">Cultural Context</div>
                  <div className="text-sm text-amber-800">{story.cultural_context}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comprehension Questions */}
      {story.comprehension_questions && story.comprehension_questions.length > 0 && (
        <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Comprehension Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion < story.comprehension_questions.length ? (
              <div className="space-y-4">
                <div className="text-xl font-bold text-slate-900">
                  {story.comprehension_questions[currentQuestion].question}
                </div>
                <div className="grid gap-3">
                  {story.comprehension_questions[currentQuestion].options.map((option, idx) => (
                    <Button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      variant="outline"
                      className="w-full text-left p-4 rounded-2xl hover:bg-blue-50 hover:border-blue-500"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <div className="text-2xl font-bold text-green-600 mb-2">Story Complete!</div>
                <div className="text-slate-600">
                  You answered {answers.filter((a, i) => a === story.comprehension_questions[i].correct).length} out of {story.comprehension_questions.length} correctly
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}