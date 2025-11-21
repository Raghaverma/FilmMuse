"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ThemeSwitcher({ className, inline }: { className?: string; inline?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  if (inline) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors ${className || ""}`}
          aria-label="Change theme"
        >
          {resolvedTheme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="text-sm text-neutral-300">
            {theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"}
          </span>
        </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-popover text-popover-foreground border-border dark:bg-[#0b0b0d] dark:text-neutral-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <button
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                theme === "light"
                  ? "bg-emerald-400/20 border border-emerald-400/30"
                  : "hover:bg-white/10 border border-transparent"
              }`}
            >
              <Sun className="h-5 w-5" />
              <div>
                <div className="font-medium">Light</div>
                <div className="text-xs text-neutral-400">Light mode</div>
              </div>
            </button>
            <button
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                theme === "dark"
                  ? "bg-emerald-400/20 border border-emerald-400/30"
                  : "hover:bg-white/10 border border-transparent"
              }`}
            >
              <Moon className="h-5 w-5" />
              <div>
                <div className="font-medium">Dark</div>
                <div className="text-xs text-neutral-400">Dark mode</div>
              </div>
            </button>
            <button
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                theme === "system"
                  ? "bg-emerald-400/20 border border-emerald-400/30"
                  : "hover:bg-white/10 border border-transparent"
              }`}
            >
              <Monitor className="h-5 w-5" />
              <div>
                <div className="font-medium">System</div>
                <div className="text-xs text-neutral-400">Follow system preference</div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={className}
        aria-label="Change theme"
      >
        {resolvedTheme === "light" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-popover text-popover-foreground border-border dark:bg-[#0b0b0d] dark:text-neutral-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <button
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                theme === "light"
                  ? "bg-emerald-400/20 border border-emerald-400/30"
                  : "hover:bg-white/10 border border-transparent"
              }`}
            >
              <Sun className="h-5 w-5" />
              <div>
                <div className="font-medium">Light</div>
                <div className="text-xs text-neutral-400">Light mode</div>
              </div>
            </button>
            <button
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                theme === "dark"
                  ? "bg-emerald-400/20 border border-emerald-400/30"
                  : "hover:bg-white/10 border border-transparent"
              }`}
            >
              <Moon className="h-5 w-5" />
              <div>
                <div className="font-medium">Dark</div>
                <div className="text-xs text-neutral-400">Dark mode</div>
              </div>
            </button>
            <button
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                theme === "system"
                  ? "bg-emerald-400/20 border border-emerald-400/30"
                  : "hover:bg-white/10 border border-transparent"
              }`}
            >
              <Monitor className="h-5 w-5" />
              <div>
                <div className="font-medium">System</div>
                <div className="text-xs text-neutral-400">Follow system preference</div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

