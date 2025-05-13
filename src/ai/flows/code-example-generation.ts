'use server';

/**
 * @fileOverview Generates code examples for two frameworks to illustrate similar functionality.
 *
 * - generateCodeExamples - A function that generates code examples for two frameworks.
 * - CodeExampleInput - The input type for the generateCodeExamples function.
 * - CodeExampleOutput - The return type for the generateCodeExamples function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeExampleInputSchema = z.object({
  framework1: z.string().describe('The name of the first framework.'),
  framework2: z.string().describe('The name of the second framework.'),
  component: z.string().describe('The component or functionality to compare.'),
});
export type CodeExampleInput = z.infer<typeof CodeExampleInputSchema>;

const CodeExampleOutputSchema = z.object({
  example1: z.string().describe('Code example for the first framework.'),
  example2: z.string().describe('Code example for the second framework.'),
  explanation: z.string().describe('Explanation of the code examples and their similarities/differences.'),
});
export type CodeExampleOutput = z.infer<typeof CodeExampleOutputSchema>;

export async function generateCodeExamples(input: CodeExampleInput): Promise<CodeExampleOutput> {
  return generateCodeExamplesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeExamplePrompt',
  input: {schema: CodeExampleInputSchema},
  output: {schema: CodeExampleOutputSchema},
  prompt: `You are an AI expert in various technology frameworks, skilled at providing clear and concise code examples.

You will receive two framework names and a component to compare. Your task is to generate code examples for both frameworks that demonstrate how to achieve a similar result.

Framework 1: {{{framework1}}}
Framework 2: {{{framework2}}}
Component: {{{component}}}

Ensure the code examples are as close to one-to-one as possible, highlighting the similarities and differences in the approach.
Also provide a short explanation of what the code does and the conceptual similarities and differences between the frameworks.

Example 1 ({{{framework1}}}):

Example 2 ({{{framework2}}}):

Explanation:
`,
});

const generateCodeExamplesFlow = ai.defineFlow(
  {
    name: 'generateCodeExamplesFlow',
    inputSchema: CodeExampleInputSchema,
    outputSchema: CodeExampleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
