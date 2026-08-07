---
title: "Ports, Addresses & Finding the Machine"
section: How SSH Works
order: 12
description: How your client locates the server — IP addresses, hostnames and DNS — and what port 22 actually is.
---

# Ports, Addresses & Finding the Machine

Before any encryption or keys come into play, your client has to *find* the server
and knock on the right door. That's two ideas: an **address** (which machine) and
a **port** (which door on that machine).

## The address: which machine

Every machine reachable on a network has an **IP address** — a number like
`203.0.113.10`. When you rent a server, the provider gives you one. It's the
server's location on the internet, the way a street address locates a building.

Typing raw IP addresses is unfriendly, so we also have **hostnames** — human names
like `example.com` or `db.internal.mycompany.com`. A hostname isn't the address
itself; it's a *label* that points to one. The system that translates a hostname
into an IP address is **DNS** (the Domain Name System) — the internet's phone
book.

So when you run:

```bash
ssh deploy@example.com
```

your client first asks DNS *"what's the IP address for `example.com`?"*, gets back
something like `203.0.113.10`, and then connects to that. You can skip the lookup
and use the IP directly — `ssh deploy@203.0.113.10` — which is handy for a
brand-new server that doesn't have a domain pointed at it yet.

> **Tip:** to see what a hostname resolves to, run `ping example.com` (press
> Ctrl-C to stop) or `nslookup example.com`. If a hostname won't resolve, DNS is
> your problem, not SSH — a useful thing to rule out early.

### Public vs private addresses

Two flavours of address you'll meet:

- **Public IP** — reachable from anywhere on the internet. Your rented server has
  one of these.
- **Private IP** — only reachable inside a local network, like `192.168.x.x` or
  `10.x.x.x`. Your home router hands these out to your devices. A server with only
  a private address can't be reached directly from the outside — a common reason a
  connection "times out" when you're not on the same network. (Getting to such
  machines is exactly what **tunnels** and **jump hosts**, later in the course,
  are for.)

There's also one special address worth knowing: **`localhost`** (IP `127.0.0.1`)
always means *"this very machine."* `ssh localhost` tries to SSH into the computer
you're already on — occasionally useful for testing, and it appears a lot when we
get to tunnels.

## The port: which door

A single machine runs many network services at once — a web server, a mail
server, SSH, a database. **Ports** are how one machine keeps them straight:
each service listens on its own numbered port, from 1 to 65535. Think of the IP
address as the building and the port as a specific numbered door in it.

Some ports are conventional:

| Port | Service |
| --- | --- |
| 22 | **SSH** |
| 80 | HTTP (web) |
| 443 | HTTPS (secure web) |
| 3306 | MySQL |
| 5432 | PostgreSQL |

**SSH's default port is 22.** When you run `ssh deploy@example.com`, your client
connects to `example.com` on port 22 without you having to say so — it's assumed.

### When it's not 22

Some servers move SSH to a different port (often to cut down on automated
scanning). To connect to a non-standard port, use `-p`:

```bash
ssh -p 2222 deploy@example.com
```

> **Watch out:** `scp` uses a **capital** `-P` for the port, while `ssh` uses
> **lowercase** `-p`. It's an inconsistency that has cost everyone at least one
> confused minute. We'll flag it again in the file-copying chapter.

Rather than remembering `-p 2222` every time, you'll soon put the port in your SSH
**config file** and forget about it — but that's a later chapter.

## Putting it together

So the full picture of *reaching* a server, before we've even authenticated:

1. You give SSH a **user** and a **host**: `ssh deploy@example.com`.
2. If the host is a name, **DNS** resolves it to an **IP address**.
3. Your client opens a network connection to that IP on **port 22** (or whatever
   `-p` says).
4. If `sshd` is listening there, it answers, and the handshake begins.

Each step has its own failure mode, which is why naming them is useful:

| Symptom | Likely cause |
| --- | --- |
| `Could not resolve hostname` | DNS problem — the name doesn't point anywhere |
| `Connection timed out` | Can't reach the machine at all — wrong IP, firewall, or it's on a private network |
| `Connection refused` | Reached the machine, but **nothing is listening** on that port — `sshd` down, or wrong port |

Notice how different "timed out" and "refused" are: *timed out* means the knock
went unanswered into the void; *refused* means someone was home and slammed the
door because that particular door isn't in use. Reading that distinction correctly
saves a lot of guessing.

> **Key takeaways**
>
> - A server is found by its **IP address**; a **hostname** is a friendly label
>   that **DNS** translates into one.
> - **Ports** pick which service on a machine you're talking to; **SSH is port 22**
>   by default.
> - Use **`ssh -p <port>`** for a non-standard port (and remember `scp` wants a
>   capital `-P`).
> - "Timed out" (nobody answered) and "refused" (answered, door closed) point at
>   very different problems.
