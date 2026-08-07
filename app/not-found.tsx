import Link from "next/link";
import { getFirstChapter } from "@/lib/content";

export default function NotFound() {
  const first = getFirstChapter();
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase text-brand">404</p>
      <h1 className="text-2xl font-semibold text-brand-ink">Chapter not found</h1>
      <p className="text-ink/70">
        That page doesn&apos;t exist. Head back to the start of the course.
      </p>
      <Link
        href={`/${first.slug}`}
        className="mt-2 inline-flex h-12 items-center rounded-3 bg-brand px-6 font-semibold text-ink-flip transition-colors hover:bg-brand/90"
      >
        Go to {first.title}
      </Link>
    </div>
  );
}
