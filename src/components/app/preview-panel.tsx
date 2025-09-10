'use client';

import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Download, Film, LoaderCircle } from 'lucide-react';

interface PreviewPanelProps {
  videoUri: string | null;
}

const PreviewPanel = ({ videoUri }: PreviewPanelProps) => {
  const { pending } = useFormStatus();
  const placeholder = PlaceHolderImages.find(p => p.id === 'preview-placeholder');

  const handleDownload = () => {
    if (!videoUri) return;
    const link = document.createElement('a');
    link.href = videoUri;
    
    try {
      // For 3D models, we'll suggest a .obj extension
      if (videoUri.startsWith('data:model/obj')) {
        link.download = `vismesh-model.obj`;
      } else {
        const mimeType = videoUri.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1] || 'mp4';
        link.download = `vismesh-animation.${extension}`;
      }
    } catch (error) {
      // Fallback for general data URIs
      link.download = 'vismesh-output';
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (pending) {
      return (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-secondary/50 p-8 text-center">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary" />
            <h3 className="text-xl font-semibold tracking-tight">Generation in progress...</h3>
            <p className="text-muted-foreground">This may take a moment. Please wait.</p>
        </div>
      );
    }

    if (videoUri) {
        // Handle both video and 3D model data URIs
      if (videoUri.startsWith('data:video')) {
        return (
          <div className="space-y-4">
            <video
              src={videoUri}
              controls
              autoPlay
              loop
              muted
              className="aspect-video w-full rounded-lg bg-black"
            />
            <Button onClick={handleDownload} className="w-full sm:w-auto" variant="outline">
              <Download className="mr-2" />
              Download Animation
            </Button>
          </div>
        );
      }
      // A simple display for the 3D mesh data as text
      return (
        <div className="space-y-4">
            <div className="aspect-video w-full rounded-lg bg-secondary/50 p-4">
                <h3 className="text-lg font-semibold">Generated 3D Mesh Data</h3>
                <p className="text-sm text-muted-foreground mb-2">A 3D viewer would be needed to display this model. You can download the data below.</p>
                <div className="w-full h-48 overflow-y-auto bg-background p-2 rounded-md border text-xs">
                    <pre><code>{videoUri.substring(0, 500)}...</code></pre>
                </div>
            </div>
          <Button onClick={handleDownload} className="w-full sm:w-auto" variant="outline">
            <Download className="mr-2" />
            Download Model
          </Button>
        </div>
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
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">Your animation will appear here</h3>
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
