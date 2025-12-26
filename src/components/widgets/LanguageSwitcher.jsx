import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState('en');

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'he', label: 'עברית', flag: '🇮🇱' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ];

  return (
    <div className="relative group">
      <Button variant="ghost" size="icon" className="rounded-full">
        <Languages className="w-5 h-5" />
      </Button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="glass-effect border-0 premium-shadow-xl rounded-2xl p-2 min-w-[150px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                language === lang.code
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium text-sm">{lang.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}