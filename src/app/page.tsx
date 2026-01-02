"use client";

import { Copy, Download, Eye, Settings, Sparkles, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MCPServerTable } from "@/components/mcp-server-table";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Banner,
  BannerActions,
  BannerClose,
  BannerDescription,
  BannerTitle,
} from "@/components/ui/shadcn-io/banner";
import { Navbar06 } from "@/components/ui/shadcn-io/navbar-06";
import { editorConfigs } from "@/data/mcp-servers";
import { useCustomMCPServers } from "@/hooks/use-custom-mcp-servers";
import type { EditorTool, MCPServer } from "@/types/mcp";

export default function Home() {
  const [bannerVisible, setBannerVisible] = useState(false); // Set to true to show banner
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<EditorTool>("vscode");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<{ copyToClipboard: () => void }>(null);
  const { setTheme } = useTheme();
  const { customServers, addCustomServer } = useCustomMCPServers();

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

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (e.key === "p" || e.key === "P")
      ) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleExportCustomServers = () => {
    if (customServers.length === 0) {
      toast.error("No custom MCP servers to export");
      return;
    }

    const dataStr = JSON.stringify(customServers, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mcp-custom-servers-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Custom MCP servers exported successfully!");
    setCommandOpen(false);
  };

  const handleImportCustomServers = () => {
    fileInputRef.current?.click();
    setCommandOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as
          | MCPServer[]
          | MCPServer;
        const servers = Array.isArray(imported) ? imported : [imported];

        let importedCount = 0;
        let skippedCount = 0;

        for (const server of servers) {
          // Check if server already exists
          const exists = customServers.some((s) => s.id === server.id);
          if (exists) {
            skippedCount++;
            continue;
          }

          // Validate required fields
          if (!server.id || !server.name || !server.config) {
            toast.error(`Invalid server data: ${server.name || "Unknown"}`);
            continue;
          }

          addCustomServer(server);
          importedCount++;
        }

        if (importedCount > 0) {
          toast.success(
            `Imported ${importedCount} server(s)${skippedCount > 0 ? `, skipped ${skippedCount} duplicate(s)` : ""}`,
          );
        } else if (skippedCount > 0) {
          toast.info(`All ${skippedCount} server(s) already exist`);
        }
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import: Invalid JSON file");
      }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = "";
  };

  const handleTogglePreview = () => {
    setPreviewOpen((prev) => !prev);
    setCommandOpen(false);
  };

  const handleCopyConfig = useCallback(async () => {
    if (tableRef.current) {
      tableRef.current.copyToClipboard();
    }
    setCommandOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      {bannerVisible && (
        <Banner visible={bannerVisible} onClose={() => setBannerVisible(false)}>
          <Sparkles className="h-4 w-4" />
          <div className="flex-1">
            <BannerTitle>New MCP Servers Available!</BannerTitle>
            <BannerDescription>
              Check out the latest Model Context Protocol servers for enhanced
              AI capabilities.
            </BannerDescription>
          </div>
          <BannerActions>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/modelcontextprotocol/servers"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </Button>
          </BannerActions>
          <BannerClose />
        </Banner>
      )}

      {/* Navbar */}
      <Navbar06
        logoHref="/"
        navigationLinks={[]}
        languages={[]}
        showUserMenu={false}
        showSupportedTools={true}
        supportedTools={editorConfigs}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 max-w-screen-2xl">
        {/* MCP Server Table */}
        <MCPServerTable
          ref={tableRef}
          previewOpen={previewOpen}
          setPreviewOpen={setPreviewOpen}
          selectedEditor={selectedEditor}
          setSelectedEditor={setSelectedEditor}
        />
      </main>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={handleTogglePreview}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Toggle Preview</span>
            </CommandItem>
            <CommandItem onSelect={handleCopyConfig}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Configuration</span>
            </CommandItem>
            <CommandItem onSelect={handleExportCustomServers}>
              <Download className="mr-2 h-4 w-4" />
              <span>Export Custom MCP Servers</span>
            </CommandItem>
            <CommandItem onSelect={handleImportCustomServers}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Import Custom MCP Servers</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem
              onSelect={() => {
                setTheme("light");
                setCommandOpen(false);
              }}
            >
              <span>Light</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme("dark");
                setCommandOpen(false);
              }}
            >
              <span>Dark</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setTheme("system");
                setCommandOpen(false);
              }}
            >
              <span>System</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Editors">
            {editorConfigs.map((config) => (
              <CommandItem
                key={config.tool}
                onSelect={() => {
                  setSelectedEditor(config.tool);
                  setCommandOpen(false);
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>{config.displayName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
