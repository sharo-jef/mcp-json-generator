"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import type { MCPServer } from "@/types/mcp";

const STORAGE_KEY = "custom-mcp-servers";

interface CustomMCPContextType {
  customServers: MCPServer[];
  addCustomServer: (server: MCPServer) => void;
  updateCustomServer: (id: string, server: MCPServer) => void;
  deleteCustomServer: (id: string) => void;
  isLoaded: boolean;
}

const CustomMCPContext = createContext<CustomMCPContextType | null>(null);

export function CustomMCPProvider({ children }: { children: ReactNode }) {
  const [customServers, setCustomServers] = useState<MCPServer[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomServers(parsed);
      } catch (error) {
        console.error("Failed to parse custom MCP servers:", error);
      }
    }
    setIsLoaded(true);
  }, [isMounted]);

  const addCustomServer = (server: MCPServer) => {
    const newServers = [...customServers, server];
    setCustomServers(newServers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newServers));
  };

  const updateCustomServer = (id: string, server: MCPServer) => {
    const newServers = customServers.map((s) => (s.id === id ? server : s));
    setCustomServers(newServers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newServers));
  };

  const deleteCustomServer = (id: string) => {
    const newServers = customServers.filter((s) => s.id !== id);
    setCustomServers(newServers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newServers));
  };

  return (
    <CustomMCPContext.Provider
      value={{
        customServers,
        addCustomServer,
        updateCustomServer,
        deleteCustomServer,
        isLoaded,
      }}
    >
      {children}
    </CustomMCPContext.Provider>
  );
}

export function useCustomMCPServers() {
  const context = useContext(CustomMCPContext);
  if (!context) {
    throw new Error(
      "useCustomMCPServers must be used within CustomMCPProvider",
    );
  }
  return context;
}
