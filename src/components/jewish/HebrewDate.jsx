import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Moon } from 'lucide-react';

export default function HebrewDate() {
  const [hebrewDate, setHebrewDate] = useState(null);

  useEffect(() => {
    // In production, use proper Hebrew calendar library
    const hebrewMonths = ['Tishrei', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar', 'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'];
    const hebrewMonthsHebrew = ['תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר', 'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'];
    
    const today = new Date();
    const monthIndex = (today.getMonth() + 7) % 12; // Approximate
    const day = today.getDate();
    const year = 5785; // 2024-2025 is 5785

    setHebrewDate({
      day,
      month: hebrewMonths[monthIndex],
      monthHebrew: hebrewMonthsHebrew[monthIndex],
      year,
      dayOfWeek: today.toLocaleDateString('en-US', { weekday: 'long' })
    });
  }, []);

  if (!hebrewDate) return null;

  return (
    <div className="inline-flex items-center gap-2">
      <Badge className="bg-blue-100 text-blue-800 flex items-center gap-2">
        <Calendar className="w-3 h-3" />
        <span>{hebrewDate.dayOfWeek}</span>
      </Badge>
      <Badge className="bg-purple-100 text-purple-800" dir="rtl">
        {hebrewDate.day} {hebrewDate.monthHebrew} {hebrewDate.year}
      </Badge>
    </div>
  );
}