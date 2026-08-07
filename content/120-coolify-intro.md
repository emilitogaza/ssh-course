---
title: "Coolify: Your Self-Hosted Platform"
section: Our Hosting Stack
order: 120
description: What Coolify is, how it turns a Git repo into a running container, and how it leans on SSH to manage servers and pull code.
---

# Coolify: Your Self-Hosted Platform

**Coolify** is the piece that ties the stack together. It's an open-source,
self-hosted **platform-as-a-service** — think "your own Heroku, Netlify, or Vercel,
running on a server you control." You give it a Git repo and a domain; it builds
the code, runs it in Docker, and points the domain at it with HTTPS. This chapter
is what it is and how it fits the SSH picture; the next is using it day to day.

## What problem it solves

Without Coolify, hosting a client site by hand means: SSH in, install a runtime,
`git pull`, build, write a systemd service or Docker command, configure a reverse
proxy, obtain a TLS certificate, set up auto-renewal, wire up a database… per site,
and again for every update.

Coolify turns all of that into **"connect repo, set domain, click Deploy."** It
manages Docker, the reverse proxy (Traefik), and certificates for you. You still
*own* the server — nothing is locked to a vendor — but you stop doing the plumbing
by hand.

## How it's put together

Coolify itself runs **as Docker containers on your server**. You install it with a
one-liner on a fresh VPS (as root):

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

That installs Docker (if absent) and starts Coolify plus its proxy. You then open
its **web dashboard** in a browser, create an admin account, and — importantly —
set a **domain for Coolify itself** (e.g. `coolify.ouragency.com`) so the dashboard
is served over HTTPS instead of a raw IP and port.

> **Security note:** the dashboard is the keys to the kingdom — it can deploy,
> read env vars, and open shells into containers. Put it behind HTTPS, use a strong
> admin password, and consider restricting it. The server underneath should already
> be hardened per the *Hardening SSH* chapter (key-only login, no root SSH).

## The Coolify vocabulary

You'll navigate these nouns constantly:

| Term | What it means |
| --- | --- |
| **Server** | A machine Coolify deploys to — the local one it's installed on, and/or remote ones added over SSH |
| **Project** | A grouping, e.g. one per client |
| **Environment** | A stage within a project — `production`, `staging` |
| **Resource** | A deployable thing: an **application** (a client site), a **database**, or a **service** |
| **Destination** | The Docker network/server a resource runs on |

A typical layout for us: **one Project per client**, a `production` environment, and
an **application** resource for their site (plus a **database** resource if needed).

## Where SSH comes in

This is why Coolify belongs in an SSH course — it *runs on* SSH in two places:

### 1. Managing servers over SSH

Coolify can deploy to the server it lives on, but it can also manage **additional
remote servers** — and it reaches them **over SSH**, exactly as you do. When you
add a remote server in the UI, Coolify shows you **its own public key**; you place
that key in the server's `~/.ssh/authorized_keys` (the *Keys on the Server* chapter,
performed for a program). From then on Coolify SSHes in to run Docker there.

So "add a server to Coolify" is really "let Coolify's key log into that server." The
mental model you built for your own access applies unchanged — the client is just
Coolify instead of your Mac.

### 2. Pulling private repos with a deploy key

To build a **private** client repo, Coolify authenticates to GitHub/GitLab with an
SSH key — either a per-repo **deploy key** or a Git App integration. Deploy keys are
the *Git & SSH* chapter's read-only, single-repo keys. You add Coolify's public
deploy key to the client's repository, and it can pull — nothing more.

## Deploying a client site (the shape of it)

The end-to-end flow, which the next chapter details:

1. **New Project** → new **Application** resource.
2. **Connect the source** — a GitHub repo (public, or private via deploy key), a
   Dockerfile, a Docker Compose file, or a prebuilt image.
3. **Coolify detects how to build it.** For most apps it uses **Nixpacks**, which
   auto-detects the language/framework and produces an image with no Dockerfile
   needed. You can also supply your own Dockerfile for full control.
4. **Set the domain** — e.g. `client-a.com`. Coolify hands this to Traefik and
   requests a Let's Encrypt certificate.
5. **Set environment variables / secrets** the app needs.
6. **Deploy.** Coolify builds the image, starts the container, and Traefik begins
   routing the domain to it over HTTPS.

Push to the repo later and — with auto-deploy on — Coolify rebuilds and swaps the
container automatically. That's the whole reason it exists: a `git push` becomes a
deployed client site.

## Build methods at a glance

| Method | Use when |
| --- | --- |
| **Nixpacks** (auto) | Standard apps (Node, Next.js, Laravel, static, …) — zero config |
| **Dockerfile** | You need exact control over the image |
| **Docker Compose** | The app is multiple linked containers |
| **Prebuilt image** | You already publish an image to a registry |

For most client sites, Nixpacks "just works" and you never write a Dockerfile.

## Where this leaves you

Coolify is a friendly face over Docker + Traefik, wired together with the very SSH
and Git-over-SSH mechanics you already know. Nothing mysterious — just automated.
Next we run real sites on it and learn the day-to-day controls.

> **Key takeaways**
>
> - Coolify is a **self-hosted PaaS**: connect a repo + domain, it builds a
>   **Docker image**, runs it, and fronts it with **Traefik + HTTPS**.
> - It runs **as containers on your server**; you manage it from a **web
>   dashboard** (put that dashboard behind HTTPS and a strong password).
> - It uses **SSH** to manage remote servers (its key in their `authorized_keys`)
>   and **deploy keys** to pull private repos — the exact models from earlier
>   chapters.
> - Most sites build with **Nixpacks** automatically; reach for a **Dockerfile**
>   only when you need control.
