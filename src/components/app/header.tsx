import { Cuboid } from 'lucide-react';
import type { FC } from 'react';

const Header: FC = () => {
  const title = 'SPR AI VisMesh';
  return (
    <header className="border-b border-white/10 bg-card/50 backdrop-blur-lg sticky top-0 z-10">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Cuboid className="h-7 w-7 text-primary animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground animated-title">
            {title.split('').map((letter, index) => (
              <span
                key={index}
                className="animated-letter"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
