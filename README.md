# Port 22

A plain-English course and documentation site about **SSH** — how you log into servers over the network, and how the whole thing actually works under the hood. It covers the mental model (clients, servers, ports), the **key pairs** that replace passwords — where the private key lives on *your* machine and where the public key goes on *the server* — how to get access to a machine for the first time, how to run and harden your own server, and how to read the errors when a connection is refused.

It's written for people who **can code a little but never quite got SSH**: you've pasted `ssh` commands from a tutorial, maybe generated a key for GitHub, but the pieces never clicked. The course starts from zero and builds toward tunnels, jump hosts, and config files — without ever assuming you're a sysadmin.

> **Note:** Commands are shown for macOS and Linux, with Windows (PowerShell / OpenSSH) notes where they differ. Everything here is standard OpenSSH — the same client that ships with every modern operating system.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- React with UI components built from scratch — no third-party component libraries
- Tailwind CSS with themed tokens in `app/globals.css`
- [motion](https://motion.dev) for animation (via `LazyMotion` in `components/motion-provider.tsx`)
- Hosted on [Vercel](https://vercel.com)

## Getting started

Install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding course material

Every chapter is a single Markdown file in `content/`. See [`content/README.md`](content/README.md) for the frontmatter format and ordering conventions — the site picks up new files automatically.

## Project structure

- `app/` — routes, layout, and global styles
- `components/` — UI components
- `content/` — course chapters as Markdown (one file per chapter)
- `lib/` — utilities (`content.ts` chapter loader, `cn()` class merging, `Slot` for the `asChild` pattern)
- `public/icons/` — PWA icons referenced by `app/manifest.webmanifest`
