import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Volume2, TextCursorInput } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SiddurViewer() {
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  const prayer = {
    hebrew: 'מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם',
    transliteration: 'Modeh ani lefanecha melech chai vekayam',
    translation: 'I gratefully thank You, living and eternal King'
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Siddur
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setFontSize(fontSize - 2)}
              variant="ghost"
              size="sm"
              className="rounded-lg"
            >
              A-
            </Button>
            <Button
              onClick={() => setFontSize(fontSize + 2)}
              variant="ghost"
              size="sm"
              className="rounded-lg"
            >
              A+
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl"
          dir="rtl"
        >
          <p
            className="text-slate-900 font-bold leading-loose text-center"
            style={{ fontSize: `${fontSize}px` }}
          >
            {prayer.hebrew}
          </p>
        </motion.div>

        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-700 italic">{prayer.transliteration}</p>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <p className="text-slate-700">{prayer.translation}</p>
            </div>
          </motion.div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => setShowTranslation(!showTranslation)}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            <TextCursorInput className="w-4 h-4 mr-2" />
            {showTranslation ? 'Hide' : 'Show'} Translation
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}