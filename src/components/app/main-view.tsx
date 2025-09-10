'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { generateModelAction, createAnimationAction } from '@/app/actions';
import ControlPanel from './control-panel';
import PreviewPanel from './preview-panel';
import { useToast } from "@/hooks/use-toast";
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const stylePresets = [
  { id: 'realistic', label: 'Realistic', description: 'Aims for a photorealistic representation.' },
  { id: 'cartoonish', label: 'Cartoonish', description: 'Stylized, with exaggerated features.' },
  { id: 'low-poly', label: 'Low Poly', description: 'A minimalistic, geometric art style.' },
  { id: 'sculpture', label: 'Sculpture', description: 'Looks like a classical stone sculpture.' },
  { id: 'claymation', label: 'Claymation', description: 'A stop-motion, handcrafted look.' },
];

const initialModelState: { meshDataUri: string | null; previewImageUri: string | null; videoDataUri: string | null; error: string | null; } = { meshDataUri: null, previewImageUri: null, videoDataUri: null, error: null };
const initialAnimationState: { meshDataUri: string | null; previewImageUri: string | null; videoDataUri: string | null; error: string | null; } = { meshDataUri: null, previewImageUri: null, videoDataUri: null, error: null };

export default function MainView() {
  const [modelState, modelAction, isModelPending] = useActionState(generateModelAction, initialModelState);
  const [animationState, animationAction, isAnimationPending] = useActionState(createAnimationAction, initialAnimationState);
  const { toast } = useToast();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const displayState = {
    meshDataUri: animationState.meshDataUri || modelState.meshDataUri,
    previewImageUri: animationState.previewImageUri || modelState.previewImageUri,
    videoDataUri: animationState.videoDataUri,
  }

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

  // When a model is successfully generated, clear the initial image preview
  useEffect(() => {
    if (modelState.meshDataUri) {
        setImagePreview(null);
        setImageFile(null);
    }
  }, [modelState.meshDataUri]);


  const animationActionWithState = (formData: FormData) => {
    if (displayState.meshDataUri) {
      formData.set('meshDataUri', displayState.meshDataUri);
    }
    if (displayState.previewImageUri) {
        formData.set('previewImageUri', displayState.previewImageUri);
    }
    animationAction(formData);
  };

  const line1 = "Created by SPR AI Edutech";
  const line2 = "Behind Karnataka Bank, Hosadurga, Chitradurga dist. Ph: 7022070287";


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-4 xl:col-span-3">
        <form action={modelAction}>
            <ControlPanel
                presets={stylePresets} 
                isModelPending={isModelPending}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                imageFile={imageFile}
                setImageFile={setImageFile}
            />
        </form>
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
        <div className="flex h-full flex-col">
            <div className="flex-1">
                <PreviewPanel 
                    meshDataUri={displayState.meshDataUri}
                    previewImageUri={displayState.previewImageUri}
                    videoDataUri={displayState.videoDataUri}
                    isModelPending={isModelPending}
                    isAnimationPending={isAnimationPending}
                    animationAction={animationActionWithState}
                    inputImagePreview={imagePreview}
                />
            </div>
            <footer className="w-full py-4 text-center text-sm text-foreground/50">
              <div className="animated-title flex items-center justify-center">
                  {line1.split('').map((letter, index) => (
                      <span
                          key={index}
                          className="animated-letter"
                          style={{ animationDelay: `${index * 0.05}s` }}
                      >
                          {letter === ' ' ? '\u00A0' : letter}
                      </span>
                  ))}
              </div>
              <div className="animated-title flex items-center justify-center gap-1">
                  {[
                    <MapPin key="map-pin" className="h-4 w-4" />,
                    ...line2.split(''),
                  ].map((char, index) => (
                    <span
                      key={index}
                      className="animated-letter"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {typeof char === 'string' && char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
              </div>
            </footer>
        </div>
      </div>
    </div>
  );
}
