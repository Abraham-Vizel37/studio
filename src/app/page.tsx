
'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
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
  const [state, formAction, isActionStatePending] = useActionState(handleGenerateComparison, initialState);
  const [isTransitionPending, startTransition] = useTransition();
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
    }
  }, [state, toast]);

  // Wrapper for form action to capture submitted form values for display
  const wrappedFormAction = (formData: FormData) => {
    const familiar = formData.get('familiarFramework') as string;
    const target = formData.get('targetFramework') as string;
    if (familiar && target) {
      setFormValues({ familiarFramework: familiar, targetFramework: target });
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  const isEffectivelyPending = isActionStatePending || isTransitionPending;

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

        <FrameworkForm
          formAction={wrappedFormAction}
          initialState={initialState}
          isActionPending={isEffectivelyPending}
        />

        {state.error && !currentComparison && ( // Show general error if no comparison is displayed yet
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

