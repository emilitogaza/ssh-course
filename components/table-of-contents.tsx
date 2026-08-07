"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/content";
import { cn } from "@/lib/utils";

// Right-hand "On this page" rail. Highlights the section currently in view
// using an IntersectionObserver, mirroring the Next.js docs behaviour.
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      // Trigger as a heading passes the upper third of the viewport.
      { rootMargin: "0px 0px -70% 0px", threshold: 1 }
    );

    for (const { id } of headings) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col gap-2 text-sm">
      <p className="mb-1 pl-2 text-xs font-semibold uppercase text-ink/50">
        On this page
      </p>
      <ul className="flex flex-col gap-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block rounded-2 py-1 pr-2 leading-snug transition-colors",
                heading.level === 3 ? "pl-5" : "pl-2",
                activeId === heading.id
                  ? "bg-brand/10 text-brand-ink"
                  : "text-ink/60 hover:text-ink"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
