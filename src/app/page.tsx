import Header from '@/components/app/header';
import MainView from '@/components/app/main-view';

const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
  return (
    <p className={`animated-title ${className}`}>
      {text.split('').map((letter, index) => (
        <span
          key={index}
          className="animated-letter"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </p>
  );
};

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col animated-gradient">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
        <MainView />
      </main>
      <footer className="space-y-1 py-6 text-center text-sm text-foreground/50">
        <AnimatedText text="Created by SPR AI Edutech" />
        <AnimatedText text="Behind Karnataka Bank, Hosadurga, Chitradurga dist. Ph: 7022070287" />
      </footer>
    </div>
  );
}
