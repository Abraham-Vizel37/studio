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
  const familiarFrameworkValue = formData.get('familiarFramework');
  const targetFrameworkValue = formData.get('targetFramework');
  const componentToCompareValue = formData.get('componentToCompare');

  const dataForValidation = {
    familiarFramework: typeof familiarFrameworkValue === 'string' ? familiarFrameworkValue : '',
    targetFramework: typeof targetFrameworkValue === 'string' ? targetFrameworkValue : '',
    // Ensure componentToCompare is also treated as string or empty string
    componentToCompare: typeof componentToCompareValue === 'string' ? componentToCompareValue : '',
  };

  const validatedFields = GenerateComparisonInputSchema.safeParse(dataForValidation);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    const errorMessages = Object.entries(fieldErrors)
      .map(([field, errors]) => {
        if (errors && errors.length > 0) {
          // Capitalize field name for better readability
          const formattedField = field.charAt(0).toUpperCase() + field.slice(1)
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters for camelCase fields
            .trim();
          return `${formattedField}: ${errors.join(', ')}`;
        }
        return null;
      })
      .filter(message => message !== null)
      .join('; ');
    
    const formErrors = validatedFields.error.flatten().formErrors;
    let fullErrorMessage = errorMessages;
    if (formErrors.length > 0) {
        fullErrorMessage = formErrors.join('; ') + (errorMessages ? '; ' + errorMessages : '');
    }

    return {
      data: null,
      error: fullErrorMessage || "Validation failed.",
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
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { data: null, error: `Failed to generate comparison: ${errorMessage}. Please try again later.`, message: "An unexpected error occurred." };
  }
}
