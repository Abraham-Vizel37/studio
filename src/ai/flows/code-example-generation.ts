'use server';

/**
 * @fileOverview Generates code examples or spreadsheet instructions (with images) for two frameworks to illustrate similar functionality.
 *
 * - generateCodeExamples - A function that generates comparisons for two frameworks.
 * - CodeExampleInput - The input type for the generateCodeExamples function.
 * - CodeExampleResult - The final return type for the generateCodeExamples function, including image URLs.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeExampleInputSchema = z.object({
  framework1: z.string().describe('The name of the first framework.'),
  framework2: z.string().describe('The name of the second framework.'),
  component: z.string().describe('The component or functionality to compare.'),
});
export type CodeExampleInput = z.infer<typeof CodeExampleInputSchema>;

// Internal schema for the text-generation part of the flow
const InternalCodeExampleOutputSchema = z.object({
  framework1Type: z.enum(['code', 'spreadsheet']).describe('The type of the first framework (code or spreadsheet).'),
  content1: z.string().describe('Either code example (for "code" type) or step-by-step instructions (for "spreadsheet" type) for the first framework.'),
  imagePrompt1: z.string().optional().describe('A prompt for generating an image, if framework 1 is a spreadsheet and an image is relevant. Omit if not applicable.'),

  framework2Type: z.enum(['code', 'spreadsheet']).describe('The type of the second framework (code or spreadsheet).'),
  content2: z.string().describe('Either code example (for "code" type) or step-by-step instructions (for "spreadsheet" type) for the second framework.'),
  imagePrompt2: z.string().optional().describe('A prompt for generating an image, if framework 2 is a spreadsheet and an image is relevant. Omit if not applicable.'),

  explanation: z.string().describe('Overall explanation comparing the two approaches.'),
});
type InternalCodeExampleOutput = z.infer<typeof InternalCodeExampleOutputSchema>;

// Final result type that includes generated image URLs
export type CodeExampleResult = {
  framework1Name: string;
  framework1Type: 'code' | 'spreadsheet';
  content1: string;
  imageUrl1?: string; // Data URI

  framework2Name: string;
  framework2Type: 'code' | 'spreadsheet';
  content2: string;
  imageUrl2?: string; // Data URI

  explanation: string;
};


export async function generateCodeExamples(input: CodeExampleInput): Promise<CodeExampleResult> {
  const flowOutput = await generateCodeExamplesFlow(input);

  let imageUrl1: string | undefined = undefined;
  if (flowOutput.framework1Type === 'spreadsheet' && flowOutput.imagePrompt1) {
    try {
      const {mediaArr} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // Ensure this model supports image generation
        prompt: flowOutput.imagePrompt1,
        config: { responseModalities: ['IMAGE', 'TEXT'] }, // Request IMAGE and TEXT
      });
      if (mediaArr && mediaArr[0] && mediaArr[0].url) {
        imageUrl1 = mediaArr[0].url;
      } else {
         // Fallback or warning if media is not as expected
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
            prompt: flowOutput.imagePrompt1,
            config: { responseModalities: ['IMAGE', 'TEXT'] },
        });
        if (media && media.url) {
            imageUrl1 = media.url;
        } else {
            console.warn(`Image generation for framework 1 did not return a valid media URL. Prompt: "${flowOutput.imagePrompt1}"`);
        }
      }
    } catch (imgError) {
      console.warn(`Failed to generate image for framework 1 (prompt: "${flowOutput.imagePrompt1}"): ${imgError}`);
    }
  }

  let imageUrl2: string | undefined = undefined;
  if (flowOutput.framework2Type === 'spreadsheet' && flowOutput.imagePrompt2) {
    try {
      const {mediaArr} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: flowOutput.imagePrompt2,
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      });
       if (mediaArr && mediaArr[0] && mediaArr[0].url) {
        imageUrl2 = mediaArr[0].url;
      } else {
         const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
            prompt: flowOutput.imagePrompt2,
            config: { responseModalities: ['IMAGE', 'TEXT'] },
        });
        if (media && media.url) {
            imageUrl2 = media.url;
        } else {
             console.warn(`Image generation for framework 2 did not return a valid media URL. Prompt: "${flowOutput.imagePrompt2}"`);
        }
      }
    } catch (imgError) {
      console.warn(`Failed to generate image for framework 2 (prompt: "${flowOutput.imagePrompt2}"): ${imgError}`);
    }
  }

  return {
    framework1Name: input.framework1,
    framework1Type: flowOutput.framework1Type,
    content1: flowOutput.content1,
    imageUrl1,
    framework2Name: input.framework2,
    framework2Type: flowOutput.framework2Type,
    content2: flowOutput.content2,
    imageUrl2,
    explanation: flowOutput.explanation,
  };
}

const prompt = ai.definePrompt({
  name: 'codeOrSpreadsheetExamplePrompt',
  input: {schema: CodeExampleInputSchema},
  output: {schema: InternalCodeExampleOutputSchema},
  prompt: `You are an AI expert in various technology frameworks, skilled at providing clear and concise examples and explanations.
You will receive two framework names and a component/functionality to compare.

Framework 1: {{{framework1}}}
Framework 2: {{{framework2}}}
Component/Functionality: {{{component}}}

Known spreadsheet-based frameworks include "Microsoft Excel", "Google Sheets", "excel", "googlesheets", "Excel", "Google Sheets".
Analyze each framework name provided.

For each framework ({{{framework1}}} and {{{framework2}}}):
1. Determine if it is primarily 'code'-based or 'spreadsheet'-based. For example, "React" is code-based, "Microsoft Excel" is spreadsheet-based.
2. Set 'framework1Type' and 'framework2Type' to either "code" or "spreadsheet" accordingly.

If 'frameworkXType' is "code" (e.g., for {{{framework1}}} if it's code-based):
  - For 'contentX' (e.g., 'content1'), provide a concise and functional code example demonstrating {{{component}}} in that framework.
  - Do not set 'imagePromptX' (e.g., 'imagePrompt1').

If 'frameworkXType' is "spreadsheet" (e.g., for {{{framework1}}} if it's spreadsheet-based):
  - For 'contentX' (e.g., 'content1'), provide clear, step-by-step textual instructions on how to achieve {{{component}}} in that spreadsheet software. Number the steps.
  - For 'imagePromptX' (e.g., 'imagePrompt1'), if an image would be helpful to illustrate the steps or the result, provide a detailed textual prompt for an image generation model. This prompt should describe a visual representation of the spreadsheet task (e.g., "Screenshot of an Excel sheet with a VLOOKUP formula =VLOOKUP(A2, Sheet2!A:B, 2, FALSE) highlighted in the formula bar, showing data being pulled from another table named Sheet2 into cell B2. The cell A2 contains the lookup value 'ProductX'. Columns A and B on the current sheet and Sheet2 should have sample data."). If an image is not suitable or cannot be clearly described, omit 'imagePromptX'. Ensure the image prompt asks for a data URI with a MIME type and Base64 encoding.

Finally, for 'explanation', provide an overall comparison of how {{{framework1}}} and {{{framework2}}} handle {{{component}}}. Discuss similarities, differences, learning curves, and conceptual model shifts. Make this explanation insightful for someone familiar with one framework learning the other.
Focus on providing practical and accurate information.
`,
});

const generateCodeExamplesFlow = ai.defineFlow(
  {
    name: 'generateCodeExamplesFlow',
    inputSchema: CodeExampleInputSchema,
    outputSchema: InternalCodeExampleOutputSchema, // Outputting intermediate schema
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate an output for the prompt.");
    }
    // Ensure enum values are correctly cased if necessary, though Zod handles this.
    // Basic validation that AI returned something for content fields.
    if (!output.content1 || !output.content2 || !output.explanation) {
        throw new Error("AI output is incomplete. Missing content or explanation.");
    }
    return output;
  }
);
