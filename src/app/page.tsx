'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/framemapper/Header';
import { Footer } from '@/components/framemapper/Footer';
import { FrameworkForm } from '@/components/framemapper/FrameworkForm';
import { ComparisonDisplay } from '@/components/framemapper/ComparisonDisplay';
import { FeedbackForm } from '@/components/framemapper/FeedbackForm';
import { handleGenerateComparison, type GenerateComparisonActionState } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CodeExampleResult } from '@/ai/flows/code-example-generation'; // Updated import

const initialState: GenerateComparisonActionState = {
  data: null,
  error: null,
};

export default function Home() {
  const [state, formAction] = React.useActionState(handleGenerateComparison, initialState);
  const { toast } = useToast();
  const [currentComparison, setCurrentComparison] = useState<CodeExampleResult | null>(null);
  // formValues is no longer needed for ComparisonDisplay as names are in CodeExampleResult

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

  // The formAction from useActionState already handles pending state.
  // If you need to do something before/after the action related to form values,
  // it's usually done within the action itself or via useEffect on `state`.
  // For this specific case where we just needed formValues for display,
  // and now `CodeExampleResult` includes names, this wrapper might be simplified or removed
  // if no other pre-action logic is needed from the client side.
  // Let's keep the form action directly from useActionState for FrameworkForm.

  const isEffectivelyPending =  (React.useContext(React.Fragment||React.SuspenseContext) as any)?._isInTransition || false;


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
          formAction={formAction} // Directly use formAction from useActionState
          initialState={initialState}
          isActionPending={isEffectivelyPending}
        />

        {state.error && !currentComparison && (
          <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Generating Comparison</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {currentComparison && (
          <>
            {/* Pass only currentComparison which now includes framework names */}
            <ComparisonDisplay data={currentComparison} />
            <FeedbackForm />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
