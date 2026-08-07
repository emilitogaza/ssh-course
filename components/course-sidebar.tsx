"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ChapterSection } from "@/lib/content";
import { cn } from "@/lib/utils";

// The chapter navigation list. Shared by the desktop rail and the mobile
// drawer, so it stays a presentational list that highlights the active route.
export function CourseSidebar({
  sections,
  onNavigate,
}: {
  sections: ChapterSection[];
  /** Called after a link is tapped — lets the mobile drawer close itself. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Course chapters" className="flex flex-col gap-7">
      {sections.map((group) => (
        <div key={group.section} className="flex flex-col gap-1">
          <p className="mb-1 px-3 text-xs font-semibold uppercase text-ink/50">
            {group.section}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.chapters.map((chapter) => {
              const href = `/${chapter.slug}`;
              const active = pathname === href;
              return (
                <li key={chapter.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-2 px-3 py-2 text-sm leading-snug transition-colors",
                      active
                        ? "bg-brand/10 text-brand-ink"
                        : "text-ink/75 hover:bg-fill-raised hover:text-ink"
                    )}
                  >
                    {chapter.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
