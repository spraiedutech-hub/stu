'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating object-oriented animations from an image.
 *
 * - generateObjectOrientedAnimations - A function that generates object-oriented animations.
 * - GenerateObjectOrientedAnimationsInput - The input type for the generateObjectOrientedAnimations function.
 * - GenerateObjectOrientedAnimationsOutput - The return type for the generateObjectOrientedAnimations function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

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


const Generate3DMeshFromImageOutputSchema = z.object({
  meshDataUri: z
    .string()
    .describe(
      'The generated 3D mesh data as a data URI, typically in a format like OBJ or GLTF.'
    ),
});

const generateObjectOrientedAnimationsFlow = ai.defineFlow(
  {
    name: 'generateObjectOrientedAnimationsFlow',
    inputSchema: GenerateObjectOrientedAnimationsInputSchema,
    outputSchema: GenerateObjectOrientedAnimationsOutputSchema,
  },
  async ({imageUri, animationType}) => {
    
    const {output} = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-image-preview'),
        prompt: [
          {media: {url: imageUri}},
          {
            text: `From the provided image, generate a basic 3D mesh model suitable as a base for animation. Return the 3D mesh data as a data URI. Make sure to include the appropriate mime type to specify the mesh type, e.g. data:model/obj;base64,... or data:model/gltf+json;base64,...`,
          },
        ],
        output: {
          schema: Generate3DMeshFromImageOutputSchema,
        },
        config: {
          responseModalities: ['TEXT'],
        },
      });

    const meshDataUri = output!.meshDataUri;

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
