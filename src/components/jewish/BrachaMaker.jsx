import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BrachaMaker() {
  const [category, setCategory] = useState('food');
  
  const brachot = {
    food: {
      hebrew: 'בָּרוּךְ אַתָּה ה\' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמּוֹצִיא לֶחֶם מִן הָאָרֶץ',
      english: 'Blessed are You, Lord our God, King of the universe, who brings forth bread from the earth',
      transliteration: 'Baruch atah Adonai, Eloheinu melech ha\'olam, hamotzi lechem min ha\'aretz'
    },
    wine: {
      hebrew: 'בָּרוּךְ אַתָּה ה\' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, בּוֹרֵא פְּרִי הַגָּפֶן',
      english: 'Blessed are You, Lord our God, King of the universe, who creates the fruit of the vine',
      transliteration: 'Baruch atah Adonai, Eloheinu melech ha\'olam, borei p\'ri hagafen'
    }
  };

  const currentBracha = brachot[category];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          Bracha Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button
            onClick={() => setCategory('food')}
            variant={category === 'food' ? 'default' : 'outline'}
            className="flex-1 rounded-xl"
          >
            Bread
          </Button>
          <Button
            onClick={() => setCategory('wine')}
            variant={category === 'wine' ? 'default' : 'outline'}
            className="flex-1 rounded-xl"
          >
            Wine
          </Button>
        </div>

        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl" dir="rtl">
            <div className="text-3xl text-slate-900 font-bold leading-relaxed text-center">
              {currentBracha.hebrew}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-slate-700 italic">{currentBracha.transliteration}</p>
          </div>

          <div className="p-4 bg-white rounded-xl">
            <p className="text-slate-700">{currentBracha.english}</p>
          </div>

          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl">
            <Volume2 className="w-4 h-4 mr-2" />
            Listen to Pronunciation
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}