import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

// Renders a chapter's Markdown body to HTML.
//
// - `remark-gfm` adds GitHub-flavoured Markdown (tables, task lists, strikethrough).
// - `rehype-slug` stamps an `id` on every heading so the table-of-contents
//   anchors and in-page `#hash` links resolve. The ids match what
//   `lib/content.ts` generates for the "On this page" rail.
//
// Typography comes from the global `.prose` rules in `globals.css`; we only add
// a couple of element tweaks that prose doesn't already cover (tables, hr).
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={{
        // `scroll-mt` keeps a heading clear of the sticky mobile bar when
        // reached via an anchor link.
        h2: (props) => <h2 className="scroll-mt-24" {...props} />,
        h3: (props) => <h3 className="scroll-mt-24" {...props} />,
        hr: () => <hr className="my-8 border-border" />,
        table: (props) => (
          <div className="my-6 overflow-x-auto">
            <table
              className="w-full border-collapse text-left text-sm [&_tbody_tr:nth-child(odd)]:bg-fill-raised/60"
              {...props}
            />
          </div>
        ),
        th: (props) => <th className="px-3 py-2 font-semibold" {...props} />,
        td: (props) => <td className="px-3 py-2 align-top" {...props} />,
        code: ({ className, ...props }) => (
          <code
            className={`rounded-1 bg-fill-raised px-1.5 py-0.5 text-[0.9em] ${className ?? ""}`}
            {...props}
          />
        ),
        pre: (props) => (
          <pre
            className="my-4 overflow-x-auto rounded-2 bg-fill-raised p-4 text-sm"
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
