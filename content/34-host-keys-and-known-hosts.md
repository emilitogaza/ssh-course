---
title: "Host Keys & known_hosts"
section: Keys & Authentication
order: 34
description: The server's own identity — host keys, the first-connection prompt, the known_hosts file, and what the scary "identification has changed" warning means.
---

# Host Keys & known_hosts

So far, keys have been about proving *you* to the *server*. This chapter is the
mirror image: how the **server proves itself to you**. It's the source of the very
first prompt SSH ever shows you, and of the scariest warning it can show — so it's
worth understanding both.

## Servers have keys too

Just as you have a key pair, **every SSH server has its own key pair**, called its
**host key**. It was generated when `sshd` was first installed, and it identifies
*that specific machine*. The server keeps its private host key secret and presents
its public host key to every client that connects.

This exists to stop impersonation. Remember: after the handshake you have an
encrypted tunnel, but encryption alone doesn't tell you *who's on the other end*.
The host key is how the server says *"I am genuinely the machine you meant to reach,
here's proof"* — using the same signature idea, in reverse.

## The first-connection prompt

The catch: the very first time you connect to a server, your client has never seen
its host key, so it can't tell whether it's genuine. It punts the decision to you:

```text
The authenticity of host 'example.com (203.0.113.10)' can't be established.
ED25519 key fingerprint is SHA256:Ux2Cq0m7…s9plQ.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

That **fingerprint** is a short, unique summary of the server's public host key.
By answering, you're vouching that this is the right machine:

- Type **`yes`** → your client saves the fingerprint and connects. From now on it
  remembers this server.
- Type **`no`** → it aborts.

Most of the time people type `yes` without checking, and usually it's fine. But
strictly, this is a **trust-on-first-use** moment: you're trusting that *this
first* connection isn't already being intercepted. For a random VPS, `yes` is
normal. For something sensitive, you can **verify the fingerprint out of band** —
compare it against the fingerprint your provider shows in their control panel, or
that a colleague reads to you. If they match, you *know* you reached the real
machine.

## `known_hosts` — your client's memory

When you answer `yes`, the fingerprint is recorded in **`~/.ssh/known_hosts`** on
your machine — one entry per server you've trusted. On every future connection,
your client silently compares the server's presented host key against this file:

- **Matches the saved entry** → connect silently. (This is why you only see the
  prompt *once* per server.)
- **No entry yet** → show the first-connection prompt above.
- **Entry exists but the key is different** → **stop, loudly.** See below.

So `known_hosts` is the list of *"servers I've decided to trust, and what their key
looked like."* It's purely client-side bookkeeping.

## The scary warning

One day you may hit this wall of hashes and capitals:

```text
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
…
Offending ED25519 key in /Users/you/.ssh/known_hosts:14
```

Read calmly, this means exactly one thing: **the server's host key no longer
matches the one you saved.** SSH refuses to connect because, in the worst case,
it *could* mean someone is impersonating your server (a "man-in-the-middle"). But
in practice it's usually innocent:

| Innocent cause | Why the key changed |
| --- | --- |
| The server was **rebuilt / reinstalled** | New install → new host key generated |
| You **recreated a VPS** at the same IP | Different machine, same address |
| An **IP was reassigned** to a different server | You're reaching a new box |
| The server's **SSH keys were rotated** | Deliberate admin action |

**What to do:** don't blindly delete the warning away. First ask *"did I expect
this machine to change?"* If you just rebuilt that server — yes, expected. If you
have no idea why it changed and it's a sensitive host — **stop and investigate**
(confirm with your provider/colleague) before trusting it.

Once you're satisfied it's legitimate, remove the stale entry and reconnect (you'll
get a fresh first-connection prompt):

```bash
ssh-keygen -R example.com
```

`-R` removes all `known_hosts` entries for that host. Next connection re-prompts,
and answering `yes` saves the new key.

## Why not just disable the check?

You *can* tell SSH to skip host verification, and you'll see people suggest it to
"make the warning go away." **Don't** make that a habit — it throws away the exact
protection this whole system provides, leaving you open to impersonation. The
warning is doing its job; the right response is to *understand why the key
changed*, not to silence the messenger.

## The symmetry, complete

You've now seen both identity checks that the connection chapter promised:

| | Who proves it | With what | Checked against |
| --- | --- | --- | --- |
| **Server → you** | The server | Its **host key** | Your **`known_hosts`** |
| **You → server** | You | Your **user key** | The server's **`authorized_keys`** |

Two key pairs, two files, pointing in opposite directions. Keep this table in mind
and no SSH identity message will ever fully surprise you again.

> **Key takeaways**
>
> - Every server has a **host key** proving its identity; the first-connection
>   prompt asks you to trust it (**trust-on-first-use**).
> - Trusted fingerprints are saved in **`~/.ssh/known_hosts`**; that's why you're
>   only prompted once per server.
> - **"REMOTE HOST IDENTIFICATION HAS CHANGED"** means the host key differs from
>   the saved one — usually a rebuilt server, occasionally something to
>   investigate.
> - Clear a stale entry with **`ssh-keygen -R <host>`**; don't just disable
>   host checking.
