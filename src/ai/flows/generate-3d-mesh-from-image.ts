'use server';

/**
 * @fileOverview Generates a basic 3D mesh model from an image.
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
  prompt: z.string().describe('A custom text prompt to guide the mesh generation.'),
  style: z.string().describe('A style preset for the generation.'),
});
export type Generate3DMeshFromImageInput = z.infer<typeof Generate3DMeshFromImageInputSchema>;

const Generate3DMeshFromImageOutputSchema = z.object({
  meshDataUri: z
    .string()
    .describe(
      'The generated 3D mesh data as a data URI, typically in a format like OBJ or GLTF.'
    ),
    previewImageUri: z
    .string()
    .describe('A data URI of a preview image of the generated 3D model.'),
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
  async ({photoDataUri, prompt, style}) => {
    const llmResponse = await ai.generate({
      prompt: `From the provided image, generate a basic 3D mesh model suitable as a base for animation. 
Also, create a clean, high-quality preview image of the generated model from a good angle.
Use the following prompt to guide the generation: "${prompt}".
Apply the following style: "${style}".

Return only the 3D mesh data (as a downloadable 'model/obj' part) and a single preview image (as a downloadable 'image/png' part).
Do not return text.`,
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      config: { responseModalities: ['TEXT', 'IMAGE', 'DOWNLOADABLE'] },
      input: [
        {
          media: {
            url: photoDataUri,
          },
        },
      ],
    });

    const meshPart = llmResponse.output?.content.find(
      (p) => p.media?.contentType === 'model/obj'
    );
    const imagePart = llmResponse.output?.content.find(
      (p) => p.media?.contentType === 'image/png'
    );

    if (!meshPart?.media?.url || !imagePart?.media?.url) {
      throw new Error('Failed to generate 3D model or preview image.');
    }

    return {
      meshDataUri: meshPart.media.url,
      previewImageUri: imagePart.media.url,
    };
  }
);
