<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# No third-party UI component libraries

All UI components are built from scratch using React and Tailwind.

**Never install or import from:**

- `@radix-ui/*` (Radix UI primitives)
- `shadcn/ui` (component registry)
- `class-variance-authority` / `cva`
- `@headlessui/*`, `@ark-ui/*`, or any other component primitive library

- Use `lib/utils.ts` `cn()` for class merging and variant maps (plain objects)
- Use `lib/slot.tsx` for the `asChild` render pattern

**`motion/react` is allowed, with constraints:**

- Use the `m` component (not `motion`) — it requires `LazyMotion` to be in scope, cutting the bundle from ~34kb to ~4.6kb initial
- `LazyMotion` with `domAnimation` is mounted once globally in `app/layout.tsx` via `components/motion-provider.tsx` — do not add it anywhere else
<!-- END:component-rules -->

<!-- BEGIN:Proxy/Middleware -->
## Middlware & Proxy
- There is no middleware file in next16
- Do not use Middleware
- The correct file is Proxy.ts, it has replaced Middleware entierly
<!-- END:Proxy/Middleware -->

<!-- BEGIN:Style rules -->
## Styles
- Always use globals.css file for themed tokens
- Always use globals.css rounded scale (rounded-3, rounded-4), do not use tailwind default rounded scale (rounded-xl, rounded-md)
- When you need an icon, reach for lucide icons
<!-- END:Style rules -->

<!-- BEGIN:hosting-rules -->
# This site is hosted on Vercel
This project is hosted on Vercel. When talking about hosting, refer to Vercel.
<!-- END:hosting-rules -->
