"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Copy,
  ExternalLink,
  Eye,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { CustomMCPDialog } from "@/components/custom-mcp-dialog";
import { DataTable } from "@/components/data-table";
import { EditorCodeBlock } from "@/components/editor-code-block";
import { Badge } from "@/components/ui/badge";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { editorConfigs, mcpServers } from "@/data/mcp-servers";
import { useCustomMCPServers } from "@/hooks/use-custom-mcp-servers";
import type { EditorConfig, EditorTool, MCPServer } from "@/types/mcp";

export interface MCPServerTableRef {
  copyToClipboard: () => void;
}

export const MCPServerTable = forwardRef<
  MCPServerTableRef,
  {
    previewOpen?: boolean;
    setPreviewOpen?: (open: boolean) => void;
    selectedEditor?: EditorTool;
    setSelectedEditor?: (editor: EditorTool) => void;
  }
>(function MCPServerTable(
  {
    previewOpen: externalPreviewOpen,
    setPreviewOpen: externalSetPreviewOpen,
    selectedEditor: externalSelectedEditor,
    setSelectedEditor: externalSetSelectedEditor,
  },
  ref,
) {
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [internalPreviewOpen, setInternalPreviewOpen] = useState(false);
  const [internalSelectedEditor, setInternalSelectedEditor] =
    useState<EditorTool>("vscode");
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<MCPServer | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { customServers, deleteCustomServer, isLoaded } = useCustomMCPServers();

  // Use external state if provided, otherwise use internal state
  const previewOpen = externalPreviewOpen ?? internalPreviewOpen;
  const setPreviewOpen = externalSetPreviewOpen ?? setInternalPreviewOpen;
  const selectedEditor = externalSelectedEditor ?? internalSelectedEditor;
  const setSelectedEditor =
    externalSetSelectedEditor ?? setInternalSelectedEditor;

  // Prevent hydration mismatch by mounting on client only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Merge preset and custom servers
  const allServers = useMemo(() => {
    // Prevent hydration mismatch by not including custom servers until loaded
    if (!isLoaded) {
      return mcpServers;
    }
    const merged = [...mcpServers, ...customServers];
    return merged;
  }, [customServers, isLoaded]);

  const getSelectedServers = (): MCPServer[] => {
    return allServers.filter((_, index) => selectedRows[index]);
  };

  const generateMCPConfig = (editorConfig: EditorConfig): string => {
    const selected = getSelectedServers();
    const config: Record<string, unknown> = {};

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
    if (getSelectedServers().length === 0) {
      toast.error("Please select servers in the table first");
      return;
    }
    const config = generateMCPConfig(editorConfig);
    await navigator.clipboard.writeText(config);
    toast.success("Configuration copied to clipboard!");
  };

  // Expose copyToClipboard method to parent via ref
  useImperativeHandle(ref, () => ({
    copyToClipboard,
  }));

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
      cell: ({ row }) => {
        const isCustom = customServers.some((s) => s.id === row.original.id);
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue("name")}</span>
            {isCustom && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
        );
      },
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
      id: "repository",
      enableHiding: false,
      cell: ({ row }) => {
        const server = row.original;
        if (!server.repository) {
          return null;
        }
        return (
          <a
            href={server.repository}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const server = row.original;
        const isCustom = customServers.some((s) => s.id === server.id);

        if (!isCustom) {
          return null;
        }

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingServer(server);
                setCustomDialogOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm(`"${server.name}" を削除しますか？`)) {
                  deleteCustomServer(server.id);
                  toast.success("カスタム MCP サーバーを削除しました");
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Prevent hydration mismatch - don't render until mounted
  if (!isMounted) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={allServers}
        searchKey="name"
        searchPlaceholder="Search MCP servers..."
        rowSelection={selectedRows}
        onRowSelectionChange={setSelectedRows}
        toolbarActions={
          <TooltipProvider>
            <div className="flex gap-2 items-center">
              <Select
                value={selectedEditor}
                onValueChange={(value) =>
                  setSelectedEditor(value as EditorTool)
                }
              >
                <SelectTrigger className="w-37">
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

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCustomDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>カスタム MCP 追加</p>
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

      <CustomMCPDialog
        open={customDialogOpen}
        onOpenChange={(open) => {
          setCustomDialogOpen(open);
          if (!open) {
            setEditingServer(null);
          }
        }}
        editingServer={editingServer}
      />
    </>
  );
});
