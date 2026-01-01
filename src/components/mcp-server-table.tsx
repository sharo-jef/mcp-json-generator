"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, ExternalLink, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table";
import { EditorCodeBlock } from "@/components/editor-code-block";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { editorConfigs, mcpServers } from "@/data/mcp-servers";
import type { EditorConfig, EditorTool, MCPServer } from "@/types/mcp";

export function MCPServerTable() {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<EditorTool>("vscode");

  // Load selectedEditor from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mcp-selected-editor");
    if (saved) {
      setSelectedEditor(saved as EditorTool);
    }
  }, []);

  // Save selectedEditor to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("mcp-selected-editor", selectedEditor);
  }, [selectedEditor]);

  const getSelectedServers = (): MCPServer[] => {
    return mcpServers.filter((_, index) => selectedRows[index]);
  };

  const generateMCPConfig = (editorConfig: EditorConfig): string => {
    const selected = getSelectedServers();
    const config: any = {};

    for (const server of selected) {
      config[server.id] = server.config;
    }

    return JSON.stringify({ [editorConfig.prop]: config }, null, 2);
  };

  const generateConfigsForAllEditors = (): Record<EditorTool, string> => {
    const configs: Record<string, string> = {};

    for (const editorConfig of editorConfigs) {
      configs[editorConfig.tool] = generateMCPConfig(editorConfig);
    }

    return configs as Record<EditorTool, string>;
  };

  const copyToClipboard = async () => {
    const editorConfig = editorConfigs.find((ec) => ec.tool === selectedEditor);
    if (!editorConfig) {
      toast.error("Invalid editor selected.");
      return;
    }
    const config = generateMCPConfig(editorConfig);
    await navigator.clipboard.writeText(config);
    toast.success("Configuration copied to clipboard!");
  };

  const columns: ColumnDef<MCPServer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-md truncate">{row.getValue("description")}</div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => <div>{row.getValue("category")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const server = row.original;

        if (!server.repository) {
          return <div style={{ width: "36px", height: "32px" }} />;
        } else {
          return (
            <a
              href={server.repository || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Button variant="ghost" size="sm" disabled={!server.repository}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          );
        }
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={mcpServers}
        searchKey="name"
        searchPlaceholder="Search MCP servers..."
        rowSelection={selectedRows}
        onRowSelectionChange={setSelectedRows}
        toolbarActions={
          <TooltipProvider>
            <div className="flex gap-2 items-center">
              <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {editorConfigs.map((config) => (
                    <SelectItem key={config.tool} value={config.tool}>
                      {config.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPreviewOpen(true)}
                    disabled={getSelectedServers().length === 0}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Preview Configuration</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    disabled={getSelectedServers().length === 0}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy to Clipboard</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        }
      />

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-7xl max-h-[80vh] flex flex-col md:min-w-3xl lg:min-w-5xl xl:min-w-7xl">
          <DialogHeader>
            <DialogTitle>MCP Configuration Preview</DialogTitle>
            <DialogDescription>
              Select your editor/AI tool and copy the configuration
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <EditorCodeBlock
              configs={generateConfigsForAllEditors()}
              selectedEditor={selectedEditor}
              setSelectedEditor={setSelectedEditor}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
