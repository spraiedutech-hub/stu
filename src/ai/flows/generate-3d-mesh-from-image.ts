'use server';

/**
 * @fileOverview Generates a basic 3D mesh model and a preview video from an image.
 *
 * - generate3DMeshFromImage - A function that handles the generation of 3D mesh from an image.
 * - Generate3DMeshFromImageInput - The input type for the generate3DMeshFromImage function.
 * - Generate3DMeshFromImageOutput - The return type for the generate3DMeshFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import type {MediaPart} from 'genkit';

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
    .describe('A data URI of a preview video of the generated 3D mesh.'),
});
export type Generate3DMeshFromImageOutput = z.infer<typeof Generate3DMeshFromImageOutputSchema>;

export async function generate3DMeshFromImage(
  input: Generate3DMeshFromImageInput
): Promise<Generate3DMeshFromImageOutput> {
  return generate3DMeshFromImageFlow(input);
}

async function downloadAndEncode(video: MediaPart): Promise<string> {
    const fetch = (await import('node-fetch')).default;
    const videoUrl = `${video.media!.url}&key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(videoUrl);
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'video/mp4';
  
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  }
  

const generate3DMeshFromImageFlow = ai.defineFlow(
  {
    name: 'generate3DMeshFromImageFlow',
    inputSchema: Generate3DMeshFromImageInputSchema,
    outputSchema: Generate3DMeshFromImageOutputSchema,
  },
  async ({photoDataUri, prompt, style}) => {
    let { operation } = await ai.generate({
        model: googleAI.model('veo-2.0-generate-001'),
        prompt: [
          { media: { url: photoDataUri } },
          {
            text: `From the provided image, generate a basic 3D mesh model suitable as a base for animation. 
Use the following prompt to guide the generation: "${prompt}".
Apply the following style: "${style}".
Also generate a very short, static, 1-second video of the model from an interesting angle to serve as a preview.

Return both the 3D mesh data (as a downloadable 'model/obj' part) and the preview video (as a 'video/mp4' part).
Do not return text.`,
          },
        ],
        config: {
          durationSeconds: 1,
          aspectRatio: '16:9',
        },
      });
  
      if (!operation) {
        throw new Error('Expected the model to return an operation.');
      }
  
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.checkOperation(operation);
      }
  
      if (operation.error) {
        throw new Error(`Model generation failed: ${operation.error.message}`);
      }
  
      const meshPart = operation.output?.message?.content.find(p => p.media?.contentType === 'model/obj');
      const videoPart = operation.output?.message?.content.find(p => p.media?.contentType === 'video/mp4');
      
      if (!meshPart || !meshPart.media?.url) {
        throw new Error('Failed to find the generated 3D mesh in the operation result.');
      }

      if (!videoPart) {
        throw new Error('Failed to find the generated preview video in the operation result.');
      }

      const [meshDataUri, videoDataUri] = await Promise.all([
        downloadAndEncode(meshPart),
        downloadAndEncode(videoPart),
      ]);
      
      return {
        meshDataUri,
        previewImageDataUri: videoDataUri
      };
  }
);
