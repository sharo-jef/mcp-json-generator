"use client";

import { Download, Settings, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
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

export default function Home() {
  const [bannerVisible, setBannerVisible] = useState(false); // Set to true to show banner
  const [commandOpen, setCommandOpen] = useState(false);
  const { setTheme } = useTheme();

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
      <main className="container mx-auto px-4 py-8 max-w-screen-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">MCP JSON Generator</h1>
          <p className="text-lg text-muted-foreground">
            Select MCP servers from the list below to generate configuration
            JSON for your editor or AI tool.
          </p>
        </div>

        {/* MCP Server Table */}
        <MCPServerTable />
      </main>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                // TODO: Implement export functionality
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>Export Configuration</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                setBannerVisible(!bannerVisible);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Toggle Banner</span>
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
                  setCommandOpen(false);
                  // TODO: Filter by editor
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
