import HeaderAuth from "@/components/navbar/header-auth";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Image } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";

export const Navbar: FC = () => {
  return (
    <nav className="border-b-foreground/10 bg-background sticky top-0 left-0 z-50 flex h-16 w-full justify-center border-b">
      <div className="container flex w-full items-center justify-between px-8 py-3 text-sm">
        <div className="flex items-center gap-5 font-semibold">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image className="size-6" />
            <span className="font-mono">pixxor</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <HeaderAuth />
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
};
