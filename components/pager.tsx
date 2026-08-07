import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ChapterMeta } from "@/lib/content";

// Sequential "Previous / Next" navigation at the foot of every chapter.
// Server-rendered — it only needs the neighbouring chapter metadata.
export function Pager({
  prev,
  next,
}: {
  prev: ChapterMeta | null;
  next: ChapterMeta | null;
}) {
  return (
    <nav
      aria-label="Chapter navigation"
      className="mt-16 grid grid-cols-1 gap-4 pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/${prev.slug}`}
          rel="prev"
          className="group flex flex-col gap-1 rounded-3 bg-fill-raised p-4 transition-colors hover:bg-brand/10"
        >
          <span className="flex items-center gap-1 text-xs font-semibold uppercase text-ink/50">
            <ArrowLeft className="size-4" /> Previous
          </span>
          <span className="font-semibold text-brand-ink">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={`/${next.slug}`}
          rel="next"
          className="group flex flex-col items-end gap-1 rounded-3 bg-fill-raised p-4 text-right transition-colors hover:bg-brand/10 sm:col-start-2"
        >
          <span className="flex items-center gap-1 text-xs font-semibold uppercase text-ink/50">
            Next <ArrowRight className="size-4" />
          </span>
          <span className="font-semibold text-brand-ink">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
