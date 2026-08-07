---
title: "Keys on the Server: authorized_keys"
section: Keys & Authentication
order: 28
description: The server side of key auth — the authorized_keys file, how your public key gets there, and ssh-copy-id.
---

# Keys on the Server: authorized_keys

You've got your key pair on your laptop. For a server to let you in with it, the
server needs your **public** key on file. That "file" is literally a file, and
this chapter is all about it: **`~/.ssh/authorized_keys`** on the server.

## The idea

On the server, inside the home directory of the user you want to log in as, sits:

```text
/home/deploy/.ssh/authorized_keys
```

It's a plain text file. **Each line is one public key** that's allowed to log in
as that user (`deploy`, here). When you connect, the server looks through this
file for a public key matching the private key your client is proving it holds. A
match means you're in.

So "getting access to a server with your key" boils down to one concrete act:

> **Append your public key as a line in the target user's `authorized_keys` on the
> server.**

Everything else in this chapter is just *ways to do that append.*

## What a line looks like

Exactly the contents of your `id_ed25519.pub`:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILk…3f9Q you@example.com
```

Multiple people (or multiple of your machines) can log in as the same user by each
adding their own public-key line:

```text
ssh-ed25519 AAAAC3Nza…3f9Q  you@laptop
ssh-ed25519 AAAAC3Nza…7bQw  you@desktop
ssh-ed25519 AAAAC3Nza…k2Lp  teammate@theirmachine
```

Remove someone's access by deleting their line. That's the entire access-control
mechanism — refreshingly simple.

## The easy way: `ssh-copy-id`

If you *already* have some way to log in (a password, or the provider's initial
access), one command does the whole append correctly:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@example.com
```

It logs in, creates `~/.ssh` on the server if needed, appends your **public** key
to `authorized_keys`, and fixes permissions — all the fiddly steps in one go. It
asks for your password *this* time; after it's done, key login works and you
won't need the password again.

> **`ssh-copy-id` only ever copies the `.pub` file.** Even though you can point
> `-i` at the private key by name, it's smart enough to send the public half. Your
> private key stays put. Still, get in the habit of naming the `.pub` explicitly.

Windows PowerShell doesn't ship `ssh-copy-id`; see the manual method next (or the
one-liner in the "Getting Access" chapter).

## The manual way (good to understand)

When there's no `ssh-copy-id` — or you just want to see the machinery — you append
the key yourself. Conceptually:

1. Get the **text of your public key** (from your laptop): `cat ~/.ssh/id_ed25519.pub`.
2. On the **server**, ensure the `.ssh` folder and file exist with correct
   permissions.
3. **Append** that text as a new line in `~/.ssh/authorized_keys`.

A common one-liner that pipes your local public key straight into the server's file
over SSH:

```bash
cat ~/.ssh/id_ed25519.pub | ssh deploy@example.com \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Reading it: print your public key locally, pipe it through an SSH login, and on the
server make `~/.ssh` (700), **append** (`>>`) the incoming text to
`authorized_keys`, and set it to 600. The `>>` matters — it *adds a line* rather
than overwriting existing keys.

## Permissions matter here too

Just like your local `~/.ssh`, the **server** enforces strict permissions, and
this is a top cause of "I added my key but it still asks for a password":

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

If `authorized_keys` (or the home directory, or `~/.ssh`) is writable by others,
`sshd` may **silently ignore** the file and fall back to asking for a password —
no error explaining why. `ssh-copy-id` sets these correctly; the manual method is
where people trip. When key login mysteriously doesn't take, **check permissions on
the server first.**

## Cloud providers do this for you

When you create a server on most cloud platforms, the setup form asks you to
**paste a public key** (or pick one you've saved). The provider drops it into
`authorized_keys` on the new machine's default user *before it even boots* — so
you can key-login immediately, no password step at all. Under the hood it's the
same file; the provider just did the append for you. (The **Renting a Server**
chapter walks through this end to end.)

## The mental model, completed

Pairing this with the previous chapter, the two ends now meet:

```text
   YOUR LAPTOP                                THE SERVER
  ~/.ssh/id_ed25519      (private, stays)
  ~/.ssh/id_ed25519.pub  ──── appended ────▶  ~/.ssh/authorized_keys
```

Your **public key** is a **line in the server's `authorized_keys`**; your
**private key** never left home. Next we'll watch what happens across the wire when
these two halves actually authenticate a login.

> **Key takeaways**
>
> - A server grants key access via **`~/.ssh/authorized_keys`** — one public key
>   per line, in the target user's home.
> - **`ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host`** appends your public key
>   correctly (needs an existing login the first time).
> - Manually, you just **append** your `.pub` text to that file — never overwrite.
> - **Server-side permissions** (`700` on `~/.ssh`, `600` on `authorized_keys`)
>   are the #1 reason key login "silently" fails.
