'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { generateModelAction, createAnimationAction } from '@/app/actions';
import ControlPanel from './control-panel';
import PreviewPanel from './preview-panel';
import { useToast } from "@/hooks/use-toast";

const stylePresets = [
  { id: 'realistic', label: 'Realistic', description: 'Aims for a photorealistic representation.' },
  { id: 'cartoonish', label: 'Cartoonish', description: 'Stylized, with exaggerated features.' },
  { id: 'low-poly', label: 'Low Poly', description: 'A minimalistic, geometric art style.' },
  { id: 'sculpture', label: 'Sculpture', description: 'Looks like a classical stone sculpture.' },
];

const initialModelState: { meshDataUri: string | null; videoDataUri: string | null; error: string | null; } = { meshDataUri: null, videoDataUri: null, error: null };
const initialAnimationState: { meshDataUri: string | null; videoDataUri: string | null; error: string | null; } = { meshDataUri: null, videoDataUri: null, error: null };

export default function MainView() {
  const [modelState, modelAction, isModelPending] = useActionState(generateModelAction, initialModelState);
  const [animationState, animationAction, isAnimationPending] = useActionState(createAnimationAction, initialAnimationState);
  const { toast } = useToast();

  // Combine states for the PreviewPanel
  const displayState = {
    meshDataUri: animationState.meshDataUri || modelState.meshDataUri,
    videoDataUri: animationState.videoDataUri,
  }

  // Handle errors from both actions
  useEffect(() => {
    const error = modelState.error || animationState.error;
    if (error) {
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: error,
      });
    }
  }, [modelState.error, animationState.error, toast]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-4 xl:col-span-3">
        <form action={modelAction}>
            <ControlPanel presets={stylePresets} isModelPending={isModelPending} />
        </form>
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <PreviewPanel 
            meshDataUri={displayState.meshDataUri}
            videoDataUri={displayState.videoDataUri}
            isModelPending={isModelPending}
            isAnimationPending={isAnimationPending}
            animationAction={animationAction}
        />
      </div>
    </div>
  );
}
