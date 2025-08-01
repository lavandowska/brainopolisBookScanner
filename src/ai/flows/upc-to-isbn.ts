'use server';

/**
 * @fileOverview A flow to convert UPC to ISBN.
 *
 * - upcToIsbn - A function that converts a UPC code to an ISBN.
 * - UpcToIsbnInput - The input type for the upcToIsbn function.
 * - UpcToIsbnOutput - The return type for the upcToIsbn function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpcToIsbnInputSchema = z.object({
  upc: z
    .string()
    .describe('The UPC code to be converted to ISBN.'),
});
export type UpcToIsbnInput = z.infer<typeof UpcToIsbnInputSchema>;

const UpcToIsbnOutputSchema = z.object({
  isbn: z
    .string()
    .optional()
    .describe('The converted ISBN-13. Can be null if conversion fails.'),
});
export type UpcToIsbnOutput = z.infer<typeof UpcToIsbnOutputSchema>;

export async function convertUpcToIsbn(upc: string): Promise<{ isbn?: string, error?: string }> {
    try {
        const result = await upcToIsbn({ upc });
        if (result.isbn) {
            return { isbn: result.isbn };
        }
        return { error: "Could not convert UPC to a valid ISBN or book not found." };
    } catch (e) {
        console.error(e);
        return { error: "Failed to convert UPC to ISBN. e=" + e.toString() };
    }
}

export async function upcToIsbn(
  input: UpcToIsbnInput
): Promise<UpcToIsbnOutput> {
  return upcToIsbnFlow(input);
}

const prompt = ai.definePrompt({
  name: 'upcToIsbnPrompt',
  input: {schema: UpcToIsbnInputSchema},
  output: {schema: UpcToIsbnOutputSchema},
  prompt: `You are an expert librarian. Your task is to convert a UPC code to an ISBN-13.
The vast majority of books use a UPC barcode that starts with 978. If the provided UPC is for a book, it will be a 12-digit number.
To convert it to an ISBN-13, you must prepend '978' to the first 9 digits of the UPC, and then calculate a new check digit.
If the UPC is not a 12-digit number or does not appear to be a book UPC, you should return null for the ISBN.

Here is an example:
UPC: 0596000486
First 9 digits with 978 prefix: 978059600048
Then calculate check digit.

Return only the ISBN or null in the isbn field of the JSON output.

UPC: {{{upc}}}`,
});

const upcToIsbnFlow = ai.defineFlow(
  {
    name: 'upcToIsbnFlow',
    inputSchema: UpcToIsbnInputSchema,
    outputSchema: UpcToIsbnOutputSchema,
  },
  async (input) => {
    console.log(input.upc);
    // A simple heuristic for UPCs that are actually ISBN-13s
    if (input.upc.length === 13 && input.upc.startsWith('978')) {
        return { isbn: input.upc };
    } else if (input.upc.length == 10) {
      return { isbn: input.upc };
    }
    
    // For other cases, let Genkit try to figure it out.
    const {output} = await prompt(input);
    return output!;
  }
);
