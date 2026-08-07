---
title: Passwords vs Keys
section: Keys & Authentication
order: 20
description: Why SSH keys beat passwords for logging in — security, convenience, and the trade-offs — and what "key-based auth" buys you.
---

# Passwords vs Keys

When you connect to a server, you have to prove you're allowed in. SSH offers two
main ways, and choosing between them shapes everything else in this section. The
short version: **keys win**, and it's worth understanding why so the setup effort
makes sense.

## The two options

**Password authentication.** The server has a password for your account. You type
it; if it matches, you're in. Familiar, nothing to set up.

**Public-key authentication.** You have a **key pair**. The server keeps your
**public** key on file. When you connect, your client proves it holds the matching
**private** key — no typing, nothing secret sent across the wire. This is what
"set up SSH keys" means, and it's the default for serious use.

## Why keys are more secure

Line them up on the things that actually matter:

| | Password | Key |
| --- | --- | --- |
| Secret sent to server? | **Yes**, every login | **No** — private key never leaves your machine |
| Guessable / brute-forceable? | Yes — bots try millions | No — the keyspace is astronomically large |
| Phishable? | Yes — you can be tricked into typing it | Much harder — nothing to type into a fake prompt |
| Reused across sites? | Often (bad habit) | Each key is unique and local |
| Survives a server breach? | Password may be exposed | Only your **public** key is on the server — useless to a thief |

That last row deserves a beat. If a server storing **passwords** is breached, your
secret may leak. If a server storing **public keys** is breached, the attacker
gets… your public keys — which were never secret. They can't log in as you with a
public key; it's the wrong half. The design fails safe.

And the "sent every login" row is why passwords are exposed to more risk over
time: every time you type one, it travels (encrypted, but still) to the server. A
private key is *used* to prove yourself but is never transmitted at all.

### The internet is noisy

Point any server at the public internet and within minutes automated bots start
trying to log in as `root`, `admin`, `test`… guessing common passwords, thousands
of attempts an hour. Against a weak or reused password that's a real threat.
Against key auth it's hopeless — there's no password to guess, and you can turn
password login off entirely (a later chapter does exactly that).

## Why keys are also more convenient

Security tools that annoy you get bypassed, so it matters that keys are *also*
nicer to use:

- **No typing.** Once set up (and with an agent holding your key), `ssh web` logs
  you in with no prompt.
- **No password to remember** per server — one key works across all the machines
  that have your public key.
- **Automation-friendly.** Scripts, deploys, and `git push` can authenticate
  without a human to type a password. This is *why* your Git pushes over SSH don't
  ask for anything.

## The trade-offs (being honest)

Keys aren't free:

- **A little setup.** You generate a pair and get your public key onto each server
  — the next few chapters. It's a one-time cost per machine.
- **You must protect the private key.** It's a file on your disk. Lose it and you
  lose that identity; let someone copy it and they can impersonate you. A
  **passphrase** on the key (covered soon) is your safety net if the file is ever
  stolen.
- **Managing keys across machines.** A new laptop means a new key to enrol — a
  minor bit of hygiene, not a real burden.

None of these outweighs the benefits. The standard, recommended practice for
essentially all server access is: **use keys, and turn passwords off.**

## So do passwords ever make sense?

Occasionally:

- The very **first login** to a fresh server sometimes uses a temporary password
  the provider emailed you — after which you install your key and disable password
  login. (Many providers now let you register a key at creation time and skip even
  that.)
- **Quick throwaway** access on a trusted local network.

Even then, keys are usually available and better. Treat password login as the
exception, not the norm.

## Where this section goes

Now that you know *why* keys are worth it, the rest of this section makes them
concrete:

1. **What a key pair really is** — the mental model, done carefully.
2. **Generating** your own pair.
3. **Where the keys live** — your local `~/.ssh` folder, and the server's
   `authorized_keys`.
4. **How the login actually works** — the challenge-and-signature dance.
5. **Passphrases and the agent** — protecting the private key without retyping.
6. **Host keys** — the *server's* identity, the flip side of the coin.

> **Key takeaways**
>
> - **Password:** a shared secret you send each login — guessable, phishable, and
>   exposed if the server is breached.
> - **Key:** you prove you hold a private key **without sending it** — far stronger
>   and, once set up, more convenient.
> - A breached server only ever holds your **public** key, which is useless to a
>   thief.
> - Best practice: **use keys, disable password login** (we'll do this later).
