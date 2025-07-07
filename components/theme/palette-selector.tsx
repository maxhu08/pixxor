"use client";

import { Input, InputField, InputIcon } from "@/components/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/contexts/theme-context";
import { useArrowKeyNavigation } from "@/hooks/use-arrow-key-navigation";
import { Palette, palettes } from "@/lib/theme-palettes";
import { cn } from "@/lib/utils";
import { parse } from "culori";
import { ArrowDownUp, ArrowUpDown, Search, Star, StarHalf } from "lucide-react";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

export function PaletteInput() {
  const { query, setQuery } = usePaletteSelectorContext();
  const { sortPalettesBy, setSortPalettesBy, sortPalettesAscending, setSortPalettesAscending } =
    useTheme();

  return (
    <Input className="text-muted-foreground m-4 flex h-10 items-center">
      <InputIcon>
        <Search />
      </InputIcon>
      <InputField
        type="search"
        placeholder="Search palettes..."
        className="h-full w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex items-center gap-1 px-1 pl-3">
        <Separator orientation="vertical" className="bg-muted-foreground min-h-5" />
        <Select value={sortPalettesBy} onValueChange={setSortPalettesBy}>
          <Button variant="ghost" className="cursor-pointer" asChild>
            <SelectTrigger className="max-h-8 border-0 text-xs shadow-none dark:bg-transparent">
              <SelectValue />
            </SelectTrigger>
          </Button>
          <SelectContent>
            <SelectItem value="name" className="cursor-pointer">
              Name
            </SelectItem>
            <SelectItem value="lightness" className="cursor-pointer">
              Lightness
            </SelectItem>
            <SelectItem value="chroma" className="cursor-pointer">
              Chroma
            </SelectItem>
            <SelectItem value="hue" className="cursor-pointer">
              Hue
            </SelectItem>
          </SelectContent>
        </Select>
        <Separator orientation="vertical" className="bg-muted-foreground min-h-5" />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 cursor-pointer"
          onClick={() => setSortPalettesAscending(!sortPalettesAscending)}
        >
          {sortPalettesAscending ? (
            <ArrowUpDown className="size-4" />
          ) : (
            <ArrowDownUp className="size-4" />
          )}
        </Button>
      </div>
    </Input>
  );
}

function formatPaletteName(name: string) {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function PaletteGrid({ palettes }: { palettes: Palette[] }) {
  const { paletteName, setPaletteName, favoritePalettes, setFavoritePalette } = useTheme();

  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);

  const numCols = 2;

  const gridRef = useRef<HTMLDivElement>(null);
  const paletteRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [focusedIndex, _setFocusedIndex] = useState(0);

  const setFocusedIndex = (next: number | ((prev: number) => number)) => {
    _setFocusedIndex((prev) => {
      const value = typeof next === "function" ? (next as (n: number) => number)(prev) : next;
      return value >= 0 && value < palettes.length ? value : prev;
    });
  };

  const skipScrollRef = useRef(false);

  useEffect(() => {
    const el = paletteRefs.current[focusedIndex];
    if (!el) return;

    if (skipScrollRef.current) {
      skipScrollRef.current = false;
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    el.focus({ preventScroll: true });
  }, [focusedIndex]);

  useArrowKeyNavigation({
    containerRef: gridRef,
    onUp: () => setFocusedIndex((i) => i - numCols),
    onDown: () => setFocusedIndex((i) => i + numCols),
    onLeft: () => setFocusedIndex((i) => i - 1),
    onRight: () => setFocusedIndex((i) => i + 1)
  });

  const [isContainerFocused, setIsContainerFocused] = useState(false);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const onFocusIn = () => setIsContainerFocused(true);
    const onFocusOut = (e: FocusEvent) => {
      if (!grid.contains(e.relatedTarget as Node)) setIsContainerFocused(false);
    };

    grid.addEventListener("focusin", onFocusIn);
    grid.addEventListener("focusout", onFocusOut);

    return () => {
      grid.removeEventListener("focusin", onFocusIn);
      grid.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <div className="grid w-full grid-cols-2 gap-2 px-4" ref={gridRef}>
      {palettes.map(({ name, colors }, i) => {
        const isCurrent = paletteName === name;
        const isFocused = i === focusedIndex;
        const isFavorite = favoritePalettes?.includes(name);
        return (
          <div
            key={name}
            className="group relative flex items-center"
            style={{ color: colors["--color-primary"] }}
          >
            <Button
              ref={(el) => {
                paletteRefs.current[i] = el;
              }}
              type="button"
              className={cn("peer w-full cursor-pointer py-5 text-current", isCurrent && "ring-2")}
              style={{
                backgroundColor: colors["--color-background"],
                boxShadow:
                  !isCurrent && isContainerFocused && isFocused
                    ? `0 0 0 3px ${colors["--color-ring"].replace(")", " / 0.5)")}`
                    : undefined
              }}
              onClick={() => {
                setPaletteName(name);
                skipScrollRef.current = true;
                setFocusedIndex(i);
              }}
              tabIndex={isFocused ? 0 : -1}
            >
              <span className="truncate text-sm font-medium">{formatPaletteName(name)}</span>
            </Button>
            <div className="pointer-events-none absolute flex aspect-square min-h-full items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 peer-focus:opacity-100 focus-within:opacity-100">
              <button
                className="group/favorite pointer-events-auto flex cursor-pointer items-center"
                style={{
                  color: isFavoriteHovered ? colors["--color-accent-foreground"] : "inherit"
                }}
                onClick={() => setFavoritePalette(name, !isFavorite)}
                onMouseEnter={() => setIsFavoriteHovered(true)}
                onMouseLeave={() => setIsFavoriteHovered(false)}
                tabIndex={isFocused ? 0 : -1}
              >
                <Star className="size-4" />
                <StarHalf
                  className={cn(
                    "absolute size-4 fill-current opacity-0 transition-opacity group-hover/favorite:opacity-100",
                    isFavorite && "opacity-100"
                  )}
                />
                <Star
                  className={cn(
                    "absolute size-4 fill-current opacity-0 transition-opacity",
                    isFavorite && "opacity-100 group-hover/favorite:opacity-0"
                  )}
                />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const PaletteSelectorContext = createContext<{
  query: string;
  setQuery: (q: string) => void;
  filteredPalettes: Palette[];
} | null>(null);

export function usePaletteSelectorContext() {
  const ctx = useContext(PaletteSelectorContext);
  if (!ctx)
    throw new Error(
      "usePaletteSelectorContext must be used within PaletteSelectorContext.Provider"
    );
  return ctx;
}

export function PaletteSelector({ children }: { children?: ReactNode }) {
  const [query, setQuery] = useState("");
  const { favoritePalettes, sortPalettesBy, sortPalettesAscending } = useTheme();
  const [filteredPalettes, setFilteredPalettes] = useState<Palette[]>(palettes);

  function getOKLCH(colorStr: string) {
    const parsed = parse(colorStr);
    if (!parsed || parsed.mode !== "oklch") return { l: 0, c: 0, h: 0 };
    return {
      l: parsed.l,
      c: parsed.c,
      h: parsed.h ?? 0
    };
  }

  useEffect(() => {
    const q = query.trim();
    const result = q ? palettes.filter((p) => p.name.toLowerCase().includes(q)) : [...palettes];

    result.sort((a, b) => {
      const aColor = getOKLCH(a.colors["--color-background"]);
      const bColor = getOKLCH(b.colors["--color-background"]);

      let comparison = 0;
      switch (sortPalettesBy) {
        case "lightness":
          comparison = aColor.l - bColor.l;
          break;
        case "chroma":
          comparison = aColor.c - bColor.c;
          break;
        case "hue":
          comparison = aColor.h - bColor.h;
          break;
        case "name":
        default:
          comparison = a.name.localeCompare(b.name);
      }

      if (comparison === 0) {
        return a.name.localeCompare(b.name);
      }

      return sortPalettesAscending ? comparison : -comparison;
    });

    setFilteredPalettes(result);
  }, [query, sortPalettesAscending, sortPalettesBy]);

  const favoriteFiltered = favoritePalettes
    ? filteredPalettes.filter((p) => favoritePalettes.includes(p.name))
    : [];
  const nonFavoriteFiltered = favoritePalettes
    ? filteredPalettes.filter((p) => !favoritePalettes.includes(p.name))
    : filteredPalettes;

  return (
    <PaletteSelectorContext.Provider
      value={{
        query,
        setQuery,
        filteredPalettes
      }}
    >
      {children ? (
        children
      ) : (
        <div className="flex min-h-0 w-full flex-1 flex-col items-center">
          <PaletteInput />
          <ScrollArea className="min-h-0 w-full flex-1">
            <div className="flex w-full flex-col items-center gap-4 pt-1 pb-4">
              {filteredPalettes.length ? (
                <>
                  {favoriteFiltered.length > 0 && <PaletteGrid palettes={favoriteFiltered} />}
                  {favoriteFiltered.length > 0 && nonFavoriteFiltered.length > 0 && (
                    <div className="w-full px-4">
                      <Separator className="border" />
                    </div>
                  )}
                  {nonFavoriteFiltered.length > 0 && <PaletteGrid palettes={nonFavoriteFiltered} />}
                </>
              ) : (
                <div className="mt-6 w-full px-4">
                  <p className="text-muted-foreground text-center">
                    No palettes found matching{" "}
                    <span className="inline-block max-w-72 overflow-hidden align-bottom text-ellipsis whitespace-nowrap">
                      "{query}
                    </span>
                    "
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </PaletteSelectorContext.Provider>
  );
}
