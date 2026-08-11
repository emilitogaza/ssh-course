"use client";

import { Sparkle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// A slow conveyor belt of chapter titles for the landing page.
//
// The strip scrolls at a constant *pixel* speed no matter how much content it
// holds: the `marquee-x` keyframes always travel -50% of the strip, so a fixed
// duration would sweep thirty long titles past the viewer in the same time as
// four short ones. Instead the duration is derived from the measured width of
// one copy of the content.
const PX_PER_SECOND = 40;
const MIN_DURATION_S = 20;

// The strip must be wider than any viewport to loop seamlessly, so the titles
// repeat until there are comfortably enough of them.
const MIN_ITEMS = 12;

// Server-side width guess so the SSR markup already animates at roughly the
// right speed; swapped for the real measurement after mount.
function estimateWidth(items: string[]): number {
  return items.reduce((total, title) => total + title.length * 9 + 76, 0);
}

export function Marquee({ items }: { items: string[] }) {
  const repeats = Math.max(2, Math.ceil(MIN_ITEMS / items.length));
  const all = Array.from({ length: repeats }, () => items).flat();

  const copyRef = useRef<HTMLUListElement>(null);
  const [duration, setDuration] = useState(() =>
    Math.max(MIN_DURATION_S, estimateWidth(all) / PX_PER_SECOND)
  );

  // Measure one copy of the strip and keep the measurement fresh across font
  // loads and viewport-driven reflows.
  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;
    const update = () =>
      setDuration(Math.max(MIN_DURATION_S, el.scrollWidth / PX_PER_SECOND));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative border-y border-border/60 py-4">
      <div
        className="flex w-max motion-reduce:[animation-play-state:paused]"
        style={{ animation: `marquee-x ${duration}s linear infinite` }}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            ref={copy === 0 ? copyRef : undefined}
            aria-hidden={copy === 1 || undefined}
            className="flex shrink-0 items-center"
          >
            {all.map((title, i) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: static repeated list
                key={`${title}-${i}`}
                className="flex items-center whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-ink/40"
              >
                <Sparkle className="mx-6 icon-3.5 text-brand/60" />
                {title}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
