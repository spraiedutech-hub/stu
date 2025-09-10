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
  { id: 'claymation', label: 'Claymation', description: 'A stop-motion, handcrafted look.' },
];

const initialModelState: { meshDataUri: string | null; previewImageDataUri: string | null; videoDataUri: string | null; error: string | null; } = { meshDataUri: null, previewImageDataUri: null, videoDataUri: null, error: null };
const initialAnimationState: { meshDataUri: string | null; previewImageDataUri: string | null; videoDataUri: string | null; error: string | null; } = { meshDataUri: null, previewImageDataUri: null, videoDataUri: null, error: null };

export default function MainView() {
  const [modelState, modelAction, isModelPending] = useActionState(generateModelAction, initialModelState);
  const [animationState, animationAction, isAnimationPending] = useActionState(createAnimationAction, initialAnimationState);
  const { toast } = useToast();

  // Combine states for the PreviewPanel, ensuring the latest data is always shown.
  // When an animation is created, its state will include the original mesh and preview data.
  const displayState = {
    meshDataUri: animationState.meshDataUri || modelState.meshDataUri,
    previewImageDataUri: animationState.previewImageDataUri || modelState.previewImageDataUri,
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

  // When animation action is triggered, it needs access to the current mesh and preview data.
  // We create a new form action function that injects this data.
  const animationActionWithState = (formData: FormData) => {
    if (displayState.meshDataUri) {
      formData.set('meshDataUri', displayState.meshDataUri);
    }
    animationAction(formData);
  };

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
            previewImageDataUri={displayState.previewImageDataUri}
            videoDataUri={displayState.videoDataUri}
            isModelPending={isModelPending}
            isAnimationPending={isAnimationPending}
            animationAction={animationActionWithState}
        />
      </div>
    </div>
  );
}
