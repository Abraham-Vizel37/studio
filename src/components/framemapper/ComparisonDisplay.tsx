import type { CodeExampleOutput } from '@/ai/flows/code-example-generation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ComparisonDisplayProps {
  data: CodeExampleOutput;
  familiarFramework: string;
  targetFramework: string;
}

// Basic syntax highlighting for common keywords (extend as needed)
const highlightCode = (code: string, language: string) => {
  // This is a very rudimentary highlighter. For production, consider a library.
  // For now, we'll just wrap in pre/code.
  return <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm"><code className={`language-${language}`}>{code}</code></pre>;
};


export function ComparisonDisplay({ data, familiarFramework, targetFramework }: ComparisonDisplayProps) {
  const { example1, example2, explanation } = data;

  // Attempt to guess language from framework name for styling (very basic)
  const getLanguage = (framework: string) => {
    if (framework.toLowerCase().includes('python') || framework.toLowerCase().includes('pandas') || framework.toLowerCase().includes('django') || framework.toLowerCase().includes('flask')) return 'python';
    if (framework.toLowerCase().includes('react') || framework.toLowerCase().includes('vue') || framework.toLowerCase().includes('angular') || framework.toLowerCase().includes('nextjs') || framework.toLowerCase().includes('express') || framework.toLowerCase().includes('javascript')) return 'javascript';
    if (framework.toLowerCase().includes('sql')) return 'sql';
    // Add more language guesses as needed
    return 'plaintext'; 
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Comparison Result</CardTitle>
        <CardDescription>AI-generated comparison of {familiarFramework} and {targetFramework}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-primary">Explanation</h3>
          <p className="text-foreground/90 whitespace-pre-wrap">{explanation}</p>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-accent">{familiarFramework} Example</h3>
            {highlightCode(example1, getLanguage(familiarFramework))}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2 text-accent">{targetFramework} Example</h3>
            {highlightCode(example2, getLanguage(targetFramework))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
