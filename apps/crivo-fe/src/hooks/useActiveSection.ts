"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section is currently active based on scroll position.
 * The active section is the last one whose top edge has passed the
 * header offset — matching the classic "scroll-spy" pattern.
 */
export function useActiveSection(ids: string[], offset = 80): string {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (ids.length === 0) return;

    const detect = () => {
      let current = ids[0]; // default to first section

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }

      setActiveId(current);
    };

    detect();
    window.addEventListener("scroll", detect, { passive: true });
    return () => window.removeEventListener("scroll", detect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(","), offset]);

  return activeId;
}
