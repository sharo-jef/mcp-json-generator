"use client";

import { Check, Copy, FileJson } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { editorConfigs } from "@/data/mcp-servers";
import { cn } from "@/lib/utils";
import type { EditorTool } from "@/types/mcp";

interface EditorCodeBlockProps {
  configs: Record<EditorTool, string>;
  className?: string;
  selectedEditor: EditorTool;
  setSelectedEditor: (tool: EditorTool) => void;
}

export function EditorCodeBlock({
  configs,
  className,
  selectedEditor,
  setSelectedEditor,
}: EditorCodeBlockProps) {
  const availableEditors = editorConfigs.filter(
    (config) => config.tool in configs,
  );

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const code = configs[selectedEditor] || "";
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentConfig = editorConfigs.find(
    (config) => config.tool === selectedEditor,
  );
  const filename = currentConfig?.fileName || "config.json";

  return (
    <div className={cn("relative rounded-lg border bg-muted/50", className)}>
      <div className="flex items-center justify-between border-b px-4 py-2.5 bg-muted/30">
        <div className="flex items-center gap-2">
          <FileJson className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-mono">
            {filename}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedEditor}
            onValueChange={(value) => setSelectedEditor(value as EditorTool)}
          >
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableEditors.map((config) => (
                <SelectItem key={config.tool} value={config.tool}>
                  {config.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="ghost"
            onClick={copyToClipboard}
            className="h-7 w-7"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      <div className="overflow-auto max-h-[500px]">
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "0.875rem",
          }}
        >
          {configs[selectedEditor] || ""}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
