---
title: Encryption in Plain Terms
section: How SSH Works
order: 16
description: Just enough cryptography to understand SSH — symmetric vs asymmetric keys, and the padlock analogy that makes key pairs make sense.
---

# Encryption in Plain Terms

You can use SSH for years without understanding the cryptography under it. But a
*little* understanding — specifically the difference between two kinds of
encryption — is what finally makes public and private keys stop feeling like
magic. This chapter is that little bit. No maths, just the ideas.

## Encryption is reversible scrambling

To **encrypt** something is to scramble it using a **key** (a big secret number)
so it looks like noise. To **decrypt** is to unscramble it with the right key.
Without the key, the scrambled data is useless. That's it.

The interesting question is *which key unlocks what*, and there are two very
different answers.

## Kind 1 — Symmetric: one shared key

**Symmetric** encryption uses the **same key** to lock and unlock. Like a physical
door key that both locks and opens: anyone with a copy can do both.

- **Fast** — great for large amounts of data.
- **The catch:** both sides need the *same* key, so how do you get it to the other
  side without an eavesdropper grabbing a copy in transit?

SSH uses symmetric encryption for the **bulk of the conversation** — every
keystroke and every line of output, once the tunnel is up — because it's fast.
The shared key it uses is the **session key** the handshake produced. Which
raises exactly that catch: how did both sides get the same session key without
sending it across a channel anyone could read? Enter the second kind.

## Kind 2 — Asymmetric: a key *pair*

**Asymmetric** encryption (also called **public-key** cryptography) uses **two
different but mathematically linked keys**, generated together as a pair:

- a **public key** you can hand to anyone, and
- a **private key** you keep utterly secret.

Their superpower is that they're **inverses**:

> What one key locks, **only the other** can unlock.

That simple property does two enormously useful jobs.

### Job A — Anyone can send you a secret

If someone encrypts a message with **your public key**, only **your private key**
can decrypt it. So you can publish your public key to the world, and anyone can
send you something only you can read. The public key locks; only the private key
opens.

### Job B — You can prove who you are (signatures)

Run it the other way. If **you** encrypt something with **your private key**,
anyone can check it with **your public key**. Since only you have the private key,
a message that your public key successfully "unlocks" *must* have come from you.
That's a **digital signature** — proof of identity without revealing the secret.

**Job B is exactly how SSH key login works.** The server has your public key. To
let you in, it challenges your client to prove it holds the matching private key —
which your client does by signing something, *without ever sending the private key
across the network.* (Full walk-through in **How Key Authentication Actually
Works**.)

## The padlock analogy

The classic way to feel this:

- Your **public key** is an **open padlock** you make endless copies of and hand
  out freely. Anyone can snap it shut on a box.
- Your **private key** is the **only key** that opens those padlocks. You keep it
  in your pocket.

Someone wants to send you something private? They lock the box with your padlock
and ship it. Only your private key opens it — not even the person who locked it can
reopen it. Distributing padlocks is safe; **guarding the one key is everything.**

That asymmetry is the reason your public key can be pasted into a server, emailed,
committed to a repo — no harm done — while the private key must never leave your
machine.

## How SSH uses both

SSH is clever: it uses **each kind for what it's best at**.

| | Asymmetric (key pairs) | Symmetric (session key) |
| --- | --- | --- |
| Keys | Public + private pair | One shared key |
| Speed | Slower | Fast |
| Used for | The **handshake**: agreeing a shared secret, and proving identities | The **session**: encrypting all the actual data |
| In SSH | Host key check + your key login | Every keystroke and output byte |

The sequence, tying back to the last chapter: asymmetric techniques bootstrap the
connection — safely establishing a shared session key over an open channel and
verifying who's who — and then the fast symmetric encryption takes over for the
real traffic. Best of both.

## What you actually need to remember

You will *not* be quizzed on Diffie–Hellman. For everything ahead, this is the
load-bearing idea:

> A **key pair** is two linked keys. The **public** one you give away; the
> **private** one you guard. What one locks, only the other unlocks — so holding
> the private key proves your identity **without ever sending it anywhere.**

Hold onto that and the entire Keys section is just details.

> **Key takeaways**
>
> - **Symmetric** = one shared key, fast, used for the bulk session data.
> - **Asymmetric** = a **public + private pair**; what one locks only the other
>   unlocks.
> - A public key can be shared freely; the private key must stay secret — that
>   asymmetry is the whole point.
> - SSH uses asymmetric crypto to **set up and authenticate**, then symmetric to
>   **run the session**.
