'use server';

import { generate3DMeshFromImage } from '@/ai/flows/generate-3d-mesh-from-image';
import { generateAnimationFromMesh } from '@/ai/flows/generate-animation-from-mesh';
import { z } from 'zod';

const GenerateModelSchema = z.object({
  image: z
    .instanceof(File, { message: 'An image is required.' })
    .refine((file) => file.size > 0, 'An image is required.')
    .refine(
      (file) => file.type.startsWith('image/'),
      'Only image files are allowed.'
    ),
  prompt: z.string().optional(),
  style: z.string().min(1, 'A style must be selected.'),
});

const AnimateModelSchema = z.object({
    meshDataUri: z.string().min(1, 'A 3D model is required to generate an animation.'),
    previewImageUri: z.string().min(1, 'A preview image is required.'),
    prompt: z.string().optional(),
});

interface GenerateModelState {
  meshDataUri: string | null;
  previewImageUri: string | null;
  videoDataUri: string | null;
  error: string | null;
}

interface AnimateModelState {
    meshDataUri: string | null;
    previewImageUri: string | null;
    videoDataUri: string | null;
    error: string | null;
}

async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function generateModelAction(
  prevState: GenerateModelState,
  formData: FormData
): Promise<GenerateModelState> {
  const validatedFields = GenerateModelSchema.safeParse({
    image: formData.get('image'),
    prompt: formData.get('prompt'),
    style: formData.get('style'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const errorMessage = fieldErrors.image?.[0] || fieldErrors.prompt?.[0] || fieldErrors.style?.[0] || 'Invalid input provided.';
    return {
      meshDataUri: null,
      previewImageUri: null,
      videoDataUri: null,
      error: errorMessage,
    };
  }

  const { image, prompt, style } = validatedFields.data;

  try {
    const imageUri = await fileToDataUri(image);
    
    const result = await generate3DMeshFromImage({
      photoDataUri: imageUri,
      prompt: prompt || 'A standard 3D model of the object in the image.',
      style,
    });

    if (!result.meshDataUri || !result.previewImageUri) {
      throw new Error('The 3D model and preview could not be generated.');
    }

    return {
      meshDataUri: result.meshDataUri,
      previewImageUri: result.previewImageUri,
      videoDataUri: null,
      error: null,
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during generation.';
    console.error(e);
    return {
      meshDataUri: null,
      previewImageUri: null,
      videoDataUri: null,
      error: `Generation failed: ${errorMessage}`,
    };
  }
}

export async function createAnimationAction(
    prevState: AnimateModelState,
    formData: FormData
): Promise<AnimateModelState> {
    const validatedFields = AnimateModelSchema.safeParse({
        meshDataUri: formData.get('meshDataUri'),
        previewImageUri: formData.get('previewImageUri'),
        prompt: formData.get('animation-prompt'),
    });

    if (!validatedFields.success) {
        return {
            ...prevState,
            error: 'A 3D model is required to generate an animation.',
        };
    }
    
    const { meshDataUri, previewImageUri, prompt } = validatedFields.data;

    try {
        const result = await generateAnimationFromMesh({
            meshDataUri: meshDataUri,
            prompt: prompt || 'Create a smooth, 360-degree turntable animation of the provided 3D model.',
        });

        if (!result.videoDataUri) {
            throw new Error('The animation could not be generated.');
        }

        return {
            ...prevState,
            meshDataUri,
            previewImageUri,
            videoDataUri: result.videoDataUri,
            error: null,
        };
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during animation generation.';
        console.error(e);
        return {
            ...prevState,
            videoDataUri: null,
            error: `Animation failed: ${errorMessage}`,
        };
    }
}
