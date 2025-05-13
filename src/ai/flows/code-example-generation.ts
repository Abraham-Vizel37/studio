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
      console.log(`[generateCodeExamples] Generating image for framework 1: ${input.framework1} with prompt: "${flowOutput.imagePrompt1}"`);
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: flowOutput.imagePrompt1,
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      });
      if (media && media.url) {
        imageUrl1 = media.url;
        console.log(`[generateCodeExamples] Image generated successfully for framework 1.`);
      } else {
        console.warn(`[generateCodeExamples] Image generation for framework 1 did not return a valid media URL or media object. Prompt: "${flowOutput.imagePrompt1}"`, media);
      }
    } catch (imgError) {
      console.warn(`[generateCodeExamples] Failed to generate image for framework 1 (prompt: "${flowOutput.imagePrompt1}"):`, imgError);
    }
  }

  let imageUrl2: string | undefined = undefined;
  if (flowOutput.framework2Type === 'spreadsheet' && flowOutput.imagePrompt2) {
    try {
      console.log(`[generateCodeExamples] Generating image for framework 2: ${input.framework2} with prompt: "${flowOutput.imagePrompt2}"`);
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: flowOutput.imagePrompt2,
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      });
      if (media && media.url) {
        imageUrl2 = media.url;
        console.log(`[generateCodeExamples] Image generated successfully for framework 2.`);
      } else {
        console.warn(`[generateCodeExamples] Image generation for framework 2 did not return a valid media URL or media object. Prompt: "${flowOutput.imagePrompt2}"`, media);
      }
    } catch (imgError) {
      console.warn(`[generateCodeExamples] Failed to generate image for framework 2 (prompt: "${flowOutput.imagePrompt2}"):`, imgError);
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
    - For 'content1', provide clear, step-by-step textual instructions in plain English on how to achieve {{{component}}} in {{{framework1}}}. Number the steps. Make instructions detailed and easy to follow.
    - For 'imagePrompt1', if an image would be helpful to illustrate the steps or the result, provide a detailed textual prompt in clear English for an image generation model. This prompt should aim to generate a high-quality, realistic, screenshot-like image of the {{{framework1}}} interface (e.g., Microsoft Excel or Google Sheets), clearly showing {{{component}}} in action, as if taken from a tutorial or official documentation. The prompt must:
        * Explicitly state the name of the spreadsheet software (e.g., "A realistic, documentation-style screenshot of Microsoft Excel showing...").
        * Clearly depict the main spreadsheet grid with visible cells (e.g., A1, B2), rows, and columns.
        * Include typical UI elements like the formula bar, ribbon or toolbar (simplified, but characteristic of the software), and sheet tabs at the bottom. All UI text must be in English.
        * Show relevant sample data within the cells pertinent to demonstrating {{{component}}}. Data should be simple and clear.
        * If {{{component}}} involves a formula, the formula bar should clearly display it in English, and the result should be visible in the corresponding cell. The active cell showing the result or the primary focus of the component should be visually apparent (e.g., highlighted).
        * All text (in cells, formula bar, UI elements like menus or ribbons) must be sharp, clear, and easily legible English. Ensure no placeholder text like 'Lorem Ipsum'.
        * The overall layout should be clean, professional, and easy to understand, focusing on the specific {{{component}}}. Avoid unnecessary clutter. The image should resemble an actual screenshot from the specified software.
        * Example image prompt for {{{framework1}}} (if it's Microsoft Excel) and {{{component}}} like 'SUM function': "High-quality, realistic screenshot of a Microsoft Excel spreadsheet, resembling an official tutorial image. Cell C1 is active and highlighted, showing the result '30'. The formula bar at the top clearly displays '=SUM(A1:B1)'. Cell A1 contains '10', cell B1 contains '20'. Column headers A, B, C and row header 1 are visible and in English. A simplified Excel ribbon/toolbar characteristic of Microsoft Excel is visible at the top, with English labels. Sheet tabs at the bottom show 'Sheet1' in English."
        * If an image is not suitable or a clear, detailed prompt fitting these criteria cannot be generated, omit 'imagePrompt1'.

For {{{framework2}}}:
1. Determine if {{{framework2}}} is primarily 'code'-based or 'spreadsheet'-based.
2. Set 'framework2Type' to either "code" or "spreadsheet".
3. If 'framework2Type' is "code":
    - For 'content2', provide a concise, functional code example demonstrating {{{component}}} in {{{framework2}}}. Ensure the code is well-formatted (e.g. markdown code block).
    - Do not set 'imagePrompt2'.
4. If 'framework2Type' is "spreadsheet":
    - For 'content2', provide clear, step-by-step textual instructions in plain English on how to achieve {{{component}}} in {{{framework2}}}. Number the steps. Make instructions detailed and easy to follow.
    - For 'imagePrompt2', if an image would be helpful, provide a detailed textual prompt in clear English for an image generation model, following the same detailed criteria as for 'imagePrompt1', but adapted for {{{framework2}}}.
        * Example image prompt for {{{framework2}}} (if it's Google Sheets) and {{{component}}} like 'AVERAGE function': "High-quality, realistic screenshot of a Google Sheets spreadsheet, resembling an official tutorial image. Cell D1 is active and highlighted, showing the result '10'. The formula bar at the top clearly displays '=AVERAGE(A1:C1)'. Cells A1, B1, C1 contain sample numbers 5, 10, 15 respectively. Column headers A, B, C, D and row header 1 are visible and in English. A simplified Google Sheets menu bar (File, Edit, View, etc. in English) characteristic of Google Sheets is visible at the top. Sheet tabs at the bottom show 'Sheet1' in English."
        * If an image is not suitable or a clear, detailed prompt fitting these criteria cannot be generated, omit 'imagePrompt2'.

Finally, for 'explanation', provide an overall comparison of how {{{framework1}}} and {{{framework2}}} handle {{{component}}}. Discuss similarities, differences, learning curves, and conceptual model shifts. Make this explanation insightful for someone familiar with one framework learning the other.
Focus on providing practical and accurate information. Ensure code examples are complete and functional. Ensure spreadsheet instructions are clear and actionable. Ensure all generated text is in English.
`,
});

const generateCodeExamplesFlow = ai.defineFlow(
  {
    name: 'generateCodeExamplesFlow',
    inputSchema: CodeExampleInputSchema,
    outputSchema: InternalCodeExampleOutputSchema,
  },
  async (input: CodeExampleInput): Promise<InternalCodeExampleOutput> => {
    let promptResult;
    try {
      console.log(`[generateCodeExamplesFlow] Calling prompt for input:`, input);
      promptResult = await prompt(input);
    } catch (e) {
      console.error('[generateCodeExamplesFlow] Error during prompt execution:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new Error(`AI model failed to process the request: ${errorMessage}`);
    }

    if (!promptResult || !promptResult.output) {
      console.error('[generateCodeExamplesFlow] AI prompt returned null or undefined output. Full response:', promptResult);
      throw new Error('AI failed to generate a valid structured output. The response from the model was empty or not in the expected format.');
    }

    const output = promptResult.output;
    console.log('[generateCodeExamplesFlow] Received output from prompt:', output);


    // Basic validation, Zod handles schema conformance, but explicit checks for mission-critical fields.
    if (typeof output.framework1Type !== 'string' || !output.content1 ||
        typeof output.framework2Type !== 'string' || !output.content2 ||
        typeof output.explanation !== 'string') {
      console.error('[generateCodeExamplesFlow] AI output is structurally incomplete. Output:', output);
      throw new Error('AI output is incomplete. Key fields like framework types, content, or explanation are missing or invalid.');
    }
    
    // Log if spreadsheet type has content but no image prompt (as per refined prompt logic, this is now allowed)
    if (output.framework1Type === 'spreadsheet' && output.content1 && !output.imagePrompt1) {
        console.warn(`[generateCodeExamplesFlow] Framework 1 (${input.framework1}) is spreadsheet type with content, but no imagePrompt1 was generated by the AI.`);
    }
     if (output.framework2Type === 'spreadsheet' && output.content2 && !output.imagePrompt2) {
        console.warn(`[generateCodeExamplesFlow] Framework 2 (${input.framework2}) is spreadsheet type with content, but no imagePrompt2 was generated by the AI.`);
    }

    return output;
  }
);
