import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'yi', name: 'ייִדיש', flag: '🕍' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <Globe className="w-4 h-4 mr-2" />
          {languages.find(l => l.code === language)?.flag}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full p-2 rounded-lg text-left flex items-center gap-3 ${
                language === lang.code 
                  ? 'bg-blue-100 text-blue-900' 
                  : 'hover:bg-slate-100'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-sm font-semibold">{lang.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}