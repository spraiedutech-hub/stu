'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { generateModelAction, createAnimationAction } from '@/app/actions';
import ControlPanel from './control-panel';
import PreviewPanel from './preview-panel';
import { useToast } from "@/hooks/use-toast";
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Language } from '@/app/page';

const translations = {
  en: {
    title: 'Create your 3D model',
    cardDescription: 'Upload an image and guide the generation.',
    uploadLabel: 'Click or drag to upload',
    orSeparator: 'OR',
    useCamera: 'Use Camera',
    customPromptLabel: 'Custom Prompt (Optional)',
    customPromptPlaceholder: "e.g., 'a futuristic version of the object', 'make it look like it is made of wood'",
    languageLabel: 'Language:',
    stylePresetLabel: 'Style Preset',
    stylePresetPlaceholder: 'Select a style',
    generateModel: 'Generate Model',
    generating: 'Generating...',
    cameraTitle: 'Capture from Camera',
    cameraAccessDenied: 'Camera Access Denied',
    cameraAccessDescription: 'Please enable camera permissions in your browser settings to use this feature.',
    permissionRequired: 'Permission Required',
    permissionDescription: 'Camera access is needed to capture a photo. Please update your browser settings.',
    cancel: 'Cancel',
    capturePhoto: 'Capture Photo',
    footerLine1: 'Created by SPR AI Edutech',
    footerLine2: 'Behind Karnataka Bank, Hosadurga, Chitradurga dist. Ph: 7022070287',
    errorTitle: "Generation Error",
    stylePresets: [
      { id: 'realistic', label: 'Realistic', description: 'Aims for a photorealistic representation.' },
      { id: 'cartoonish', label: 'Cartoonish', description: 'Stylized, with exaggerated features.' },
      { id: 'low-poly', label: 'Low Poly', description: 'A minimalistic, geometric art style.' },
      { id: 'sculpture', label: 'Sculpture', description: 'Looks like a classical stone sculpture.' },
      { id: 'claymation', label: 'Claymation', description: 'A stop-motion, handcrafted look.' },
    ],
  },
  kn: {
    title: 'ನಿಮ್ಮ 3D ಮಾದರಿಯನ್ನು ರಚಿಸಿ',
    cardDescription: 'ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ರಚನೆಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಿ.',
    uploadLabel: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಎಳೆಯಿರಿ',
    orSeparator: 'ಅಥವಾ',
    useCamera: 'ಕ್ಯಾಮೆರಾ ಬಳಸಿ',
    customPromptLabel: 'ಕಸ್ಟಮ್ ಪ್ರಾಂಪ್ಟ್ (ಐಚ್ಛಿಕ)',
    customPromptPlaceholder: "ಉದಾ, 'ವಸ್ತುವಿನ ಭವಿಷ್ಯದ ಆವೃತ್ತಿ', 'ಅದನ್ನು ಮರದಿಂದ ಮಾಡಿದಂತೆ ಕಾಣುವಂತೆ ಮಾಡಿ'",
    languageLabel: 'ಭಾಷೆ:',
    stylePresetLabel: 'ಶೈಲಿ ಪೂರ್ವನಿಗದಿ',
    stylePresetPlaceholder: 'ಶೈಲಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    generateModel: 'ಮಾದರಿ ರಚಿಸಿ',
    generating: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
    cameraTitle: 'ಕ್ಯಾಮೆರಾದಿಂದ ಸೆರೆಹಿಡಿಯಿರಿ',
    cameraAccessDenied: 'ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶವನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ',
    cameraAccessDescription: 'ಈ ವೈಶಿಷ್ಟ್ಯವನ್ನು ಬಳಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಕ್ಯಾಮರಾ ಅನುಮತಿಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.',
    permissionRequired: 'ಅನುಮತಿ ಅಗತ್ಯವಿದೆ',
    permissionDescription: 'ಫೋಟೋ ಸೆರೆಹಿಡಿಯಲು ಕ್ಯಾಮರಾ ಪ್ರವೇಶದ ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ನವೀಕರಿಸಿ.',
    cancel: 'ರದ್ದುಮಾಡಿ',
    capturePhoto: 'ಫೋಟೋ ಸೆರೆಹಿಡಿಯಿರಿ',
    footerLine1: 'SPR AI ಎಜ್ಯುಟೆಕ್‌ನಿಂದ ರಚಿಸಲಾಗಿದೆ',
    footerLine2: 'ಕರ್ನಾಟಕ ಬ್ಯಾಂಕ್ ಹಿಂದೆ, ಹೊಸದುರ್ಗ, ಚಿತ್ರದುರ್ಗ ಜಿಲ್ಲೆ. Ph: 7022070287',
    errorTitle: "ರಚನೆಯ ದೋಷ",
    stylePresets: [
        { id: 'realistic', label: 'ವಾಸ್ತವಿಕ', description: 'ಫೋಟೋರಿಯಲಿಸ್ಟಿಕ್ ನಿರೂಪಣೆಯನ್ನು ಗುರಿಯಾಗಿರಿಸಿಕೊಂಡಿದೆ.' },
        { id: 'cartoonish', label: 'ಕಾರ್ಟೂನಿಶ್', description: 'ಶೈಲೀಕೃತ, ಉತ್ಪ್ರೇಕ್ಷಿತ ವೈಶಿಷ್ಟ್ಯಗಳೊಂದಿಗೆ.' },
        { id: 'low-poly', label: 'ಕಡಿಮೆ ಪಾಲಿ', description: 'ಕನಿಷ್ಠ, ಜ್ಯಾಮಿತೀಯ ಕಲಾ ಶೈಲಿ.' },
        { id: 'sculpture', label: 'ಶಿಲ್ಪ', description: 'ಶಾಸ್ತ್ರೀಯ ಕಲ್ಲಿನ ಶಿಲ್ಪದಂತೆ ಕಾಣುತ್ತದೆ.' },
        { id: 'claymation', label: 'ಕ್ಲೇಮೇಷನ್', description: 'ನಿಲ್ಲಿಸಿದ-ಚಲನೆಯ, ಕೈಯಿಂದ ಮಾಡಿದ ನೋಟ.' },
    ],
  },
};


const initialModelState: { meshDataUri: string | null; previewImageUri: string | null; videoDataUri: string | null; error: string | null; } = { meshDataUri: null, previewImageUri: null, videoDataUri: null, error: null };
const initialAnimationState: { meshDataUri: string | null; previewImageUri: string | null; videoDataUri: string | null; error: string | null; } = { meshDataUri: null, previewImageUri: null, videoDataUri: null, error: null };

export default function MainView({ language, setLanguage }: { language: Language, setLanguage: (lang: Language) => void }) {
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

  const currentTranslations = translations[language];

  useEffect(() => {
    const error = modelState.error || animationState.error;
    if (error) {
      toast({
        variant: "destructive",
        title: currentTranslations.errorTitle,
        description: error,
      });
    }
  }, [modelState.error, animationState.error, toast, currentTranslations.errorTitle]);

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

  const headline = currentTranslations.title;
  const footerLine1 = currentTranslations.footerLine1;
  const footerLine2 = currentTranslations.footerLine2;

  return (
    <div className="space-y-6">
      <h2 className="animated-title text-3xl font-bold tracking-tight text-center text-foreground/90 font-headline">
        {headline.split('').map((letter, index) => (
            <span
            key={index}
            className="animated-letter"
            style={{ animationDelay: `${index * 0.05}s` }}
            >
            {letter === ' ' ? '\u00A0' : letter}
            </span>
        ))}
      </h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <form action={modelAction}>
              <ControlPanel
                  presets={currentTranslations.stylePresets} 
                  isModelPending={isModelPending}
                  imagePreview={imagePreview}
                  setImagePreview={setImagePreview}
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  language={language}
                  setLanguage={setLanguage}
                  translations={currentTranslations}
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
                      language={language}
                  />
              </div>
              <footer className="w-full py-4 text-center text-sm text-foreground/50">
                <div className="animated-title flex items-center justify-center">
                    {footerLine1.split('').map((letter, index) => (
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
                    ...footerLine2.split(''),
                  ].map((char, index) => (
                    <span
                      key={index}
                      className="animated-letter"
                      style={{ animationDelay: `${(index + 1) * 0.05}s` }}
                    >
                      {typeof char === 'string' && char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </div>
              </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
