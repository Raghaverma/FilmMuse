"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or default to dark
    const stored = localStorage.getItem("filmMuse_theme") as Theme | null;
    const initialTheme = (stored && ["light", "dark", "system"].includes(stored)) ? stored : "dark";
    
    // The script in layout.tsx already set the initial class, so we sync with it
    const root = document.documentElement;
    const currentClass = root.classList.contains("light") ? "light" : "dark";
    
    let resolved: "light" | "dark" = currentClass as "light" | "dark";
    
    // Recalculate if needed (in case script didn't run or theme changed)
    if (initialTheme === "system") {
      const systemQuery = window.matchMedia("(prefers-color-scheme: light)");
      resolved = systemQuery.matches ? "light" : "dark";
      if (currentClass !== resolved) {
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
      }
    } else {
      resolved = initialTheme;
      if (currentClass !== resolved) {
        root.classList.remove("light", "dark");
        root.classList.add(resolved);
      }
    }
    
    setTheme(initialTheme);
    setResolvedTheme(resolved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    let resolved: "light" | "dark" = "dark";

    if (theme === "system") {
      const systemQuery = window.matchMedia("(prefers-color-scheme: light)");
      resolved = systemQuery.matches ? "light" : "dark";
    } else {
      resolved = theme;
    }

    setResolvedTheme(resolved);

    // Remove all theme classes first
    root.classList.remove("light", "dark");
    // Add the resolved theme class
    root.classList.add(resolved);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = () => {
      const resolved = mediaQuery.matches ? "light" : "dark";
      setResolvedTheme(resolved);
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    };

    // Use modern addEventListener with proper typing
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, mounted]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("filmMuse_theme", newTheme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme: handleSetTheme, resolvedTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

