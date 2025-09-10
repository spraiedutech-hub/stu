'use server';

/**
 * @fileOverview Generates a basic 3D mesh model from an uploaded image.
 *
 * - generate3DMeshFromImage - A function that handles the generation of 3D mesh from an image.
 * - Generate3DMeshFromImageInput - The input type for the generate3DMeshFromImage function.
 * - Generate3DMeshFromImageOutput - The return type for the generate3DMeshFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const Generate3DMeshFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate a 3D mesh from, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type Generate3DMeshFromImageInput = z.infer<typeof Generate3DMeshFromImageInputSchema>;

const Generate3DMeshFromImageOutputSchema = z.object({
  meshDataUri: z
    .string()
    .describe(
      'The generated 3D mesh data as a data URI, typically in a format like OBJ or GLTF.'
    ),
});
export type Generate3DMeshFromImageOutput = z.infer<typeof Generate3DMeshFromImageOutputSchema>;

export async function generate3DMeshFromImage(
  input: Generate3DMeshFromImageInput
): Promise<Generate3DMeshFromImageOutput> {
  return generate3DMeshFromImageFlow(input);
}

const generate3DMeshFromImagePrompt = ai.definePrompt({
  name: 'generate3DMeshFromImagePrompt',
  input: {schema: Generate3DMeshFromImageInputSchema},
  output: {schema: Generate3DMeshFromImageOutputSchema},
  prompt: `You are a 3D model generation expert. Your task is to generate a basic 3D mesh model from the provided image. The mesh should be suitable as a base for animation.

  Image: {{media url=photoDataUri}}

  Return the 3D mesh data as a data URI.
  Make sure to include the appropriate mime type to specify the mesh type, e.g. data:model/obj;base64,... or data:model/gltf+json;base64,...
  `,
});

const generate3DMeshFromImageFlow = ai.defineFlow(
  {
    name: 'generate3DMeshFromImageFlow',
    inputSchema: Generate3DMeshFromImageInputSchema,
    outputSchema: Generate3DMeshFromImageOutputSchema,
  },
  async input => {
    const {output} = await generate3DMeshFromImagePrompt(input);
    return output!;
  }
);
