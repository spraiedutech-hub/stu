import Header from '@/components/app/header';
import MainView from '@/components/app/main-view';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <MainView />
    </div>
  );
}
