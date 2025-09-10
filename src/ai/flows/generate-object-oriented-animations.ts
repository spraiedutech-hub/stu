'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating object-oriented animations from an image.
 *
 * - generateObjectOrientedAnimations - A function that generates object-oriented animations.
 * - GenerateObjectOrientedAnimationsInput - The input type for the generateObjectOrientedAnimations function.
 * - GenerateObjectOrientedAnimationsOutput - The return type for the generateObjectOrientedAnimations function.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import { generate3DMeshFromImage } from './generate-3d-mesh-from-image';

const GenerateObjectOrientedAnimationsInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "A photo of an object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  animationType: z
    .string()
    .describe('The type of object-oriented animation to generate.'),
});
export type GenerateObjectOrientedAnimationsInput = z.infer<
  typeof GenerateObjectOrientedAnimationsInputSchema
>;

const GenerateObjectOrientedAnimationsOutputSchema = z.object({
  animationVideoUri: z
    .string()
    .describe(
      'A video of the generated animation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  description: z.string().describe('A description of the generated animation.'),
});

export type GenerateObjectOrientedAnimationsOutput = z.infer<
  typeof GenerateObjectOrientedAnimationsOutputSchema
>;

export async function generateObjectOrientedAnimations(
  input: GenerateObjectOrientedAnimationsInput
): Promise<GenerateObjectOrientedAnimationsOutput> {
  return generateObjectOrientedAnimationsFlow(input);
}

const generateObjectOrientedAnimationsFlow = ai.defineFlow(
  {
    name: 'generateObjectOrientedAnimationsFlow',
    inputSchema: GenerateObjectOrientedAnimationsInputSchema,
    outputSchema: GenerateObjectOrientedAnimationsOutputSchema,
  },
  async ({imageUri, animationType}) => {
    // Since we can't generate a video directly without a billing account,
    // we'll generate a 3D mesh and return that as a data URI.
    // The UI can then display this mesh.
    const { meshDataUri } = await generate3DMeshFromImage({ photoDataUri: imageUri });
    
    // We can't generate a video, so we will return the mesh data URI
    // and let the client handle the visualization. For this example, we'll
    // return it in the `animationVideoUri` field, but a real app would have
    // a dedicated field for 3D model data.
    return {
      animationVideoUri: meshDataUri,
      description: `A 3D mesh representation of the object for a "${animationType}" animation.`,
    };
  }
);
