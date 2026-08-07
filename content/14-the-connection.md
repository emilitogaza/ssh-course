---
title: What Happens When You Connect
section: How SSH Works
order: 14
description: A step-by-step walk through the SSH handshake — from TCP connection to encrypted tunnel to authentication — without the heavy maths.
---

# What Happens When You Connect

Press Enter on `ssh deploy@example.com` and a surprising amount happens in the
next fraction of a second. You don't need to memorise it, but seeing the sequence
once makes every later topic — host keys, key authentication, the scary warnings —
fall into place. Here's the whole dance, in order.

## Step 1 — Open a plain connection

First the client makes an ordinary network connection to the server's IP on port
22 (this is **TCP**, the basic "reliable pipe" the internet is built on). At this
instant nothing is secret yet — it's just a raw channel. Everything that follows
is about turning that raw channel into a *trusted, encrypted* one **before** any
password or command is sent.

## Step 2 — Agree on the rules

The two sides exchange a quick hello: their SSH versions and the lists of
encryption methods each supports. They pick the strongest options they have in
common — which cipher will scramble the data, which method will set up the shared
secret, and so on. This is just both parties agreeing on a common language.

## Step 3 — Set up the encrypted tunnel (key exchange)

Now the clever part. Over that open, *visible* channel, the client and server
need to agree on a **secret key** that only the two of them know — without ever
sending the secret across the wire, because anyone could be watching.

They do this with a **key exchange** (the classic method is called
Diffie–Hellman). The maths is genuinely beautiful, but the outcome is all you
need:

> Two parties who have never met can, by exchanging some public numbers in the
> open, each independently compute the **same shared secret** — while an
> eavesdropper who saw every message exchanged **cannot** work out that secret.

From this point on, both sides have an identical **session key** and switch on
**encryption**. The tunnel is now private. Everything after this step — your
username, your authentication, every keystroke — is scrambled.

The next chapter explains the "public numbers, private secret" trick a little
more, because it's the same idea that makes key *pairs* work.

## Step 4 — The server proves who it is (host key)

Encryption alone isn't enough. You have a private tunnel — but *to whom?* If an
attacker had quietly intercepted your connection, you'd have a perfectly encrypted
tunnel straight to **them**. So the server must prove its identity.

Every server has its own **host key** — a key pair identifying that specific
machine. During the handshake the server uses its host key to prove it's the same
server it claims to be. Your client checks that proof against its memory of this
server, stored in a file called **`known_hosts`**:

- **First time connecting?** Your client has never seen this server, so it can't
  vouch for it. That's the famous prompt:

  ```text
  The authenticity of host 'example.com (203.0.113.10)' can't be established.
  ED25519 key fingerprint is SHA256:Ux2C…9plQ.
  Are you sure you want to continue connecting (yes/no/[fingerprint])?
  ```

  Typing `yes` tells your client *"I trust this is the right machine — remember
  it."* It saves the server's fingerprint to `known_hosts`.

- **Been here before?** Your client silently compares the server's host key to the
  saved one. Match → carry on. **Mismatch → it stops you with a loud warning**,
  because a changed host key can mean someone is impersonating the server.

This whole scheme has its own chapter later (**Host Keys & known_hosts**). For now,
just know: **step 4 is the server proving itself to you.**

## Step 5 — You prove who you are (authentication)

Now the roles flip. The server has proven itself; **you** have to prove you're
allowed in. This is **authentication**, and it happens *inside* the already-
encrypted tunnel. Two common ways:

- **Password** — you type the account's password. Simple, but weaker (guessable,
  phishable, sent every login).
- **Public key** — your client proves it holds the **private key** matching a
  **public key** the server has on file. No secret crosses the wire, nothing to
  type, much stronger.

The entire **Keys & Authentication** section is about that second method — how it
works and why it's the right default. For now, place it in the sequence: **step 5
is you proving yourself to the server.**

## Step 6 — You're in

Authentication succeeds, the server starts a **shell** for your user, and its
prompt appears in your terminal. From here, everything you type travels down the
encrypted tunnel to that shell, and its output travels back. You're working on the
remote machine.

Type `exit` and the shell ends, the tunnel tears down, and you're back on your own
machine.

## The sequence in one view

| Step | What happens | Who's proving what |
| --- | --- | --- |
| 1 | Open TCP connection to port 22 | — (nothing secret yet) |
| 2 | Agree on versions and ciphers | — |
| 3 | **Key exchange** → shared session key → **encryption on** | — |
| 4 | Server presents its **host key** | **Server → you** |
| 5 | **Authentication** (password or key) | **You → server** |
| 6 | Shell starts; you're logged in | — |

Two separate identity checks, pointing in opposite directions, are the thing to
hold onto: in **step 4 the server proves itself to you**, and in **step 5 you
prove yourself to the server**. Mixing those two up is the root of a lot of
confusion — including the classic panic over "the host key changed" (a step‑4
issue) versus "permission denied" (a step‑5 issue).

> **Key takeaways**
>
> - SSH builds an **encrypted tunnel first** (steps 1–3), *then* does the identity
>   checks inside it.
> - **Step 4:** the server proves itself with its **host key** (that's the
>   first-connection prompt and the `known_hosts` file).
> - **Step 5:** you prove yourself by **password or key** — the subject of the
>   whole next section.
> - Server-proving-itself and you-proving-yourself are **two different steps in
>   opposite directions.**
