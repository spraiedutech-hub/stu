'use server';
/**
 * @fileOverview Generates a video animation from a 3D mesh data URI.
 *
 * - generateAnimationFromMesh - A function that handles the video generation.
 * - GenerateAnimationFromMeshInput - The input type for the function.
 * - GenerateAnimationFromMeshOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { MediaPart } from 'genkit';

const GenerateAnimationFromMeshInputSchema = z.object({
  meshDataUri: z
    .string()
    .describe(
      'The 3D mesh data as a data URI, typically in a format like OBJ or GLTF.'
    ),
  prompt: z.string().describe('A text prompt to guide the animation.'),
});
export type GenerateAnimationFromMeshInput = z.infer<
  typeof GenerateAnimationFromMeshInputSchema
>;

const GenerateAnimationFromMeshOutputSchema = z.object({
  videoDataUri: z
    .string()
    .describe('The generated video animation as a data URI.'),
});
export type GenerateAnimationFromMeshOutput = z.infer<
  typeof GenerateAnimationFromMeshOutputSchema
>;

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

const generateAnimationFromMeshFlow = ai.defineFlow(
  {
    name: 'generateAnimationFromMeshFlow',
    inputSchema: GenerateAnimationFromMeshInputSchema,
    outputSchema: GenerateAnimationFromMeshOutputSchema,
  },
  async ({ meshDataUri, prompt }) => {
    let { operation } = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: [
        { text: prompt },
        { media: { url: meshDataUri, contentType: 'model/obj' } },
      ],
      config: {
        durationSeconds: 5,
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
      throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video) {
      throw new Error('Failed to find the generated video in the operation result.');
    }

    const videoDataUri = await downloadAndEncode(video);

    return { videoDataUri };
  }
);

export async function generateAnimationFromMesh(
  input: GenerateAnimationFromMeshInput
): Promise<GenerateAnimationFromMeshOutput> {
  return generateAnimationFromMeshFlow(input);
}
