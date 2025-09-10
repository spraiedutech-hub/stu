'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { generateAnimationAction } from '@/app/actions';
import ControlPanel from './control-panel';
import PreviewPanel from './preview-panel';
import { useToast } from "@/hooks/use-toast"

const stylePresets = [
  { id: 'realistic', label: 'Realistic', description: 'Aims for a photorealistic representation.' },
  { id: 'cartoonish', label: 'Cartoonish', description: 'Stylized, with exaggerated features.' },
  { id: 'low-poly', label: 'Low Poly', description: 'A minimalistic, geometric art style.' },
  { id: 'sculpture', label: 'Sculpture', description: 'Looks like a classical stone sculpture.' },
];

const initialState: { meshDataUri: string | null; error: string | null; } = { meshDataUri: null, error: null };

export default function MainView() {
  const [state, formAction] = useActionState(generateAnimationAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
        toast({
            variant: "destructive",
            title: "Generation Error",
            description: state.error,
        });
    }
  }, [state.error, toast]);

  return (
    <main className="container mx-auto flex-1 px-4 py-8 md:px-6">
      <form action={formAction} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <ControlPanel presets={stylePresets} />
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          <PreviewPanel meshDataUri={state.meshDataUri} />
        </div>
      </form>
    </main>
  );
}
