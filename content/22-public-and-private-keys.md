---
title: "Public & Private Keys: The Mental Model"
section: Keys & Authentication
order: 22
description: What a key pair actually is, which half is which, where each lives, and the analogy that makes it stick.
---

# Public & Private Keys: The Mental Model

This is the chapter that makes SSH click. Everything else is commands; this is the
idea underneath them. Read it slowly — if the model here is solid, the rest of the
course is easy.

## A key pair is two files

When you "make an SSH key", you actually generate **two files at once**, together,
mathematically bound to each other:

| File | Name (typical) | Nature | Where it lives |
| --- | --- | --- | --- |
| **Private key** | `id_ed25519` | **Secret.** Never share. | Only on **your machine** (`~/.ssh/`) |
| **Public key** | `id_ed25519.pub` | Shareable. Safe to hand out. | Copied onto **every server** you want to reach |

The `.pub` extension is the giveaway: the file ending in `.pub` is the **public**
one — the one that's safe to distribute. The one *without* `.pub` is the
**private** one that stays home.

They're a matched set. The public key isn't a "second password"; it's the
partner that can *verify* the private key without being able to *impersonate* it.

## Which half does what

From the encryption chapter: what one key locks, only the other unlocks. For SSH
login the relevant direction is **proving identity**:

- Your **private key** can produce a **signature** — a bit of data only that
  private key could have generated.
- The matching **public key** can **verify** that signature — confirm it came from
  the private key — but **cannot produce one itself**.

So a server holding your public key can *check* that you hold the private key,
without ever being able to *be* you. Give your public key to a hundred servers and
none of them gains the power to impersonate you anywhere. That's the asymmetry
doing its job.

## The lock-and-key picture (the right way round)

People often reach for a lock analogy and get it backwards, so here it is
carefully, matched to how SSH login actually uses the keys:

- Think of your **private key** as a unique **signet ring** — a stamp only you
  possess.
- Your **public key** is a **published picture of that stamp's imprint**, which you
  give to anyone.

When you want in, you stamp a fresh document (sign a challenge). The server holds
the published imprint and checks: *does this stamp match the imprint on file?* If
yes, you must hold the ring. Anyone can *recognise* your stamp from the published
picture; nobody can *forge* it without the ring. Copies of the picture are
harmless; the ring is everything.

> Whichever analogy you like — padlocks, signet rings — the load-bearing fact is
> the same: **the public key lets others recognise you; only the private key lets
> you act as you.** Guard the private one; scatter the public one freely.

## Where each key lives — the whole point of "local and server keys"

A lot of beginners get tangled here, so let's be explicit, because this *is* the
"keys local and on the server" question that motivates the course:

```text
   YOUR LAPTOP (client)                    THE SERVER (remote)
  ┌─────────────────────┐                ┌──────────────────────────┐
  │  ~/.ssh/id_ed25519   │  private  🔒  │                          │
  │  ~/.ssh/id_ed25519.pub│ ── copy ──▶  │  ~/.ssh/authorized_keys  │
  │                      │   public 🔓   │  (holds your public key) │
  └─────────────────────┘                └──────────────────────────┘
```

- Your **private key stays on your laptop**, in `~/.ssh/`. It never moves. Not to
  the server, not anywhere.
- A **copy of your public key** goes into a file on the server called
  **`authorized_keys`**. That file is the server's list of *"public keys allowed to
  log in as this user."*

To log in, your laptop uses the private key to prove itself; the server checks it
against the public key sitting in `authorized_keys`. **The private key and the
public key never meet** — they just each play their half from opposite ends of the
connection. Two chapters from now we'll watch that exchange step by step.

## One pair, many servers

You don't need a new key pair per server. The normal setup is:

- **One key pair on your laptop**, reused everywhere.
- Its **public key copied into `authorized_keys`** on every server you want to
  reach.

Want access to five servers? Put the *same* public key on all five. Get a new
laptop? Generate a *new* pair there (or carefully copy your existing private key
across) and enrol its public key. Some people keep separate keys for separate
contexts (work vs personal, one per client) — a fine habit, just not required to
start.

## The rules that follow from the model

Everything you're "supposed to do" with keys falls straight out of the picture:

- **Never share or move your private key.** It's the ring. (If you *must* move it
  to a new machine, do it over a trusted channel and delete it from anywhere it
  shouldn't be.)
- **Freely share your public key.** Paste it into servers, Git hosts, config —
  it's just the imprint.
- **A leaked public key is a non-event.** A leaked *private* key means revoke it
  (remove that public key from every `authorized_keys`) and generate a new pair.
- **Put a passphrase on the private key** so a stolen key file is still locked
  (next chapters).

Hold this model firmly and the commands ahead are almost anticlimactic — you're
just creating the two files and copying the `.pub` one to the right place.

> **Key takeaways**
>
> - A key pair is **two files**: a secret **private** key and a shareable
>   **public** key (`.pub`).
> - The **private key stays on your machine**; a copy of the **public key** goes
>   into the server's **`authorized_keys`**.
> - The public key lets a server **recognise** you; only the private key lets you
>   **prove** you're you — and it never crosses the network.
> - **One pair, reused** across many servers, is the normal setup.
