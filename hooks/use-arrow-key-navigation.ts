import { useEffect } from "react";

export function useArrowKeyNavigation({
  onUp,
  onDown,
  onLeft,
  onRight,
  containerRef,
  enabled = true,
  preventDefault = true
}: {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  containerRef?: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
  preventDefault?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    const arrowKeys = {
      ArrowUp: onUp,
      ArrowDown: onDown,
      ArrowLeft: onLeft,
      ArrowRight: onRight
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;

      if (
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.hasAttribute("contenteditable") ||
        (containerRef && !containerRef.current?.contains(active))
      )
        return;

      const handler = arrowKeys[e.key as keyof typeof arrowKeys];
      if (handler) {
        if (preventDefault) e.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUp, onDown, onLeft, onRight, containerRef, enabled, preventDefault]);
}
