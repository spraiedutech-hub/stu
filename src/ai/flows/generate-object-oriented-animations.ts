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
import * as fs from 'fs';
import {Readable} from 'stream';

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
    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: [
        {
          text: `Generate a video of the object in the image with a ${animationType} animation.`,
        },
        {
          media: {
            url: imageUri,
          },
        },
      ],
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video || !video.media) {
      throw new Error('Failed to find the generated video');
    }

    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
      `${video.media.url}&key=${process.env.GEMINI_API_KEY}`
    );
    if (
      !videoDownloadResponse ||
      videoDownloadResponse.status !== 200 ||
      !videoDownloadResponse.body
    ) {
      throw new Error('Failed to fetch video');
    }

    const videoBuffer = await videoDownloadResponse.arrayBuffer();

    return {
      animationVideoUri: `data:video/mp4;base64,${Buffer.from(
        videoBuffer
      ).toString('base64')}`,
      description: `A video of the object with a ${animationType} animation.`,
    };
  }
);
