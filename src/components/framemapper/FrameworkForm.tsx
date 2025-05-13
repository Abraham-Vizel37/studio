'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { GenerateComparisonActionState } from '@/app/actions';

const formSchema = z.object({
  familiarFramework: z.string().min(1, "Please select your familiar framework."),
  targetFramework: z.string().min(1, "Please select the framework you want to learn.").refine(
    (data, ctx) => {
        // @ts-ignore TODO: Fix this type error
        if (ctx.parent && ctx.parent.familiarFramework === data) {
        return false;
      }
      return true;
    },
    { message: "Target framework must be different from familiar framework." }
  ),
  componentToCompare: z.string().min(3, "Component/functionality must be at least 3 characters long."),
});

type FrameworkFormValues = z.infer<typeof formSchema>;

const sampleFrameworks = [
  { value: "react", label: "React" },
  { value: "angular", label: "Angular" },
  { value: "vue", label: "Vue.js" },
  { value: "svelte", label: "Svelte" },
  { value: "nextjs", label: "Next.js" },
  { value: "nuxtjs", label: "Nuxt.js" },
  { value: "express", label: "Express.js (Node.js)" },
  { value: "django", label: "Django (Python)" },
  { value: "flask", label: "Flask (Python)" },
  { value: "springboot", label: "Spring Boot (Java)" },
  { value: "rubyonrails", label: "Ruby on Rails" },
  { value: "pandas", label: "Pandas (Python)" },
  { value: "numpy", label: "NumPy (Python)" },
  { value: "excel", label: "Microsoft Excel" },
  { value: "googlesheets", label: "Google Sheets" },
  { value: "sql", label: "SQL (General)" },
  { value: "mongodb", label: "MongoDB (NoSQL)" },
  { value: "firebase_firestore", label: "Firebase Firestore" },
  { value: "aws_lambda", label: "AWS Lambda" },
  { value: "google_cloud_functions", label: "Google Cloud Functions" },
  { value: "azure_functions", label: "Azure Functions" },
  { value: "swiftui", label: "SwiftUI (iOS)" },
  { value: "jetpack_compose", label: "Jetpack Compose (Android)" },
  { value: "flutter", label: "Flutter" },
  { value: "react_native", label: "React Native" },
];

interface FrameworkFormProps {
  formAction: (payload: FormData) => void;
  initialState: GenerateComparisonActionState; // This is the state from useActionState
  isActionPending: boolean;
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Generate Comparison
    </Button>
  );
}

export function FrameworkForm({ formAction, initialState, isActionPending }: FrameworkFormProps) {
  const form = useForm<FrameworkFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      familiarFramework: '',
      targetFramework: '',
      componentToCompare: '',
    },
    // Set context for Zod refine to access other fields
    context: {}, 
  });

  const onSubmit = (values: FrameworkFormValues) => {
    // This function is called after react-hook-form validation passes
    const formData = new FormData();
    formData.append('familiarFramework', values.familiarFramework);
    formData.append('targetFramework', values.targetFramework);
    formData.append('componentToCompare', values.componentToCompare);
    formAction(formData); // Call the server action
  };

  // Watch familiarFramework to pass to targetFramework's refine context
  const familiarFrameworkValue = form.watch('familiarFramework');
  React.useEffect(() => {
    form.trigger('targetFramework'); // Re-validate targetFramework when familiarFramework changes
    // @ts-ignore
    form.options.context.familiarFramework = familiarFrameworkValue;
  }, [familiarFrameworkValue, form]);


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Framework Comparison</CardTitle>
        <CardDescription>
          Enter a familiar framework, a target framework, and a component or functionality to see an AI-generated comparison.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="familiarFramework"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Familiar Framework</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // @ts-ignore
                      form.options.context.familiarFramework = value;
                      form.trigger('targetFramework'); // Re-validate target when familiar changes
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a framework you know" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sampleFrameworks.map((fw) => (
                        <SelectItem key={`familiar-${fw.value}`} value={fw.value}>
                          {fw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetFramework"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Framework to Learn</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a framework to learn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sampleFrameworks.map((fw) => (
                        <SelectItem key={`target-${fw.value}`} value={fw.value} disabled={fw.value === familiarFrameworkValue}>
                          {fw.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="componentToCompare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Component or Functionality to Compare</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'State Management', 'Routing', 'Data Filtering'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <SubmitButton pending={isActionPending || form.formState.isSubmitting} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
