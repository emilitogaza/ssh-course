"use client";

import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";
import { useContext, useEffect, useRef } from "react";

// Value from the previous committed render, or undefined on the first one.
function usePreviousValue<T>(value: T): T | undefined {
  const prev = useRef<T | undefined>(undefined);

  useEffect(() => {
    prev.current = value;
  });

  return prev.current;
}

// The router swaps the routed content via context the moment navigation
// commits, so the outgoing copy that AnimatePresence keeps alive would
// otherwise re-render as the *new* page mid-exit. While the segment is
// changing, hand the outgoing subtree the previous render's context so it
// keeps showing the old chapter until its exit animation finishes.
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const prevContext = usePreviousValue(context) ?? null;

  const segment = useSelectedLayoutSegment();
  const prevSegment = usePreviousValue(segment);

  const changed =
    segment !== prevSegment && segment !== undefined && prevSegment !== undefined;

  return (
    <LayoutRouterContext.Provider value={changed ? prevContext : context}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

// Cross-fades chapter content on navigation: the old chapter fades out
// drifting up, then the new one fades in rising from below. Must live in a
// layout that persists across navigations (app/(course)/layout.tsx) —
// AnimatePresence can only play an exit if it survives the route change.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const segment = useSelectedLayoutSegment();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div
        key={segment}
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={
          reduceMotion
            ? undefined
            : {
                opacity: 0,
                y: -20,
                // Out is quicker than in, so the swap reads as a handoff.
                transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
              }
        }
        transition={{
          duration: reduceMotion ? 0 : 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex min-w-0 flex-1 flex-col"
      >
        <FrozenRouter>{children}</FrozenRouter>
      </m.div>
    </AnimatePresence>
  );
}
