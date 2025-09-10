'use server';

/**
 * @fileOverview Generates a basic 3D mesh model from an uploaded image and a text prompt.
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
  previewImageDataUri: z
    .string()
    .describe('A data URI of a preview image of the generated 3D mesh.'),
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
    const {output} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      prompt: [
        {media: {url: photoDataUri}},
        {
          text: `From the provided image, generate a basic 3D mesh model suitable as a base for animation. 
Use the following prompt to guide the generation: "${prompt}".
Apply the following style: "${style}".

After generating the mesh, create a high-quality 2D preview image of the resulting 3D model from an interesting angle.

Return both the 3D mesh data as a data URI and the preview image as a data URI. 
Make sure to include the appropriate mime type for the mesh, e.g. data:model/obj;base64,... or data:model/gltf+json;base64,...
The image should be a standard image mime type, e.g., data:image/png;base64,...`,
        },
      ],
      output: {
        schema: z.object({ 
            meshDataUri: z.string(),
            previewImageDataUri: z.string(),
        }),
      },
      config: {
        responseModalities: ['TEXT'],
      },
    });

    return output! as Generate3DMeshFromImageOutput;
  }
);
