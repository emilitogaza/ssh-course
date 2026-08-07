import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { Pager } from "@/components/pager";
import { TableOfContents } from "@/components/table-of-contents";
import { getAllChapterMeta, getChapter, getChapterNeighbours } from "@/lib/content";

// Pre-render one static page per chapter at build time.
export function generateStaticParams() {
  return getAllChapterMeta().map(({ slug }) => ({ slug }));
}

// Reject any slug that isn't a real chapter file → 404.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) return {};
  return {
    title: chapter.title,
    description: chapter.description || undefined,
  };
}

export default async function ChapterPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const chapter = getChapter(slug);
  if (!chapter) notFound();

  const { prev, next } = getChapterNeighbours(slug);

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-12 px-6 py-10 md:px-10 lg:py-14">
      <article className="prose min-w-0 flex-1">
        <Markdown>{chapter.content}</Markdown>
        <Pager prev={prev} next={next} />
      </article>

      {/* "On this page" rail — widest breakpoints only, like the Next.js docs */}
      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-14">
          <TableOfContents headings={chapter.headings} />
        </div>
      </aside>
    </div>
  );
}
