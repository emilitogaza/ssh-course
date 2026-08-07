---
title: How Key Authentication Actually Works
section: Keys & Authentication
order: 30
description: The challenge-and-signature exchange that lets you prove you hold the private key without ever sending it.
---

# How Key Authentication Actually Works

You've got a private key on your laptop and its public partner in the server's
`authorized_keys`. When you connect, how does the server confirm you hold the
private key — **without you ever sending it**? This chapter answers that. It's the
satisfying payoff of the whole section, and once you've seen it, key auth stops
being a black box.

## The problem to solve

The server has your **public** key. You have your **private** key. The private key
must **never** cross the network (that's the entire security model). So the server
can't just ask you to "send your key" and compare.

Instead, it uses the signature trick from the encryption chapter: **prove you hold
the private key by signing something, and let the public key verify it.**

## The exchange, step by step

This all happens automatically, inside the already-encrypted tunnel, in a blink:

1. **You offer a key.** Your client says, in effect, *"I'd like to authenticate
   with this public key"* and names which of your keys it's proposing.

2. **The server checks its list.** It looks in that user's `authorized_keys` for a
   matching public key. Not there? This key can't be used — the server declines it
   (and may offer you another auth method). There? Continue.

3. **The server issues a challenge.** It generates a random piece of data and
   essentially says: *"If you really hold the private key for this public key,
   sign this."* (More precisely, your client signs data unique to this specific
   session, so a signature can't be captured and reused later.)

4. **Your client signs it.** Using your **private key**, it produces a
   **signature** over that challenge. This is the only moment the private key is
   *used* — and it's used **locally, on your machine**. The key itself stays on
   disk; only the resulting signature is sent.

5. **The server verifies the signature.** Using the **public key** it already has,
   it checks the signature. Only the matching private key could have produced a
   signature that verifies. Valid → you've proven yourself. **You're in.**

Nowhere in there did the private key travel. The server learns *"this person holds
the private key"* purely from a signature its copy of the public key can check.
That's the magic, and it's just Job B (digital signatures) from the encryption
chapter, applied to login.

## Why this is so strong

- **Nothing secret is transmitted.** Even an attacker recording the entire
  exchange sees only a public key, a random challenge, and a signature — none of
  which lets them log in later. (And because the challenge is fresh each time, a
  recorded signature is useless next time.)
- **The server can't impersonate you.** It only ever holds your public key, which
  can *verify* but never *produce* signatures. A breached server leaks nothing that
  lets someone log in as you elsewhere.
- **No password to phish or brute-force.** There's simply no secret you type that
  could be guessed or captured.

## Watching it happen

Add `-v` (verbose) to any connection and you can see this play out. The
interesting lines look like:

```text
debug1: Offering public key: /Users/you/.ssh/id_ed25519 ED25519 SHA256:Ux2…
debug1: Server accepts key: /Users/you/.ssh/id_ed25519 ED25519 SHA256:Ux2…
debug1: Authentication succeeded (publickey).
```

Read that as the exchange above: your client **offered** a key, the server
**accepted** it (found it in `authorized_keys` and verified your signature), and
**authentication succeeded**. When key login misbehaves, `-v` shows you exactly
where it fell down — which keys were offered and whether any were accepted. We'll
lean on this in the troubleshooting chapter.

## Which key does the client offer?

By default your client tries the standard keys in `~/.ssh` (like `id_ed25519`). If
you have several keys, or a key with a non-default name, you tell SSH which to use
— via `-i`:

```bash
ssh -i ~/.ssh/id_ed25519_work deploy@example.com
```

…or, more cleanly, by setting `IdentityFile` per host in your config (an upcoming
chapter). If your client offers *too many* keys, a server may cut you off with
"Too many authentication failures" — a specific error we'll decode later, with its
`IdentitiesOnly` fix.

## The round trip in one glance

| # | Who | Action |
| --- | --- | --- |
| 1 | Client | "I'll authenticate with this public key" |
| 2 | Server | Is this public key in `authorized_keys`? |
| 3 | Server | Sends a random **challenge** |
| 4 | Client | **Signs** the challenge with the **private key** (used locally) |
| 5 | Server | **Verifies** the signature with the **public key** → access |

Five steps, one signature, zero secrets on the wire. That's public-key
authentication — and it's the same mechanism whether you're logging into your own
VPS or pushing to GitHub.

> **Key takeaways**
>
> - The server proves you hold the private key by asking you to **sign a random
>   challenge**, then **verifying** it with your public key.
> - The **private key is only ever used locally** to sign — it never travels.
> - A recorded exchange can't be replayed (fresh challenge each time) and a
>   breached server can't impersonate you (it holds only public keys).
> - **`ssh -v`** lets you watch keys being *offered* and *accepted* — invaluable
>   for debugging.
