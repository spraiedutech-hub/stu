'use client';

import Header from '@/components/app/header';
import MainView from '@/components/app/main-view';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col animated-gradient">
      <Header />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-6">
        <MainView />
      </main>
    </div>
  );
}
