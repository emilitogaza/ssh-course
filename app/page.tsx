import { ArrowRight, ArrowUpRight, Clock, FileText, Layers, SquareTerminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/button";
import { Marquee } from "@/components/marquee";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAllChapters, getSidebarSections } from "@/lib/content";

// ── Landing copy ──────────────────────────────────────────────────────────
// Site-specific strings. The chapter grid, stats, and marquee fill themselves
// in from `content/`.
const WORDMARK = "Port 22";
const HERO_EYEBROW = "A free course on SSH & servers";
const HERO_TAGLINE =
  "Clients, servers, key pairs, tunnels — a plain-English course on how you talk to a machine on the other side of the internet, and how to run your own.";
const CTA_LABEL = "Start the course";
const FOOTER_NOTE = "Port 22 — how SSH, servers, and keys actually work.";

// ── More courses ──────────────────────────────────────────────────────────
// Manually curated links to the other course sites in this family. Update the
// list on every site's landing page when a new course ships.
const OTHER_COURSES = [
  {
    title: "Rökland",
    href: "https://rokland-story.vercel.app",
    description: "The history, nature and guide to a corner of Alnö — in Swedish.",
  },
  {
    title: "Fuel Lab",
    href: "https://nutrition-course-eight.vercel.app",
    description: "Evidence-based sports nutrition for athletes.",
  },
  {
    title: "Psoriasis & PsA",
    href: "https://pso-course.vercel.app",
    description: "Understanding psoriasis and psoriatic arthritis.",
  },
  {
    title: "Från jord till bord",
    href: "https://fran-jord-till-bord.vercel.app",
    description: "How farming works in Sweden — from soil to table.",
  },
];

export default function Home() {
  const chapters = getAllChapters();
  const sections = getSidebarSections();
  const first = chapters[0];

  // Honest little stats for the hero — derived from the content itself.
  const words = chapters.reduce((n, c) => n + c.content.split(/\s+/).length, 0);
  const minutes = Math.max(1, Math.round(words / 200));

  const titles = chapters.map((c) => c.title);

  const stats = [
    { icon: FileText, label: `${chapters.length} chapters` },
    { icon: Clock, label: `~${minutes} min read` },
    { icon: Layers, label: `${sections.length} sections` },
  ];

  // Global chapter numbers in reading order, shared across the section groups.
  const numberBySlug = new Map(chapters.map((c, i) => [c.slug, i + 1]));

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      {/* Decorative backdrop: a soft brand glow + an oversized wordmark glyph.
          Pure accent-token colours, so it re-themes with the ramp. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
        <SquareTerminal
          className="absolute -right-24 top-24 size-96 rotate-12 text-brand/[0.07]"
          strokeWidth={1}
        />
      </div>

      {/* Minimal header — the course shell (sidebar, tray) starts on the
          chapter pages; the landing page only needs the wordmark + theme. */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 md:px-10">
        <span className="flex items-center gap-2 text-base font-semibold text-brand-ink">
          <SquareTerminal className="size-5 text-brand" />
          {WORDMARK}
        </span>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-20 pt-16 text-center md:px-10 md:pt-24">
        <p
          className="animate-fade-up rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand-ink"
          style={{ animationDelay: "0ms" }}
        >
          {HERO_EYEBROW}
        </p>
        <h1
          className="animate-fade-up mt-6 max-w-3xl text-balance text-5xl font-[520] font-stretch-120% leading-[1.05] tracking-tight text-brand-ink md:text-7xl"
          style={{ animationDelay: "90ms" }}
        >
          The key to <span className="text-brand">every server</span>.
        </h1>
        <p
          className="animate-fade-up mt-6 max-w-xl text-balance text-lg text-ink/75"
          style={{ animationDelay: "180ms" }}
        >
          {HERO_TAGLINE}
        </p>

        <div
          className="animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: "270ms" }}
        >
          <Button asChild size="lg">
            <Link href={`/${first.slug}`}>
              {CTA_LABEL}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="#chapters">Browse the chapters</Link>
          </Button>
        </div>

        <ul
          className="animate-fade-up mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
          style={{ animationDelay: "360ms" }}
        >
          {stats.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm text-ink/60">
              <Icon className="size-4 text-brand" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      {/* Marquee of chapter titles — a slow conveyor belt of what's covered. */}
      <Marquee items={titles} />

      {/* Chapter overview */}
      <section
        id="chapters"
        className="mx-auto w-full max-w-6xl scroll-mt-10 px-6 py-20 md:px-10"
      >
        <h2 className="text-3xl font-[530] font-stretch-120% tracking-tight text-brand-ink md:text-4xl">
          What&apos;s inside
        </h2>

        <div className="mt-10 flex flex-col gap-12">
          {sections.map((group) => (
            <div key={group.section}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink/50">
                {group.section}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.chapters.map((chapter) => {
                  return (
                    <Link
                      key={chapter.slug}
                      href={`/${chapter.slug}`}
                      className="group flex items-start gap-4 rounded-4 bg-fill-raised p-5 transition-colors hover:bg-brand/10"
                    >
                      <span className="mt-0.5 text-sm font-semibold tabular-nums text-brand">
                        {String(numberBySlug.get(chapter.slug)).padStart(2, "0")}
                      </span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="flex items-center gap-2 font-semibold text-brand-ink">
                          {chapter.title}
                          <ArrowRight className="size-4 shrink-0 -translate-x-1 text-brand opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </span>
                        {chapter.description && (
                          <span className="text-sm leading-snug text-ink/60">
                            {chapter.description}
                          </span>
                        )}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Other courses in the family — a manually curated list. */}
      {OTHER_COURSES.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
          <h2 className="text-3xl font-[530] font-stretch-120% tracking-tight text-brand-ink md:text-4xl">
            More courses
          </h2>
          <p className="mt-2 text-ink/60">
            Same recipe, different topics — more little courses like this one.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OTHER_COURSES.map((course) => (
              <a
                key={course.href}
                href={course.href}
                className="group flex flex-col gap-1 rounded-4 bg-fill-raised p-5 transition-colors hover:bg-brand/10"
              >
                <span className="flex items-center gap-2 font-semibold text-brand-ink">
                  {course.title}
                  <ArrowUpRight className="size-4 shrink-0 -translate-x-1 translate-y-1 text-brand opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                </span>
                <span className="text-sm leading-snug text-ink/60">
                  {course.description}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-border/60 px-6 py-8 text-center text-sm text-ink/50">
        {FOOTER_NOTE}
      </footer>
    </main>
  );
}
