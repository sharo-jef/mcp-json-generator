export type EditorTool =
  | "vscode"
  | "cursor"
  | "windsurf"
  | "zed"
  | "claude-desktop"
  | "cline";

export type MCPServerStatus = "stable" | "beta" | "experimental";

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  repository?: string;
  config: any;
  category: string;
  tags: string[];
}

export interface EditorConfig {
  tool: EditorTool;
  configFormat: "json" | "json5";
  displayName: string;
  icon?: string;
  status: "online" | "offline" | "maintenance" | "degraded";
  statusText: string;
  prop: string;
  fileName: string;
}
