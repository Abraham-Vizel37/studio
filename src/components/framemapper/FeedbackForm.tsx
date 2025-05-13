'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

export function FeedbackForm() {
  const [rating, setRating] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast({
        title: 'Feedback Error',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }
    // In a real app, you would send this feedback to a server
    console.log('Feedback submitted:', { rating });
    toast({
      title: 'Feedback Received!',
      description: 'Thank you for helping us improve.',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Thank You!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-foreground/90">Your feedback has been recorded.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Rate this Comparison</CardTitle>
        <CardDescription>Was this comparison helpful?</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            onValueChange={setRating}
            className="flex justify-center space-x-2 sm:space-x-4"
            aria-label="Feedback rating"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <FormItem key={value} className="flex flex-col items-center space-y-1">
                <FormControl>
                   <RadioGroupItem value={String(value)} id={`rating-${value}`} className="sr-only" />
                </FormControl>
                <Label htmlFor={`rating-${value}`} className="cursor-pointer">
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      rating && parseInt(rating) >= value
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-muted-foreground hover:text-yellow-300'
                    }`}
                  />
                </Label>
                 <span className="text-xs text-muted-foreground">{value}</span>
              </FormItem>
            ))}
          </RadioGroup>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Minimal FormItem and FormControl to satisfy RadioGroup structure if not using full Form context
// These are simplified and might need adjustment based on final structure.
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
);
FormItem.displayName = "FormItem";

const FormControl = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />;
});
FormControl.displayName = "FormControl";

