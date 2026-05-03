"use client";

import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";
import { Moon, Sun, PanelLeft } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function Header() {
  const { toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border/70 bg-background/82 px-4 backdrop-blur-xl lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <PanelLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        className="rounded-xl"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

    </header>
  );
}
