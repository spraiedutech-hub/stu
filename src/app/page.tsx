'use client';

import { useState } from 'react';
import Header from '@/components/app/header';
import MainView from '@/components/app/main-view';
import { cn } from '@/lib/utils';

export type Language = 'en' | 'kn';

export default function Home() {
  const [language, setLanguage] = useState<Language>('kn');

  return (
    <div className={cn("flex min-h-screen w-full flex-col animated-gradient", language === 'kn' && 'font-kannada')}>
      <Header language={language} />
      <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
        <MainView language={language} setLanguage={setLanguage} />
      </main>
    </div>
  );
}
