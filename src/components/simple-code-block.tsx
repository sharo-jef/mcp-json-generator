"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimpleCodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

export function SimpleCodeBlock({
  children,
  language = "json",
  className,
}: SimpleCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative rounded-lg border bg-muted/50", className)}>
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30">
        <span className="text-sm font-medium text-muted-foreground">
          {language}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={copyToClipboard}
          className="h-7 px-2"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm">
          <code className="language-{language}">{children}</code>
        </pre>
      </div>
    </div>
  );
}
