'use server';
/**
 * @fileOverview A flow to extract an ISBN from an image.
 *
 * - extractIsbnFromImage - A function that extracts an ISBN from an image.
 * - ExtractIsbnFromImageInput - The input type for the extractIsbnFromImage function.
 * - ExtractIsbnFromImageOutput - The return type for the extractIsbnFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractIsbnFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a book's cover or copyright page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractIsbnFromImageInput = z.infer<typeof ExtractIsbnFromImageInputSchema>;

const ExtractIsbnFromImageOutputSchema = z.object({
  isbn: z
    .string()
    .optional()
    .describe(
      'The extracted 10 or 13-digit ISBN. Should be numbers only. Can be null if no ISBN is found.'
    ),
});
export type ExtractIsbnFromImageOutput = z.infer<typeof ExtractIsbnFromImageOutputSchema>;


const prompt = ai.definePrompt({
  name: 'extractIsbnPrompt',
  input: {schema: ExtractIsbnFromImageInputSchema},
  output: {schema: ExtractIsbnFromImageOutputSchema},
  prompt: `You are an expert at extracting information from images. Your task is to find an ISBN in the provided image.
Look for the text "ISBN" and extract the 10 or 13-digit number that follows it. The ISBN may contain hyphens, but you should return only the digits.
If you find an ISBN, return it in the 'isbn' field. If you cannot find an ISBN, return null for the 'isbn' field.

Image: {{media url=imageDataUri}}`,
});

const extractIsbnFlow = ai.defineFlow(
  {
    name: 'extractIsbnFlow',
    inputSchema: ExtractIsbnFromImageInputSchema,
    outputSchema: ExtractIsbnFromImageOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function extractIsbnFromImage(
  input: ExtractIsbnFromImageInput
): Promise<ExtractIsbnFromImageOutput> {
  const result = await extractIsbnFlow(input);
  if (result.isbn) {
    result.isbn = result.isbn.replace(/[-\s]/g, '');
  }
  return result;
}