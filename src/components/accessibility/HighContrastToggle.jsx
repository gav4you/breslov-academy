import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Contrast } from 'lucide-react';

export default function HighContrastToggle() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('highContrast');
    if (saved === 'true') {
      setHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  const toggle = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  return (
    <Button
      onClick={toggle}
      variant={highContrast ? 'default' : 'outline'}
      size="sm"
      className="rounded-xl"
    >
      <Contrast className="w-4 h-4 mr-2" />
      {highContrast ? 'Normal' : 'High'} Contrast
    </Button>
  );
}