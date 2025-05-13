// The use server directive is required for all flow files.
'use server';

/**
 * @fileOverview Compares functionality between two different frameworks using AI.
 *
 * - frameworkComparison - A function that compares frameworks.
 * - FrameworkComparisonInput - The input type for the frameworkComparison function.
 * - FrameworkComparisonOutput - The return type for the frameworkComparison function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FrameworkComparisonInputSchema = z.object({
  familiarFramework: z
    .string()
    .describe('The framework that the user is familiar with.'),
  targetFramework: z.string().describe('The framework to compare against.'),
  functionality: z.string().describe('The specific functionality to compare.'),
});
export type FrameworkComparisonInput = z.infer<typeof FrameworkComparisonInputSchema>;

const FrameworkComparisonOutputSchema = z.object({
  comparison: z
    .string()
    .describe(
      'A detailed comparison of how each framework handles the specified functionality, including code samples and explanations.'
    ),
});
export type FrameworkComparisonOutput = z.infer<typeof FrameworkComparisonOutputSchema>;

export async function frameworkComparison(input: FrameworkComparisonInput): Promise<FrameworkComparisonOutput> {
  return frameworkComparisonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'frameworkComparisonPrompt',
  input: {schema: FrameworkComparisonInputSchema},
  output: {schema: FrameworkComparisonOutputSchema},
  prompt: `You are an AI assistant that generates a detailed comparison of how two different frameworks handle a specific functionality.

  Familiar Framework: {{{familiarFramework}}}
  Target Framework: {{{targetFramework}}}
  Functionality: {{{functionality}}}

  Comparison: Provide a detailed comparison of how each framework handles the specified functionality. Include code samples and explanations.
  `,
});

const frameworkComparisonFlow = ai.defineFlow(
  {
    name: 'frameworkComparisonFlow',
    inputSchema: FrameworkComparisonInputSchema,
    outputSchema: FrameworkComparisonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
