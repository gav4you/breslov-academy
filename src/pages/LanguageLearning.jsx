import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, MessageCircle, PenTool, Repeat, FileText, Trophy } from 'lucide-react';
import SpacedRepetition from '../components/language/SpacedRepetition';
import ConversationSimulator from '../components/language/ConversationSimulator';
import StoryReader from '../components/language/StoryReader';
import WritingPractice from '../components/language/WritingPractice';
import DailyGoals from '../components/language/DailyGoals';

export default function LanguageLearning() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const languageId = urlParams.get('lang') || 'biblical_hebrew';

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

  // Sample data
  const sampleVocab = [
    {
      id: '1',
      word_hebrew: 'שָׁלוֹם',
      transliteration: 'Shalom',
      translation: 'Peace, Hello, Goodbye',
      example_sentence: 'שָׁלוֹם עֲלֵיכֶם',
      image_url: '👋',
      grammar_notes: 'Used for greetings and farewells'
    }
  ];

  const sampleConversation = {
    conversation_title: 'Meeting Someone New',
    scenario: 'Introducing yourself in Hebrew',
    cultural_notes: 'Israelis often use informal greetings even with strangers',
    dialogue: [
      {
        speaker: 'Person',
        hebrew: 'שָׁלוֹם! מַה שְׁמֶךָ?',
        transliteration: 'Shalom! Ma shimcha?',
        translation: 'Hello! What is your name?'
      },
      {
        speaker: 'you',
        hebrew: 'שְׁמִי דָּוִד',
        transliteration: 'Shmi David',
        translation: 'My name is David',
        responses: [
          {
            hebrew: 'שְׁמִי דָּוִד',
            translation: 'My name is David'
          },
          {
            hebrew: 'אֲנִי דָּוִד',
            translation: 'I am David'
          }
        ]
      }
    ]
  };

  const sampleStory = {
    title: 'A Day in Jerusalem',
    title_hebrew: 'יוֹם בִּירוּשָׁלַיִם',
    story_text: 'הַיּוֹם יוֹם יָפֶה בִּירוּשָׁלַיִם. הַשֶּׁמֶשׁ זוֹרַחַת וְהָעִיר מְלֵאָה חַיִּים.',
    translation: 'Today is a beautiful day in Jerusalem. The sun is shining and the city is full of life.',
    difficulty_level: 1,
    vocabulary_highlights: [
      { word: 'יוֹם', translation: 'day' },
      { word: 'יָפֶה', translation: 'beautiful' }
    ],
    cultural_context: 'Jerusalem is the spiritual heart of Judaism',
    comprehension_questions: [
      {
        question: 'What is the weather like?',
        options: ['Rainy', 'Sunny', 'Cloudy', 'Windy'],
        correct: 'Sunny'
      }
    ]
  };

  const sampleWriting = {
    type: 'sentence',
    prompt: 'Write "Good morning" in Hebrew',
    hint: 'Think about the word for morning (בֹּקֶר)',
    correct_answer: 'בֹּקֶר טוֹב',
    common_mistakes: ['forgetting the vowels', 'wrong word order']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('LanguageVariants')}>
            <Button variant="ghost" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Languages
            </Button>
          </Link>
          <h1 className="text-3xl font-black text-slate-900">
            {languageId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h1>
        </div>

        {/* Daily Goals */}
        <DailyGoals progress={progress} />

        {/* Learning Modes */}
        <Tabs defaultValue="vocabulary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl">
            <TabsTrigger value="vocabulary" className="rounded-xl">
              <Repeat className="w-4 h-4 mr-2" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="conversation" className="rounded-xl">
              <MessageCircle className="w-4 h-4 mr-2" />
              Conversation
            </TabsTrigger>
            <TabsTrigger value="stories" className="rounded-xl">
              <FileText className="w-4 h-4 mr-2" />
              Stories
            </TabsTrigger>
            <TabsTrigger value="writing" className="rounded-xl">
              <PenTool className="w-4 h-4 mr-2" />
              Writing
            </TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-xl">
              <Trophy className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vocabulary">
            <SpacedRepetition
              card={sampleVocab[0]}
              onComplete={() => console.log('completed')}
              userEmail={user?.email}
              languageVariant={languageId}
            />
          </TabsContent>

          <TabsContent value="conversation">
            <ConversationSimulator
              conversation={sampleConversation}
              onComplete={() => console.log('conversation complete')}
            />
          </TabsContent>

          <TabsContent value="stories">
            <StoryReader
              story={sampleStory}
              onComplete={(answers) => console.log('story complete', answers)}
            />
          </TabsContent>

          <TabsContent value="writing">
            <WritingPractice
              exercise={sampleWriting}
              onComplete={() => console.log('writing complete')}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black mb-6">Your Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Level</span>
                      <span className="font-black text-2xl text-blue-600">{progress?.level || 1}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Words Mastered</span>
                      <span className="font-black text-2xl text-green-600">{progress?.vocabulary_mastered?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Study Time</span>
                      <span className="font-black text-2xl text-purple-600">{progress?.total_minutes_studied || 0} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Streak</span>
                      <span className="font-black text-2xl text-orange-600">{progress?.daily_streak || 0} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black mb-6">Achievements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                      <div className="text-3xl">🏆</div>
                      <div>
                        <div className="font-bold text-slate-900">First Steps</div>
                        <div className="text-sm text-slate-600">Complete first lesson</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="text-3xl">📚</div>
                      <div>
                        <div className="font-bold text-slate-900">Scholar</div>
                        <div className="text-sm text-slate-600">Master 50 words</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="text-3xl">🔥</div>
                      <div>
                        <div className="font-bold text-slate-900">Dedicated</div>
                        <div className="text-sm text-slate-600">7-day streak</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}