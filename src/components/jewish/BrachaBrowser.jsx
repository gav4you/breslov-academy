import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Volume2, BookOpen, Star } from 'lucide-react';

export default function BrachaBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const brachot = [
    {
      category: 'Food',
      name: 'HaMotzi',
      hebrew: 'המוציא',
      text: 'Baruch atah Hashem, Elokeinu melech ha\'olam, hamotzi lechem min ha\'aretz',
      hebrewFull: 'ברוך אתה ה\' אלוקינו מלך העולם המוציא לחם מן הארץ',
      translation: 'Blessed are You, Lord our God, King of the universe, who brings forth bread from the earth',
      when: 'Before eating bread'
    },
    {
      category: 'Morning',
      name: 'Modeh Ani',
      hebrew: 'מודה אני',
      text: 'Modeh ani lefanecha...',
      hebrewFull: 'מודה אני לפניך מלך חי וקיים שהחזרת בי נשמתי בחמלה רבה אמונתך',
      translation: 'I give thanks before You, living and eternal King, for You have mercifully restored my soul within me',
      when: 'Upon waking'
    },
    {
      category: 'Torah',
      name: 'Al Divrei Torah',
      hebrew: 'על דברי תורה',
      text: 'Baruch atah Hashem... asher kideshanu bemitzvotav vetzivanu la\'asok bedivrei Torah',
      hebrewFull: 'ברוך אתה ה\' אלוקינו מלך העולם אשר קדשנו במצותיו וצונו לעסוק בדברי תורה',
      translation: 'Blessed are You, Lord our God, King of the universe, who has sanctified us with His commandments and commanded us to engage in words of Torah',
      when: 'Before Torah study'
    }
  ];

  const categories = ['all', 'Food', 'Morning', 'Torah', 'Nature', 'Special'];

  const filteredBrachot = brachot.filter(b => 
    (selectedCategory === 'all' || b.category === selectedCategory) &&
    (searchTerm === '' || 
     b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     b.when.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Star className="w-5 h-5 text-amber-600" />
          <div>
            <div>Bracha Browser</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">מאגר ברכות</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brachot..."
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat, idx) => (
            <Badge
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`cursor-pointer capitalize ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 hover:bg-blue-50'
              }`}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredBrachot.map((bracha, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-amber-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-black text-slate-900 text-lg">{bracha.name}</div>
                  <div className="text-amber-700 font-serif text-sm" dir="rtl">{bracha.hebrew}</div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {bracha.category}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-lg font-serif leading-relaxed" dir="rtl">
                    {bracha.hebrewFull}
                  </div>
                </div>

                <div className="text-sm text-slate-700 italic">
                  {bracha.translation}
                </div>

                <div className="text-xs text-slate-600">
                  <strong>When:</strong> {bracha.when}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speak(bracha.hebrewFull)}
                  className="flex-1 rounded-lg"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}