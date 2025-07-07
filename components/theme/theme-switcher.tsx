"use client";

import { ThemeDrawer } from "@/components/theme/theme-drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";
import { Laptop, LoaderCircle, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { paletteName, setPaletteName } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function getThemeIcon() {
    switch (paletteName) {
      case "light":
        return <Sun className="size-4" />;
      case "dark":
        return <Moon className="size-4" />;
      case "system":
        return <Laptop className="size-4" />;
      default:
        return <Palette className="size-4" />;
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Button variant="ghost" size="sm">
            {mounted ? getThemeIcon() : <LoaderCircle className="size-4 animate-spin" />}
            <span className="sr-only">Switch theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-content" align="start">
          <DropdownMenuRadioGroup
            value={["light", "dark", "system"].includes(paletteName) ? paletteName : "custom"}
            onValueChange={(value) => {
              if (value === "custom") setIsDrawerOpen(true);
              else setPaletteName(value);
            }}
          >
            <DropdownMenuRadioItem className="flex cursor-pointer gap-2" value="light">
              <Sun className="size-4" />
              <span>Light</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="flex cursor-pointer gap-2" value="dark">
              <Moon className="size-4" />
              <span>Dark</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="flex cursor-pointer gap-2" value="system">
              <Laptop className="size-4" />
              <span>System</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem className="flex cursor-pointer gap-2" value="custom">
              <Palette className="size-4" />
              <span>Custom</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ThemeDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </>
  );
}
