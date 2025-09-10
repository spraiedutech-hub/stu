import { Cuboid } from 'lucide-react';
import type { FC } from 'react';

const Header: FC = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Cuboid className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            VisMesh
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
