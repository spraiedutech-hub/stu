'use client';

import { useFormStatus } from 'react-dom';
import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Download, Film, LoaderCircle } from 'lucide-react';

interface PreviewPanelProps {
  meshDataUri: string | null;
}

const PreviewPanel = ({ meshDataUri }: PreviewPanelProps) => {
  const { pending } = useFormStatus();
  const placeholder = PlaceHolderImages.find(p => p.id === 'preview-placeholder');

  const handleDownload = () => {
    if (!meshDataUri) return;
    const link = document.createElement('a');
    link.href = meshDataUri;
    
    try {
      if (meshDataUri.startsWith('data:model/obj')) {
        link.download = `spraivismeh-model.obj`;
      } else if (meshDataUri.startsWith('data:model/gltf+json') || meshDataUri.startsWith('data:model/gltf-binary')) {
        link.download = `spraivismeh-model.gltf`;
      } else {
        const mimeType = meshDataUri.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1] || 'dat';
        link.download = `spraivismeh-output.${extension}`;
      }
    } catch (error) {
      link.download = 'spraivismeh-output';
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

    if (meshDataUri) {
        return (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-secondary/50 flex flex-col items-center justify-center p-8 text-center">
                <Film className="h-16 w-16 text-primary" />
                <h3 className="mt-4 text-xl font-semibold tracking-tight">Generation Complete!</h3>
                <p className="mt-2 text-muted-foreground">Your 3D model is ready to be downloaded.</p>
              </div>
              <Button onClick={handleDownload} className="w-full sm:w-auto">
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
