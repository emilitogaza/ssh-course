"use client";

import { ChevronUp, SquareTerminal, X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CourseSidebar } from "@/components/course-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ChapterSection } from "@/lib/content";
import { cn } from "@/lib/utils";

// Navigation remounts this tray (the layout subtree is rebuilt per route), so
// component state can't carry the progress value across chapters. We stash the
// last rendered fraction at module scope — which survives the remount — and use
// it as the progress strip's `initial`, letting it glide from the previous
// chapter's mark to the new one instead of snapping. `null` = never rendered yet.
let lastProgress: number | null = null;

// Fixed bottom tray, shown only below the `lg` breakpoint. The collapsed bar
// stays docked to the bottom of the viewport while reading; tapping it expands
// the chapter list upwards out of the same tray. The desktop rail (see the
// layout) stays permanently visible instead.
export function MobileNav({ sections }: { sections: ChapterSection[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  // Captured once per mount, before the effect below advances the module value.
  const prevProgress = useRef(lastProgress);

  const chapters = useMemo(() => sections.flatMap((s) => s.chapters), [sections]);
  const index = chapters.findIndex((c) => `/${c.slug}` === pathname);
  const current = index === -1 ? null : chapters[index];
  const progress = index === -1 ? 0 : ((index + 1) / chapters.length) * 100;

  // The progress strip is a plain CSS transform transition rather than a Motion
  // animation: navigation remounts this whole tray, and a compositor-driven CSS
  // transition glides reliably across that remount (and through the main-thread
  // work a route change causes), where Motion's mount animation does not. We
  // render at the *previous* chapter's fraction, then flip to the current one on
  // the next frame so the browser tweens between them.
  const [barFraction, setBarFraction] = useState(() =>
    prevProgress.current === null ? progress / 100 : prevProgress.current / 100
  );
  useEffect(() => {
    const id = requestAnimationFrame(() => setBarFraction(progress / 100));
    return () => cancelAnimationFrame(id);
  }, [progress]);

  // Lock body scroll while the tray is expanded, and close on Escape.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Collapse whenever the route changes — covers browser back/forward,
  // where the sidebar's `onNavigate` callback never fires.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname intentionally re-runs the effect on navigation
  useEffect(() => setOpen(false), [pathname]);

  // Remember this chapter's fraction so the next mount can animate from it.
  useEffect(() => {
    lastProgress = progress;
  }, [progress]);

  return (
    <div className="lg:hidden">
      {/* Scrim behind the expanded tray */}
      <AnimatePresence>
        {open && (
          <m.button
            type="button"
            aria-label="Close chapter menu"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-fill-dark/60 easeOut backdrop-blur-sm backdrop-brightness-50"
          />
        )}
      </AnimatePresence>

      {/* The tray itself — follows the viewport, clear of the home indicator */}
      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="overflow-hidden rounded-4 bg-fill/95 shadow-xl backdrop-blur outline-2 outline-brand/5">
          <AnimatePresence initial={false}>
            {open && (
              <m.div
                key="chapter-panel"
                id="mobile-chapter-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between py-2 pl-4 pr-2">
                  <Link
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold text-brand-ink"
                  >
                    <SquareTerminal className="icon-4 text-brand" />
                    Port 22
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close chapter menu"
                    className="inline-flex size-10 items-center justify-center rounded-2 text-ink hover:bg-fill-raised"
                  >
                    <X className="icon-5" />
                  </button>
                </div>
                <div className="max-h-[55dvh] overflow-y-auto overscroll-contain px-2 py-4">
                  <CourseSidebar sections={sections} onNavigate={() => setOpen(false)} />
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Reading progress strip. Animating scaleX (rather than width) glides
              reliably from the previous chapter's fraction to the next one's, since
              the bar persists across navigations in the layout. */}
          <div className="h-1 bg-border/50">
            <div
              className="h-full w-full origin-left bg-brand"
              style={{
                transform: `scaleX(${barFraction})`,
                transition: reduceMotion
                  ? undefined
                  : "transform 550ms cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
              }}
            />
          </div>

          {/* Collapsed bar: current position + expand toggle, with the
              theme toggle as a sibling (buttons can't nest). */}
          <div className="flex items-center pr-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-chapter-panel"
              aria-label={open ? "Close chapter menu" : "Open chapter menu"}
              className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 text-left"
            >
              <span className="shrink-0 text-xs tabular-nums text-ink/50">
                {index === -1 ? "—" : `${index + 1} / ${chapters.length}`}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                {current?.title ?? "Course chapters"}
              </span>
              <m.span
                animate={{ rotate: open ? 180 : 0 }}
                className="inline-flex shrink-0"
              >
                <ChevronUp className="icon-5 text-ink/70" />
              </m.span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
