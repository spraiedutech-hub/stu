'use server';

import { generate3DMeshFromImage } from '@/ai/flows/generate-3d-mesh-from-image';
import { z } from 'zod';

const FormSchema = z.object({
  image: z
    .instanceof(File, { message: 'An image is required.' })
    .refine((file) => file.size > 0, 'An image is required.')
    .refine(
      (file) => file.type.startsWith('image/'),
      'Only image files are allowed.'
    ),
  animationType: z.string().min(1, 'An animation type must be selected.'),
});

interface FormState {
  meshDataUri: string | null;
  error: string | null;
}

async function fileToDataUri(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function generateAnimationAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = FormSchema.safeParse({
    image: formData.get('image'),
    animationType: formData.get('animationType'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const errorMessage = fieldErrors.image?.[0] || fieldErrors.animationType?.[0] || 'Invalid input provided.';
    return {
      meshDataUri: null,
      error: errorMessage,
    };
  }

  const { image, animationType } = validatedFields.data;

  try {
    const imageUri = await fileToDataUri(image);
    
    const result = await generate3DMeshFromImage({
      photoDataUri: imageUri,
      animationType, // Pass for compatibility, though not used in the new flow
    });

    if (!result.meshDataUri) {
      throw new Error('The 3D mesh could not be generated.');
    }

    return {
      meshDataUri: result.meshDataUri,
      error: null,
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during generation.';
    console.error(e);
    return {
      meshDataUri: null,
      error: `Generation failed: ${errorMessage}`,
    };
  }
}
