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
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: flowOutput.imagePrompt1,
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      });
      if (media && media.url) {
        imageUrl1 = media.url;
      } else {
        console.warn(`Image generation for framework 1 did not return a valid media URL or media object. Prompt: "${flowOutput.imagePrompt1}"`);
      }
    } catch (imgError) {
      console.warn(`Failed to generate image for framework 1 (prompt: "${flowOutput.imagePrompt1}"): ${imgError}`);
    }
  }

  let imageUrl2: string | undefined = undefined;
  if (flowOutput.framework2Type === 'spreadsheet' && flowOutput.imagePrompt2) {
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: flowOutput.imagePrompt2,
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      });
      if (media && media.url) {
        imageUrl2 = media.url;
      } else {
        console.warn(`Image generation for framework 2 did not return a valid media URL or media object. Prompt: "${flowOutput.imagePrompt2}"`);
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

For {{{framework1}}}:
1. Determine if {{{framework1}}} is primarily 'code'-based or 'spreadsheet'-based. For example, "React" is code-based, "Microsoft Excel" is spreadsheet-based.
2. Set 'framework1Type' to either "code" or "spreadsheet".
3. If 'framework1Type' is "code":
    - For 'content1', provide a concise, functional code example demonstrating {{{component}}} in {{{framework1}}}. Ensure the code is well-formatted (e.g. markdown code block).
    - Do not set 'imagePrompt1'.
4. If 'framework1Type' is "spreadsheet":
    - For 'content1', provide clear, step-by-step textual instructions on how to achieve {{{component}}} in {{{framework1}}}. Number the steps.
    - For 'imagePrompt1', if an image would be helpful to illustrate the steps or the result, provide a detailed textual prompt in clear English for an image generation model. This prompt should aim to generate a high-quality, realistic, screenshot-like image of the {{{framework1}}} interface (e.g., Microsoft Excel or Google Sheets), clearly showing {{{component}}} in action, as if taken from a tutorial or official documentation. The prompt must:
        * Explicitly state the name of the spreadsheet software (e.g., "A realistic, documentation-style screenshot of Microsoft Excel showing...").
        * Clearly depict the main spreadsheet grid with visible cells (e.g., A1, B2), rows, and columns.
        * Include typical UI elements like the formula bar, ribbon or toolbar (simplified, but characteristic of the software), and sheet tabs at the bottom.
        * Show relevant sample data within the cells pertinent to demonstrating {{{component}}}.
        * If {{{component}}} involves a formula, the formula bar should clearly display it, and the result should be visible in the corresponding cell. The active cell showing the result or the primary focus of the component should be visually apparent (e.g., highlighted).
        * All text (in cells, formula bar, UI elements) must be sharp, clear, and easily legible English.
        * The overall layout should be clean, professional, and easy to understand, focusing on the specific {{{component}}}. Avoid unnecessary clutter.
        * Example image prompt for {{{framework1}}} (if it's a spreadsheet software like Microsoft Excel) and {{{component}}} like 'SUM function': "High-quality, realistic screenshot of a {{{framework1}}} spreadsheet, resembling an official tutorial image. Cell C1 is active, showing the result '30'. The formula bar at the top clearly displays '=SUM(A1:B1)'. Cell A1 contains '10', cell B1 contains '20'. Column headers A, B, C and row header 1 are visible. A simplified ribbon/toolbar characteristic of {{{framework1}}} is visible at the top, and sheet tabs at the bottom."
        * If an image is not suitable or a clear, detailed prompt fitting these criteria cannot be generated, omit 'imagePrompt1'.

For {{{framework2}}}:
1. Determine if {{{framework2}}} is primarily 'code'-based or 'spreadsheet'-based.
2. Set 'framework2Type' to either "code" or "spreadsheet".
3. If 'framework2Type' is "code":
    - For 'content2', provide a concise, functional code example demonstrating {{{component}}} in {{{framework2}}}. Ensure the code is well-formatted (e.g. markdown code block).
    - Do not set 'imagePrompt2'.
4. If 'framework2Type' is "spreadsheet":
    - For 'content2', provide clear, step-by-step textual instructions on how to achieve {{{component}}} in {{{framework2}}}. Number the steps.
    - For 'imagePrompt2', if an image would be helpful, provide a detailed textual prompt in clear English for an image generation model. This prompt should aim to generate a high-quality, realistic, screenshot-like image of the {{{framework2}}} interface (e.g., Microsoft Excel or Google Sheets), clearly showing {{{component}}} in action, as if taken from a tutorial or official documentation. The prompt must:
        * Explicitly state the name of the spreadsheet software (e.g., "A realistic, documentation-style screenshot of Google Sheets showing...").
        * Clearly depict the main spreadsheet grid with visible cells (e.g., A1, B2), rows, and columns.
        * Include typical UI elements like the formula bar, ribbon or toolbar (simplified, but characteristic of the software), and sheet tabs at the bottom.
        * Show relevant sample data within the cells pertinent to demonstrating {{{component}}}.
        * If {{{component}}} involves a formula, the formula bar should clearly display it, and the result should be visible in the corresponding cell. The active cell showing the result or the primary focus of the component should be visually apparent (e.g., highlighted).
        * All text (in cells, formula bar, UI elements) must be sharp, clear, and easily legible English.
        * The overall layout should be clean, professional, and easy to understand, focusing on the specific {{{component}}}. Avoid unnecessary clutter.
        * Example image prompt for {{{framework2}}} (if it's a spreadsheet software like Google Sheets) and {{{component}}} like 'AVERAGE function': "High-quality, realistic screenshot of a {{{framework2}}} spreadsheet, resembling an official tutorial image. Cell D1 is active, showing the result '10'. The formula bar at the top clearly displays '=AVERAGE(A1:C1)'. Cells A1, B1, C1 contain sample numbers 5, 10, 15 respectively. Column headers A, B, C, D and row header 1 are visible. A simplified menu bar characteristic of {{{framework2}}} is visible at the top, and sheet tabs at the bottom."
        * If an image is not suitable or a clear, detailed prompt fitting these criteria cannot be generated, omit 'imagePrompt2'.

Finally, for 'explanation', provide an overall comparison of how {{{framework1}}} and {{{framework2}}} handle {{{component}}}. Discuss similarities, differences, learning curves, and conceptual model shifts. Make this explanation insightful for someone familiar with one framework learning the other.
Focus on providing practical and accurate information. Ensure code examples are complete and functional. Ensure spreadsheet instructions are clear and actionable.
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
    // Basic validation that AI returned something for content fields.
    if (!output.content1 || !output.content2 || !output.explanation) {
        throw new Error("AI output is incomplete. Missing content or explanation.");
    }
    return output;
  }
);


    