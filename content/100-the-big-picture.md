---
title: "The Big Picture: From Your Mac to a Live Client Site"
section: Our Hosting Stack
order: 100
description: How our actual stack fits together — your Mac, SSH, a Coolify server, Docker containers, and Traefik — and where each piece sits.
---

# The Big Picture: From Your Mac to a Live Client Site

The rest of the course was general SSH. This section is **our setup** — the
specific stack we use to host client sites. It all rests on the SSH you've already
learned, so nothing here is a fresh start; it's SSH *applied*.

The one-sentence version:

> From your **Mac** you **SSH** into a **server** running **Coolify**, which builds
> each client's code into a **Docker** container and uses **Traefik** to route that
> client's domain to it over HTTPS.

Let's meet each layer, top to bottom, and see exactly where SSH lives in it.

## The pipeline

```text
   YOUR MAC                    THE SERVER (one VPS)
  ┌──────────┐    SSH :22     ┌──────────────────────────────────────────────┐
  │ terminal │───────────────▶│  Coolify  (the control panel / PaaS)          │
  │  ~/.ssh  │                │     │ builds & manages                        │
  │  browser │──── HTTPS ────▶│     ▼                                          │
  └──────────┘   (dashboard)  │  Docker  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
                              │          │client-a │ │client-b │ │  db     │   │
                              │          │container│ │container│ │container│   │
                              │          └────▲────┘ └────▲────┘ └─────────┘   │
                              │   Traefik ────┘───────────┘  (routes + TLS)     │
                              └───────▲──────────────────────────────────────┘
                                      │ HTTPS :443
                        client-a.com ─┤
                        client-b.com ─┘   (public visitors)
```

Two arrows leave your Mac, and it's worth separating them:

- **SSH on port 22** — you, the operator, getting a shell on the server to run
  commands, read logs, and poke at containers. This is the whole first part of the
  course.
- **HTTPS on port 443** — two different things travel here: *you* opening
  **Coolify's web dashboard** in a browser, and *the public* visiting the **client
  sites**. Traefik handles both.

## The layers, one line each

| Layer | What it is | Its job here | Covered in |
| --- | --- | --- | --- |
| **Your Mac** | Your control machine | Where you run `ssh`, `git`, and the browser | *Your Mac as the Control Machine* |
| **SSH** | Secure shell (port 22) | Gets you *onto* the server; Coolify also uses it to manage servers | The whole course so far |
| **The server** | One Linux VPS | Runs everything below | *Renting a Server* |
| **Coolify** | Self-hosted platform (PaaS) | Turns a Git repo into a running container; the UI you deploy from | *Coolify: Your Self-Hosted Platform* |
| **Docker** | Container runtime | Runs each client site isolated in its own container | *Docker, Just Enough* |
| **Traefik** | Reverse proxy | Routes each domain to the right container + issues HTTPS certs | *Traefik: Routing & HTTPS* |

## Where SSH shows up (it's everywhere)

This stack is a good argument for learning SSH properly, because it uses it at
*three* levels:

1. **You → the server.** You `ssh` in to install Coolify, check `docker ps`, tail
   logs, or fix something the UI can't. Same `user@host`, keys, and config from the
   Keys section.
2. **Coolify → servers.** Coolify can manage **remote** servers, and it does so
   **over SSH** — it holds a private key and you drop its public key into the
   server's `authorized_keys`. It's exactly the model from *Keys on the Server*,
   just performed by a program instead of you.
3. **Coolify → Git.** To pull a private client repo, Coolify authenticates to
   GitHub with a **deploy key** — the same SSH keys from the *Git & SSH* chapter.

So the "magic PaaS" is, under the hood, running the same handful of SSH ideas you
now understand. That's the theme of this section: **you already know the hard
part.**

## What each layer hides from you (and when you reach past it)

Coolify exists so you *don't* usually SSH in and run Docker by hand — you click
"Deploy" and it happens. But when something breaks, you drop down a layer:

- Site returns a weird error → read **Coolify's** logs in the UI.
- Coolify's logs aren't enough → **SSH in** and run `docker logs` / `docker ps`.
- The domain won't load or the cert won't issue → look at **Traefik** and **DNS**.

Knowing the layers *in order* is what turns "the site is down and I don't know
why" into a five-minute checklist. The last chapter of this section is exactly
that checklist.

## How to read this section

Each chapter takes one layer:

1. **Your Mac** — set up your control machine (keys, config, tools) for this stack.
2. **Docker** — just enough to be dangerous: containers, logs, and getting a shell
   *inside* one.
3. **Coolify** — what it is and how you deploy a client site with it.
4. **Running client sites** — the day-to-day: env vars, storage, databases, logs.
5. **Traefik** — how domains and HTTPS actually get wired up.
6. **The debug playbook** — when a site is down, what to check and in what order.

By the end you'll be able to point at any part of the diagram above and say what it
does, how to reach it, and how to fix it.

> **Key takeaways**
>
> - Our stack: **Mac → SSH → Coolify → Docker → Traefik → client sites.**
> - **SSH** underpins all of it — you use it to reach the server, *and* Coolify
>   uses it to manage servers and pull private repos.
> - Two things leave your Mac: **SSH (:22)** for operating the box, **HTTPS (:443)**
>   for the dashboard and the live sites.
> - Debugging means **dropping down a layer at a time** — Coolify UI → Docker →
>   Traefik/DNS.
