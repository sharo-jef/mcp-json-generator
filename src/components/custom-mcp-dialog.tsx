"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomMCPServers } from "@/hooks/use-custom-mcp-servers";
import type { MCPConfig, MCPServer } from "@/types/mcp";

const CATEGORIES = [
  "Remote",
  "Testing",
  "Web",
  "UI",
  "Development",
  "Gaming",
  "3D Modeling",
  "Database",
  "AI/ML",
  "Other",
];

type ConfigType = "npx" | "uvx" | "http" | "custom";

export function CustomMCPDialog({
  open,
  onOpenChange,
  editingServer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingServer?: MCPServer | null;
}) {
  const { customServers, addCustomServer, updateCustomServer } =
    useCustomMCPServers();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    repository: "",
    category: "Other",
    tags: [] as string[],
    configType: "npx" as ConfigType,
    command: "",
    args: [] as string[],
    url: "",
    customConfig: "",
  });
  const [currentArg, setCurrentArg] = useState("");
  const [currentTag, setCurrentTag] = useState("");

  // Auto-set command when configType changes
  useEffect(() => {
    if (formData.configType === "npx" && formData.command !== "npx") {
      setFormData((prev) => ({ ...prev, command: "npx" }));
    } else if (formData.configType === "uvx" && formData.command !== "uvx") {
      setFormData((prev) => ({ ...prev, command: "uvx" }));
    }
  }, [formData.configType, formData.command]);

  const resetForm = useCallback(() => {
    setFormData({
      id: "",
      name: "",
      description: "",
      repository: "",
      category: "Other",
      tags: [],
      configType: "npx",
      command: "",
      args: [],
      url: "",
      customConfig: "",
    });
    setCurrentArg("");
    setCurrentTag("");
  }, []);

  // Load editing server data when dialog opens
  useEffect(() => {
    if (open && editingServer) {
      const config = editingServer.config;
      let configType: ConfigType = "custom";
      let command = "";
      let args: string[] = [];
      let url = "";
      let customConfig = "";

      if ("url" in config && config.type === "http") {
        configType = "http";
        url = config.url || "";
      } else if ("command" in config && config.command) {
        if (config.command === "npx") {
          configType = "npx";
        } else if (config.command === "uvx") {
          configType = "uvx";
        } else {
          configType = "custom";
          customConfig = JSON.stringify(config, null, 2);
        }
        command = config.command;
        args = config.args || [];
      } else {
        customConfig = JSON.stringify(config, null, 2);
      }

      setFormData({
        id: editingServer.id,
        name: editingServer.name,
        description: editingServer.description,
        repository: editingServer.repository || "",
        category: editingServer.category,
        tags: editingServer.tags || [],
        configType,
        command,
        args,
        url,
        customConfig,
      });
    } else if (open && !editingServer) {
      resetForm();
    }
  }, [open, editingServer, resetForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.description) {
      toast.error("ID、Name、Description は必須項目です");
      return;
    }

    // Check if ID already exists (only when creating new)
    if (!editingServer && customServers.some((s) => s.id === formData.id)) {
      toast.error("この ID は既に使用されています");
      return;
    }

    let config: MCPConfig;

    if (formData.configType === "http") {
      if (!formData.url) {
        toast.error("URL を入力してください");
        return;
      }
      config = {
        type: "http",
        url: formData.url,
      };
    } else if (formData.configType === "custom") {
      try {
        config = JSON.parse(formData.customConfig);
      } catch (error) {
        toast.error(`カスタム設定の JSON が不正です: ${error}`);
        return;
      }
    } else {
      // npx or uvx
      if (!formData.command) {
        toast.error("コマンドを入力してください");
        return;
      }
      config = {
        command: formData.command,
        args: formData.args,
      };
    }

    const newServer: MCPServer = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      repository: formData.repository || undefined,
      config,
      category: formData.category,
      tags: formData.tags,
    };

    if (editingServer) {
      updateCustomServer(editingServer.id, newServer);
      toast.success("カスタム MCP サーバーを更新しました");
    } else {
      addCustomServer(newServer);
      toast.success("カスタム MCP サーバーを追加しました");
    }
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingServer
              ? "カスタム MCP サーバーの編集"
              : "カスタム MCP サーバーの追加"}
          </DialogTitle>
          <DialogDescription>
            独自の MCP サーバーを{editingServer ? "編集" : "追加"}
            できます。設定はブラウザに保存されます。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">
                ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                placeholder="my-custom-server"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Custom Server"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="サーバーの説明"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="repository">Repository (Optional)</Label>
              <Input
                id="repository"
                value={formData.repository}
                onChange={(e) =>
                  setFormData({ ...formData, repository: e.target.value })
                }
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (currentTag.trim()) {
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, currentTag.trim()],
                        });
                        setCurrentTag("");
                      }
                    }
                  }}
                  placeholder="タグを入力して Enter"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (currentTag.trim()) {
                      setFormData({
                        ...formData,
                        tags: [...formData.tags, currentTag.trim()],
                      });
                      setCurrentTag("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={`tag-${tag}-${index}-${formData.tags.length}`}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((_, i) => i !== index),
                          });
                        }}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                例: cli, npm, utility
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="configType">設定タイプ</Label>
            <Select
              value={formData.configType}
              onValueChange={(value: ConfigType) =>
                setFormData({ ...formData, configType: value })
              }
            >
              <SelectTrigger id="configType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="npx">npx</SelectItem>
                <SelectItem value="uvx">uvx</SelectItem>
                <SelectItem value="http">HTTP</SelectItem>
                <SelectItem value="custom">カスタム JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.configType === "http" ? (
            <div className="space-y-2">
              <Label htmlFor="url">
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://api.example.com/mcp/"
              />
            </div>
          ) : formData.configType === "custom" ? (
            <div className="space-y-2">
              <Label htmlFor="customConfig">
                カスタム設定 JSON <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="customConfig"
                value={formData.customConfig}
                onChange={(e) =>
                  setFormData({ ...formData, customConfig: e.target.value })
                }
                placeholder='{"key": "value"}'
                className="font-mono"
                rows={5}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="command">Command</Label>
                <Input
                  id="command"
                  value={formData.command}
                  onChange={(e) =>
                    setFormData({ ...formData, command: e.target.value })
                  }
                  placeholder={formData.configType === "npx" ? "npx" : "uvx"}
                  readOnly={
                    formData.configType === "npx" ||
                    formData.configType === "uvx"
                  }
                  className={
                    formData.configType === "npx" ||
                    formData.configType === "uvx"
                      ? "bg-muted"
                      : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="args">Arguments</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="args"
                      value={currentArg}
                      onChange={(e) => setCurrentArg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (currentArg.trim()) {
                            setFormData({
                              ...formData,
                              args: [...formData.args, currentArg.trim()],
                            });
                            setCurrentArg("");
                          }
                        }
                      }}
                      placeholder="引数を入力して Enter"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (currentArg.trim()) {
                          setFormData({
                            ...formData,
                            args: [...formData.args, currentArg.trim()],
                          });
                          setCurrentArg("");
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.args.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.args.map((arg, index) => (
                        <div
                          key={`arg-${arg}-${index}-${formData.args.length}`}
                          className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          <span className="font-mono">{arg}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                args: formData.args.filter(
                                  (_, i) => i !== index,
                                ),
                              });
                            }}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    例: -y, @my/package@latest
                  </p>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              {editingServer ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
