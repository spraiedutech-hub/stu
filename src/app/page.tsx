import Header from '@/components/app/header';
import MainView from '@/components/app/main-view';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col animated-gradient">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
        <MainView />
      </main>
      <footer className="space-y-1 py-6 text-center text-sm text-foreground/50">
        <p>Created by SPR AI Edutech</p>
        <p>Behind Karnataka Bank, Hosadurga, Chitradurga dist. Ph: 7022070287</p>
      </footer>
    </div>
  );
}
