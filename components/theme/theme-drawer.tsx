"use client";

import { PaletteSelector } from "@/components/theme/palette-selector";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function ThemeDrawer({
  trigger,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Drawer direction="right" open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="w-[300px] p-0 sm:w-[350px]" showOverlay={false}>
        <DrawerHeader className="border-b p-4">
          <DrawerTitle className="text-left">Theme</DrawerTitle>
        </DrawerHeader>
        <DrawerDescription className="sr-only">
          Choose a theme that suits your style.
        </DrawerDescription>
        <PaletteSelector />
      </DrawerContent>
    </Drawer>
  );
}
