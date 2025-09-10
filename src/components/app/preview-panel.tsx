'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Download, Film, LoaderCircle, Video } from 'lucide-react';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface PreviewPanelProps {
  meshDataUri: string | null;
  videoDataUri: string | null;
  isModelPending: boolean;
  isAnimationPending: boolean;
  animationAction: (formData: FormData) => void;
}

const PreviewPanel = ({ 
    meshDataUri, 
    videoDataUri, 
    isModelPending, 
    isAnimationPending,
    animationAction
}: PreviewPanelProps) => {
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
    if (isModelPending || isAnimationPending) {
      const title = isAnimationPending ? 'Animation in progress...' : 'Generation in progress...';
      const description = isAnimationPending 
        ? 'This can take up to a minute. Please be patient.'
        : 'This may take a moment. Please wait.';

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
                Download Animation
              </Button>
            </div>
          );
    }
    
    if (meshDataUri) {
        return (
            <form action={animationAction} className="space-y-4">
              <input type="hidden" name="meshDataUri" value={meshDataUri} />
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary/50 flex flex-col items-center justify-center p-8 text-center">
                <Film className="h-16 w-16 text-primary" />
                <h3 className="mt-4 text-xl font-semibold tracking-tight">Model Complete!</h3>
                <p className="mt-2 text-muted-foreground">Your 3D model is ready. You can now generate an animation.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animation-prompt">Animation Prompt</Label>
                <Textarea
                  id="animation-prompt"
                  name="animation-prompt"
                  placeholder="e.g., 'a smooth, 360-degree turntable animation', 'a bouncing animation', 'make it slowly crumble'"
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={(e) => { e.preventDefault(); handleDownload(meshDataUri, 'spraivismeh-model.obj'); }} className="w-full sm:w-auto" variant="secondary">
                    <Download className="mr-2" />
                    Download Model
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                    <Video className="mr-2" />
                    Generate Animation
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
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">Your 3D model will appear here</h3>
            <p className="mt-2 text-white/70">Upload an image and choose a preset to get started.</p>
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
