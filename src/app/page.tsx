'use client';

import { useFormState } from 'react-dom';
import { useEffect, useState } from 'react';
import { Header } from '@/components/framemapper/Header';
import { Footer } from '@/components/framemapper/Footer';
import { FrameworkForm } from '@/components/framemapper/FrameworkForm';
import { ComparisonDisplay } from '@/components/framemapper/ComparisonDisplay';
import { FeedbackForm } from '@/components/framemapper/FeedbackForm';
import { handleGenerateComparison, type GenerateComparisonActionState } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CodeExampleOutput } from '@/ai/flows/code-example-generation';

const initialState: GenerateComparisonActionState = {
  data: null,
  error: null,
};

export default function Home() {
  const [state, formAction] = useFormState(handleGenerateComparison, initialState);
  const { toast } = useToast();
  const [currentComparison, setCurrentComparison] = useState<CodeExampleOutput | null>(null);
  const [formValues, setFormValues] = useState<{ familiarFramework: string, targetFramework: string } | null>(null);

  useEffect(() => {
    if (state.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
    if (state.message && !state.error) {
       toast({
        title: 'Success',
        description: state.message,
      });
    }
    if (state.data) {
      setCurrentComparison(state.data);
      // This is a bit of a hack to get the framework names for display
      // Ideally, the form data would be more directly accessible or returned by the action
      // For now, we'll try to get it from a FormData instance if needed, or better, pass it through state.
      // The formAction now uses FormData, so we'd need to store the input values separately if we want them here.
      // For simplicity, let's assume FrameworkForm can provide these if needed, or we extract from state.data if possible (not in this AI output).
      // We will assume `familiarFramework` and `targetFramework` were part of the form data that `handleGenerateComparison` could access.
      // To make it available for ComparisonDisplay, we need to capture it when the form is submitted.
      // This part is tricky with useFormState if we don't pass the raw form values back.
      // A simpler approach: store the relevant form inputs in local state on successful generation.
      // The prompt for `generateCodeExamples` uses framework1 and framework2 from input, which are the familiar and target.
      // We will capture these in the FrameworkForm or Page to pass to ComparisonDisplay.
      // Let's extract from a hypothetical scenario or a slightly modified action.
      // For now, this is simplified.
    }
  }, [state, toast]);

  // Wrapper for form action to capture submitted form values
  const wrappedFormAction = (formData: FormData) => {
    const familiar = formData.get('familiarFramework') as string;
    const target = formData.get('targetFramework') as string;
    setFormValues({ familiarFramework: familiar, targetFramework: target });
    formAction(formData);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">Unlock New Tech Skills, Faster.</h2>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
            Leverage your existing knowledge. FrameMapper translates concepts from frameworks you know to ones you want to learn, using AI.
          </p>
        </div>

        <FrameworkForm formAction={wrappedFormAction} initialState={initialState} />

        {state.error && (
          <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Generating Comparison</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {currentComparison && formValues && (
          <>
            <ComparisonDisplay data={currentComparison} familiarFramework={formValues.familiarFramework} targetFramework={formValues.targetFramework} />
            <FeedbackForm />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
