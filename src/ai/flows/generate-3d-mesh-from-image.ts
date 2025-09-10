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
import {googleAI} from '@genkit-ai/googleai';

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

const generate3DMeshFromImageFlow = ai.defineFlow(
  {
    name: 'generate3DMeshFromImageFlow',
    inputSchema: Generate3DMeshFromImageInputSchema,
    outputSchema: Generate3DMeshFromImageOutputSchema,
  },
  async ({photoDataUri}) => {
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      prompt: [
        {media: {url: photoDataUri}},
        {
          text: 'From the provided image, generate a basic 3D mesh model suitable as a base for animation. Return the 3D mesh data as a data URI. Make sure to include the appropriate mime type to specify the mesh type, e.g. data:model/obj;base64,... or data:model/gltf+json;base64,...',
        },
      ],
      output: {
        schema: Generate3DMeshFromImageOutputSchema,
      },
      config: {
        responseModalities: ['TEXT'],
      },
    });

    return output!;
  }
);
