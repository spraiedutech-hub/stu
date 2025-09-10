'use client';

import { Suspense, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Download, Film, LoaderCircle, ZoomIn } from 'lucide-react';

interface PreviewPanelProps {
  meshDataUri: string | null;
}

const Model = ({ dataUri }: { dataUri: string }) => {
  const isGltf = dataUri.startsWith('data:model/gltf+json') || dataUri.startsWith('data:model/gltf-binary');
  const Loader = isGltf ? GLTFLoader : OBJLoader;
  
  const model = useLoader(Loader as any, dataUri) as (THREE.Group | { scene: THREE.Group });

  const scene = 'scene' in model ? model.scene : model;

  // Center and scale the model
  useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center); // center the model
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim;
    scene.scale.set(scale, scale, scale);
  }, [scene]);

  return <primitive object={scene} />;
};


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
            <div className="relative aspect-video w-full rounded-lg bg-secondary/50">
              <Canvas camera={{ fov: 75, position: [0, 0, 8] }}>
                <Suspense fallback={
                    <group>
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    </group>
                }>
                  <Stage environment="studio" intensity={0.5}>
                    <Model dataUri={meshDataUri} />
                  </Stage>
                  <OrbitControls enableZoom={true} />
                </Suspense>
              </Canvas>
              <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-full bg-background/70 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
                <ZoomIn className="h-4 w-4" />
                <span>Use mouse to orbit, pan, and zoom</span>
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
