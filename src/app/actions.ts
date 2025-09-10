'use server';

import { generate3DMeshFromImage } from '@/ai/flows/generate-3d-mesh-from-image';
import { generateObjectOrientedAnimations } from '@/ai/flows/generate-object-oriented-animations';
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
  videoUri: string | null;
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
      videoUri: null,
      error: errorMessage,
    };
  }

  const { image, animationType } = validatedFields.data;

  try {
    const imageUri = await fileToDataUri(image);
    
    const animationResult = await generateObjectOrientedAnimations({
      imageUri,
      animationType,
    });

    if (!animationResult.animationVideoUri) {
      throw new Error('The animation could not be generated.');
    }

    return {
      videoUri: animationResult.animationVideoUri,
      error: null,
    };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during generation.';
    console.error(errorMessage);
    return {
      videoUri: null,
      error: `Generation failed: ${errorMessage}`,
    };
  }
}
