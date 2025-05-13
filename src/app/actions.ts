'use server';

import { generateCodeExamples, type CodeExampleInput, type CodeExampleOutput } from '@/ai/flows/code-example-generation';
import { z } from 'zod';

const GenerateComparisonInputSchema = z.object({
  familiarFramework: z.string().min(1, "Familiar framework is required."),
  targetFramework: z.string().min(1, "Target framework is required."),
  componentToCompare: z.string().min(1, "Component/Functionality is required."),
});

export type GenerateComparisonActionState = {
  data: CodeExampleOutput | null;
  error: string | null;
  message?: string;
};

export async function handleGenerateComparison(
  prevState: GenerateComparisonActionState,
  formData: FormData
): Promise<GenerateComparisonActionState> {
  const rawFormData = {
    familiarFramework: formData.get('familiarFramework'),
    targetFramework: formData.get('targetFramework'),
    componentToCompare: formData.get('componentToCompare'),
  };

  const validatedFields = GenerateComparisonInputSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.map(([field, errors]) => `${field}: ${errors.join(', ')}`).join('; '),
    };
  }
  
  const input: CodeExampleInput = {
    framework1: validatedFields.data.familiarFramework,
    framework2: validatedFields.data.targetFramework,
    component: validatedFields.data.componentToCompare,
  };

  try {
    const result = await generateCodeExamples(input);
    if (result.example1 && result.example2 && result.explanation) {
        return { data: result, error: null, message: "Comparison generated successfully." };
    } else {
        return { data: null, error: "AI failed to generate a complete comparison. Please try again.", message: "Generation incomplete." };
    }
  } catch (error) {
    console.error("Error generating comparison:", error);
    return { data: null, error: "Failed to generate comparison. Please try again later.", message: "An unexpected error occurred." };
  }
}
