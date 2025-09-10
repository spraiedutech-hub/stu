'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating object-oriented animations from an image and 3D mesh.
 *
 * - generateObjectOrientedAnimations - A function that generates object-oriented animations.
 * - GenerateObjectOrientedAnimationsInput - The input type for the generateObjectOrientedAnimations function.
 * - GenerateObjectOrientedAnimationsOutput - The return type for the generateObjectOrientedAnimations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateObjectOrientedAnimationsInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "A photo of an object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  meshData: z.string().describe('The 3D mesh data of the object in the image.'),
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

const generateObjectOrientedAnimationsPrompt = ai.definePrompt({
  name: 'generateObjectOrientedAnimationsPrompt',
  input: {schema: GenerateObjectOrientedAnimationsInputSchema},
  output: {schema: GenerateObjectOrientedAnimationsOutputSchema},
  prompt: `You are an AI that generates object-oriented animations from an image and its 3D mesh.

You are provided with the following information:
- Image: {{media url=imageUri}}
- 3D Mesh: {{{meshData}}}
- Animation Type: {{{animationType}}}

Based on this information, generate an animation of the object in the image using the provided 3D mesh and animation type.
Return the animation as a video data URI, as well as a short description of the animation.
`,
});

const generateObjectOrientedAnimationsFlow = ai.defineFlow(
  {
    name: 'generateObjectOrientedAnimationsFlow',
    inputSchema: GenerateObjectOrientedAnimationsInputSchema,
    outputSchema: GenerateObjectOrientedAnimationsOutputSchema,
  },
  async input => {
    const {output} = await generateObjectOrientedAnimationsPrompt(input);
    return output!;
  }
);
