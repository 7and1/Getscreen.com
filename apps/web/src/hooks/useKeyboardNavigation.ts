import { useEffect } from "react";

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onEscape,
  onEnter,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && onEscape) {
        onEscape();
      }
      if (event.key === "Enter" && onEnter) {
        onEnter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape, onEnter, enabled]);
}
