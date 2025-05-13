import type { CodeExampleResult } from '@/ai/flows/code-example-generation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface ComparisonDisplayProps {
  data: CodeExampleResult;
}

// Basic syntax highlighting for common keywords (extend as needed)
const highlightCode = (code: string, language: string) => {
  // This is a very rudimentary highlighter. For production, consider a library.
  return <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm"><code className={`language-${language}`}>{code}</code></pre>;
};

const renderFrameworkContent = (
  name: string,
  type: 'code' | 'spreadsheet',
  content: string,
  imageUrl?: string
) => {
  // Attempt to guess language from framework name for styling (very basic)
  const getLanguage = (frameworkName: string) => {
    const lowerName = frameworkName.toLowerCase();
    if (lowerName.includes('python') || lowerName.includes('pandas') || lowerName.includes('django') || lowerName.includes('flask')) return 'python';
    if (lowerName.includes('react') || lowerName.includes('vue') || lowerName.includes('angular') || lowerName.includes('nextjs') || lowerName.includes('express') || lowerName.includes('javascript') || lowerName.includes('typescript')) return 'javascript';
    if (lowerName.includes('sql')) return 'sql';
    if (lowerName.includes('java') || lowerName.includes('spring')) return 'java';
    if (lowerName.includes('c#') || lowerName.includes('.net')) return 'csharp';
    if (lowerName.includes('ruby')) return 'ruby';
    // Add more language guesses as needed
    return 'plaintext';
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-accent">{name} ({type})</h3>
      {type === 'code' ? (
        highlightCode(content, getLanguage(name))
      ) : (
        <div className="space-y-4">
          <p className="text-foreground/90 whitespace-pre-wrap">{content}</p>
          {imageUrl && (
            <div className="mt-4 border rounded-md overflow-hidden shadow-md">
              <Image
                src={imageUrl}
                alt={`Demonstration for ${name}`}
                width={600} // Provide appropriate default width
                height={400} // Provide appropriate default height
                layout="responsive" // Makes image scale with container
                objectFit="contain" // Adjust as needed: cover, fill, etc.
                className="rounded-md"
                data-ai-hint="spreadsheet functionality"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function ComparisonDisplay({ data }: ComparisonDisplayProps) {
  const {
    framework1Name, framework1Type, content1, imageUrl1,
    framework2Name, framework2Type, content2, imageUrl2,
    explanation
  } = data;

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Comparison Result</CardTitle>
        <CardDescription>AI-generated comparison of {framework1Name} and {framework2Name}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-primary">Explanation</h3>
          <p className="text-foreground/90 whitespace-pre-wrap">{explanation}</p>
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-6">
          {renderFrameworkContent(framework1Name, framework1Type, content1, imageUrl1)}
          {renderFrameworkContent(framework2Name, framework2Type, content2, imageUrl2)}
        </div>
      </CardContent>
    </Card>
  );
}
