import React, { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useSession } from '@/components/hooks/useSession';

function BrandInjector({ children }) {
  const { activeSchool } = useSession();

  useEffect(() => {
    if (activeSchool?.brand_color) {
      const root = document.documentElement;
      // Convert hex to HSL for Tailwind compatibility if needed, 
      // or just set a CSS variable that Tailwind config uses.
      // For this prototype, we'll assume the brand_color is a hex and we set a --brand-primary variable.
      
      root.style.setProperty('--brand-primary', activeSchool.brand_color);
      
      // If we want to override Tailwind's 'primary' color dynamically:
      // This is complex with HSL-based Tailwind, so we'll simulate it by injecting a style tag
      // that overrides the .bg-primary classes if needed. 
      // For now, setting the var is the clean way.
    }
  }, [activeSchool]);

  return children;
}

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
    >
      <BrandInjector>
        {children}
      </BrandInjector>
    </NextThemesProvider>
  );
}
