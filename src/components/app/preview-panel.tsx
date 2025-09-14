'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Download, Film, LoaderCircle, Video, Sparkles } from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import type { Language } from '@/app/page';

interface PreviewPanelProps {
  meshDataUri: string | null;
  previewImageUri: string | null;
  videoDataUri: string | null;
  isModelPending: boolean;
  isAnimationPending: boolean;
  animationAction: (formData: FormData) => void;
  inputImagePreview: string | null;
  language: Language;
}

const translations = {
    en: {
        generatingLife: 'SPR AI Bringing life...',
        generatingTitle: 'Generation in progress...',
        animatingTitle: 'Animation in progress...',
        generatingDescription: 'This can take up to a minute. Please be patient.',
        downloadAnimation: 'Download Animation',
        animationStyleLabel: 'Animation Style',
        animationStylePlaceholder: 'Select an animation style',
        customPromptLabel: 'Custom Animation Prompt',
        customPromptPlaceholder: "e.g., 'a slow-motion zoom-in', 'make it dance the salsa'",
        downloadModel: 'Download Model',
        generateAnimation: 'Generate Animation',
        generatingButton: 'Generating...',
        placeholderTitle: 'Your 3D model will appear here',
        placeholderDescription: 'Upload an image and choose a preset to get started.',
        animationPresets: [
            { id: 'turntable', label: 'Turntable', description: 'A smooth, 360-degree rotation.' },
            { id: 'bounce', label: 'Bounce', description: 'A playful, bouncing animation.' },
            { id: 'crumble', label: 'Crumble', description: 'The model slowly crumbles to dust.' },
            { id: 'dismantle', label: 'Dismantle', description: 'The model disassembles and reassembles.' },
            { id: 'custom', label: 'Custom', description: 'Write your own animation prompt.' },
        ],
    },
    kn: {
        generatingLife: 'SPR AI ಜೀವ ತರುತ್ತಿದೆ...',
        generatingTitle: 'ರಚನೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ...',
        animatingTitle: 'ಅನಿಮೇಷನ್ ಪ್ರಗತಿಯಲ್ಲಿದೆ...',
        generatingDescription: 'ಇದು ಒಂದು ನಿಮಿಷದವರೆಗೆ ತೆಗೆದುಕೊಳ್ಳಬಹುದು. ದಯವಿಟ್ಟು ತಾಳ್ಮೆಯಿಂದಿರಿ.',
        downloadAnimation: 'ಅನಿಮೇಷನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        animationStyleLabel: 'ಅನಿಮೇಷನ್ ಶೈಲಿ',
        animationStylePlaceholder: 'ಅನಿಮೇಷನ್ ಶೈಲಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        customPromptLabel: 'ಕಸ್ಟಮ್ ಅನಿಮೇಷನ್ ಪ್ರಾಂಪ್ಟ್',
        customPromptPlaceholder: "ಉದಾ, 'ನಿಧಾನ-ಚಲನೆಯ ಜೂಮ್-ಇನ್', 'ಅದನ್ನು ಸಾಲ್ಸಾ ನೃತ್ಯ ಮಾಡುವಂತೆ ಮಾಡಿ'",
        downloadModel: 'ಮಾದರಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
        generateAnimation: 'ಅನಿಮೇಷನ್ ರಚಿಸಿ',
        generatingButton: 'ರಚಿಸಲಾಗುತ್ತಿದೆ...',
        placeholderTitle: 'ನಿಮ್ಮ 3D ಮಾದರಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ',
        placeholderDescription: 'ಪ್ರಾರಂಭಿಸಲು ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಪೂರ್ವನಿಗದಿಯನ್ನು ಆರಿಸಿ.',
        animationPresets: [
            { id: 'turntable', label: 'ಟರ್ನ್ಟೇಬಲ್', description: 'ನಯವಾದ, 360-ಡಿಗ್ರಿ ತಿರುಗುವಿಕೆ.' },
            { id: 'bounce', label: ' ಪುಟಿಯುವುದು', description: 'ಒಂದು ತಮಾಷೆಯ, ಪುಟಿಯುವ ಅನಿಮೇಷನ್.' },
            { id: 'crumble', label: 'ಕುಸಿಯುವುದು', description: 'ಮಾದರಿ ನಿಧಾನವಾಗಿ ಧೂಳಿನಲ್ಲಿ ಕುಸಿಯುತ್ತದೆ.' },
            { id: 'dismantle', label: 'ಡಿಸ್ಮ್ಯಾಂಟಲ್', description: 'ಮಾದರಿಯು ಡಿಸ್ಅಸೆಂಬಲ್ ಆಗುತ್ತದೆ ಮತ್ತು ಮತ್ತೆ ಜೋಡಿಸುತ್ತದೆ.' },
            { id: 'custom', label: 'ಕಸ್ಟಮ್', description: 'ನಿಮ್ಮ ಸ್ವಂತ ಅನಿಮೇಷನ್ ಪ್ರಾಂಪ್ಟ್ ಬರೆಯಿರಿ.' },
        ],
    },
};


const ReactiveImage = ({ src, alt }: { src: string; alt: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;

        const rotateY = x * 20; // Max rotation 10 degrees
        const rotateX = -y * 20; // Max rotation 10 degrees
        
        containerRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
        if (!containerRef.current) return;
        containerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    return (
        <div 
            ref={containerRef}
            className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary/20 border-2 border-dashed transition-transform duration-200 ease-out"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
            />
        </div>
    );
};

const PreviewPanel = ({ 
    meshDataUri, 
    previewImageUri,
    videoDataUri, 
    isModelPending, 
    isAnimationPending,
    animationAction,
    inputImagePreview,
    language,
}: PreviewPanelProps) => {
  const currentTranslations = translations[language];
  const [animationStyle, setAnimationStyle] = useState(currentTranslations.animationPresets[0].id);
  const placeholder = PlaceHolderImages.find(p => p.id === 'preview-placeholder');

  const handleDownload = (dataUri: string | null, defaultName: string) => {
    if (!dataUri) return;
    const link = document.createElement('a');
    link.href = dataUri;
    
    try {
      if (dataUri.startsWith('data:model/obj')) {
        link.download = `spraivismeh-model.obj`;
      } else if (dataUri.startsWith('data:model/gltf+json') || dataUri.startsWith('data-uri:model/gltf-binary')) {
        link.download = `spraivismeh-model.gltf`;
      } else if (dataUri.startsWith('data:video/')) {
        const extension = dataUri.split(';')[0].split('/')[1] || 'mp4';
        link.download = `spraivismeh-animation.${extension}`;
      } else {
        const mimeType = dataUri.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1] || 'dat';
        link.download = `spraivismeh-output.${extension}`;
      }
    } catch (error) {
      link.download = defaultName;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (isModelPending && inputImagePreview) {
        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed bg-secondary/50">
                <Image
                    src={inputImagePreview}
                    alt="Image being processed"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 p-8 text-center">
                    <div className="relative">
                        <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold tracking-tight text-white animated-title">
                        {currentTranslations.generatingLife.split('').map((letter, index) => (
                            <span
                                key={index}
                                className="animated-letter"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {letter === ' ' ? '\u00A0' : letter}
                            </span>
                        ))}
                    </h3>
                </div>
            </div>
        );
    }
    
    if (isModelPending || isAnimationPending) {
      const title = isAnimationPending ? currentTranslations.animatingTitle : currentTranslations.generatingTitle;
      const description = currentTranslations.generatingDescription;

      return (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-secondary/50 p-8 text-center">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
      );
    }
    
    if (videoDataUri) {
        return (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <video src={videoDataUri} className="w-full h-full" controls autoPlay loop />
              </div>
              <Button onClick={() => handleDownload(videoDataUri, 'spraivismeh-animation.mp4')} className="w-full sm:w-auto">
                <Download className="mr-2" />
                {currentTranslations.downloadAnimation}
              </Button>
            </div>
          );
    }
    
    if (meshDataUri && previewImageUri) {
        return (
            <form action={animationAction} className="space-y-4">
              <input type="hidden" name="meshDataUri" value={meshDataUri} />
              <input type="hidden" name="previewImageUri" value={previewImageUri} />
               <ReactiveImage
                    src={previewImageUri}
                    alt="Preview of generated 3D model"
                />

              <div className="space-y-2">
                <Label htmlFor="animation-style">{currentTranslations.animationStyleLabel}</Label>
                <Select name="animationStyle" value={animationStyle} onValueChange={setAnimationStyle}>
                    <SelectTrigger id="animation-style">
                        <SelectValue placeholder={currentTranslations.animationStylePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {currentTranslations.animationPresets.map((preset) => (
                            <SelectItem key={preset.id} value={preset.id}>
                                <div className="flex flex-col">
                                    <span>{preset.label}</span>
                                    <span className="text-xs text-muted-foreground">{preset.description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

              {animationStyle === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="animation-prompt">{currentTranslations.customPromptLabel}</Label>
                  <Textarea
                    id="animation-prompt"
                    name="animation-prompt"
                    placeholder={currentTranslations.customPromptPlaceholder}
                    className="min-h-[80px]"
                  />
                </div>
              )}


              <div className="flex flex-wrap gap-2">
                <Button onClick={(e) => { e.preventDefault(); handleDownload(meshDataUri, 'spraivismeh-model.obj'); }} className="w-full sm:w-auto" variant="secondary">
                    <Download className="mr-2" />
                    {currentTranslations.downloadModel}
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                    {isAnimationPending ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            {currentTranslations.generatingButton}
                        </>
                    ) : (
                        <>
                            <Video className="mr-2" />
                            {currentTranslations.generateAnimation}
                        </>
                    )}
                </Button>
              </div>
            </form>
          );
    }
    
    if (placeholder) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={placeholder.imageUrl}
            alt={placeholder.description}
            fill
            className="object-cover"
            data-ai-hint={placeholder.imageHint}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-8 text-center">
            <Film className="h-16 w-16 text-white/80" />
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">{currentTranslations.placeholderTitle}</h3>
            <p className="mt-2 text-white/70">{currentTranslations.placeholderDescription}</p>
          </div>
        </div>
      );
    }

    return <Skeleton className="aspect-video w-full rounded-lg" />;
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default PreviewPanel;
