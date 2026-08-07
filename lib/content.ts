import "server-only";

import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";

// Where the course chapters live. Every `.md` file in here becomes a page.
const CONTENT_DIR = path.join(process.cwd(), "content");

export type Heading = {
  /** Heading text as shown in the "On this page" rail. */
  text: string;
  /** Slug id, matching the id that `rehype-slug` puts on the rendered heading. */
  id: string;
  /** 2 for `##`, 3 for `###`. */
  level: 2 | 3;
};

export type ChapterMeta = {
  /** URL segment, e.g. `what-is-psoriasis`. Derived from the filename. */
  slug: string;
  title: string;
  section: string;
  order: number;
  description: string;
};

export type Chapter = ChapterMeta & {
  /** Raw Markdown body (frontmatter stripped). */
  content: string;
  /** `##`/`###` headings, in document order, for the table of contents. */
  headings: Heading[];
};

/** Chapters grouped under their sidebar section, in display order. */
export type ChapterSection = {
  section: string;
  chapters: ChapterMeta[];
};

// Turn `05-becomes-psoriatic-arthritis.md` into `becomes-psoriatic-arthritis`.
// A leading `NN-` ordering prefix is stripped so URLs stay clean and stable
// even if a chapter is later renumbered.
function fileNameToSlug(fileName: string): string {
  return fileName.replace(/\.md$/, "").replace(/^\d+[-_]/, "");
}

// Pull `##` and `###` headings out of the Markdown body. We slug them with the
// same library `rehype-slug` uses, so the TOC anchors line up with the ids on
// the rendered headings. Fenced code blocks are skipped so a `# comment` inside
// a code sample never leaks into the navigation.
function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    // Strip inline Markdown emphasis/code so the TOC shows clean text, but slug
    // from the same cleaned text rehype-slug will see after rendering.
    const text = match[2]
      .replace(/[*_`]/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();

    headings.push({ text, id: slugger.slug(text), level });
  }

  return headings;
}

let cachedChapters: Chapter[] | null = null;

/** Read, parse, and sort every chapter. Cached for the lifetime of the process. */
export function getAllChapters(): Chapter[] {
  if (cachedChapters) return cachedChapters;

  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md");

  const chapters = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);

    return {
      slug: fileNameToSlug(file),
      title: (data.title as string) ?? fileNameToSlug(file),
      section: (data.section as string) ?? "General",
      order: typeof data.order === "number" ? data.order : 999,
      description: (data.description as string) ?? "",
      content,
      headings: extractHeadings(content),
    } satisfies Chapter;
  });

  // Sort by `order`, then title as a stable tiebreaker.
  chapters.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  cachedChapters = chapters;
  return chapters;
}

/** Lightweight metadata for every chapter, in order (for `generateStaticParams`). */
export function getAllChapterMeta(): ChapterMeta[] {
  return getAllChapters().map(({ content, headings, ...meta }) => {
    void content;
    void headings;
    return meta;
  });
}

/** A single chapter by slug, or `null` if there's no such file. */
export function getChapter(slug: string): Chapter | null {
  return getAllChapters().find((c) => c.slug === slug) ?? null;
}

/** The first chapter in reading order — used as the site's landing page. */
export function getFirstChapter(): Chapter {
  return getAllChapters()[0];
}

// Group chapters into sidebar sections, preserving the order in which each
// section first appears by chapter order.
export function getSidebarSections(): ChapterSection[] {
  const sections: ChapterSection[] = [];

  for (const chapter of getAllChapters()) {
    let group = sections.find((s) => s.section === chapter.section);
    if (!group) {
      group = { section: chapter.section, chapters: [] };
      sections.push(group);
    }
    const { content, headings, ...meta } = chapter;
    void content;
    void headings;
    group.chapters.push(meta);
  }

  return sections;
}

/** Previous / next chapters for the sequential pager. */
export function getChapterNeighbours(slug: string): {
  prev: ChapterMeta | null;
  next: ChapterMeta | null;
} {
  const chapters = getAllChapters();
  const index = chapters.findIndex((c) => c.slug === slug);
  if (index === -1) return { prev: null, next: null };

  const toMeta = (c: Chapter | undefined): ChapterMeta | null =>
    c
      ? {
          slug: c.slug,
          title: c.title,
          section: c.section,
          order: c.order,
          description: c.description,
        }
      : null;

  return {
    prev: toMeta(chapters[index - 1]),
    next: toMeta(chapters[index + 1]),
  };
}
