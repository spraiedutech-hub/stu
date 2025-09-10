'use client';

import { useEffect, useActionState } from 'react';
import { generateAnimationAction } from '@/app/actions';
import ControlPanel from './control-panel';
import PreviewPanel from './preview-panel';
import { useToast } from "@/hooks/use-toast"

const animationPresets = [
  { id: 'spin', label: 'Spin', description: 'Rotates the object around its center.' },
  { id: 'bounce', label: 'Bounce', description: 'Makes the object bounce up and down.' },
  { id: 'pulse', label: 'Pulse', description: 'Gently scales the object in and out.' },
  { id: 'float', label: 'Float', description: 'The object drifts slowly in space.' },
];

const initialState: { videoUri: string | null; error: string | null; } = { videoUri: null, error: null };

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
          <ControlPanel presets={animationPresets} />
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          <PreviewPanel videoUri={state.videoUri} />
        </div>
      </form>
    </main>
  );
}
