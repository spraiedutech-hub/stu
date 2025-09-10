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
  prompt: z.string().optional(),
  style: z.string().min(1, 'A style must be selected.'),
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
    prompt: formData.get('prompt'),
    style: formData.get('style'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const errorMessage = fieldErrors.image?.[0] || fieldErrors.prompt?.[0] || fieldErrors.style?.[0] || 'Invalid input provided.';
    return {
      meshDataUri: null,
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
