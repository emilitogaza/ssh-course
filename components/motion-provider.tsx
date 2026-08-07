"use client";

import { domAnimation, LazyMotion } from "motion/react";

// Mounts the lazy `domAnimation` feature bundle once for the whole app, so the
// `m` components used elsewhere stay at ~4.6kb instead of pulling in the full
// ~34kb `motion` runtime. Keep this the only place `LazyMotion` is rendered.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
