---
title: Generating Your Key Pair
section: Keys & Authentication
order: 24
description: Using ssh-keygen to create a modern ed25519 key pair, what every prompt means, and how to read the two files you get.
---

# Generating Your Key Pair

Time to make the two files. The tool is **`ssh-keygen`**, part of OpenSSH, already
on your machine. This chapter creates a modern key pair and explains every prompt
so nothing is mysterious.

## The one command

```bash
ssh-keygen -t ed25519 -C "you@example.com"
```

That's it — but let's read it:

- **`ssh-keygen`** — the key-generation tool.
- **`-t ed25519`** — the **type** of key. `ed25519` is the modern default: small,
  fast, and very secure. Prefer it.
- **`-C "you@example.com"`** — a **comment**, just a label tacked onto the end of
  the public key so you can tell whose/which key it is later. An email or
  `me@laptop` is conventional. Purely cosmetic.

> **Which type?** Use **`ed25519`**. You'll also see **`rsa`** in older guides — if
> you ever need it (a legacy system that doesn't support ed25519), generate a
> strong one with `ssh-keygen -t rsa -b 4096`. Avoid old `dsa`/`ecdsa` unless
> something specifically requires them. For the whole course, `ed25519` is the
> answer.

## The prompts, one by one

`ssh-keygen` asks two things.

### 1. Where to save it

```text
Enter file in which to save the key (/Users/you/.ssh/id_ed25519):
```

Press **Enter** to accept the default, `~/.ssh/id_ed25519`. That default is where
the SSH client automatically looks, so accepting it means things "just work"
later. Only type a path if you deliberately want a second, separately named key
(e.g. `~/.ssh/id_ed25519_work`) — in which case you'll later tell SSH about it via
the config file.

> **Careful:** if a key with that name already exists, it asks *"Overwrite?"*
> Answer **no** unless you're certain — overwriting destroys the old private key,
> and any server trusting the old public key will stop letting that key in.

### 2. A passphrase

```text
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```

This encrypts the **private key file** itself with a password of your choosing.
**Set one.** It's the safety net: if someone ever copies your private key file,
the passphrase still stands between them and using it.

"But won't I have to type it every login?" No — the **ssh-agent** remembers it
after the first use, so in practice you type it once per session. That's the next
chapter; for now, just **choose a good passphrase** and continue. (Pressing Enter
twice makes an *unencrypted* key — fine for throwaway automation, not for your
personal key.)

## What you just made

`ssh-keygen` prints a confirmation and a "randomart" picture (a visual
fingerprint — harmless, ignore it). Look in your `~/.ssh` folder:

```bash
ls -l ~/.ssh
```

```text
-rw-------  1 you  staff  411 Aug  7 09:30 id_ed25519       ← PRIVATE  (secret)
-rw-r--r--  1 you  staff  102 Aug  7 09:30 id_ed25519.pub   ← PUBLIC   (shareable)
```

Two files, exactly as promised:

- **`id_ed25519`** — your **private key**. Notice the permissions `-rw-------`
  (owner-only). Guard this file. Never copy it to a server or paste it anywhere.
- **`id_ed25519.pub`** — your **public key**. Safe to share.

### Look at the public key

It's a single line of text — genuinely fine to print, paste, and share:

```bash
cat ~/.ssh/id_ed25519.pub
```

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILk…3f9Q you@example.com
```

Three parts: the **type** (`ssh-ed25519`), the **key material** (the long blob),
and your **comment** (`you@example.com`). *This* line is what goes into a server's
`authorized_keys`, gets pasted into GitHub, and so on. Get comfortable — you'll
copy it often.

### Do *not* look at the private key (well, know what it is)

For contrast, the private key begins:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAAB…
```

If you ever see a website or "helpful" script asking you to paste something that
starts with `BEGIN … PRIVATE KEY`, **stop** — that's the secret half, and it
should never leave your machine. The only file you ever hand out is the `.pub`.

## Windows note

The exact same command works in **PowerShell** on Windows 10/11:

```powershell
ssh-keygen -t ed25519 -C "you@example.com"
```

Your keys land in `C:\Users\you\.ssh\` instead of `~/.ssh/`, but everything else
is identical.

## You now have an identity

That key pair *is* your SSH identity. In the next chapters you'll learn where it
lives in detail, then put the public half onto a server so it recognises you. You
only need to do this generation step **once per machine** — reuse the same pair
everywhere.

> **Key takeaways**
>
> - Generate with **`ssh-keygen -t ed25519 -C "you@example.com"`**.
> - Accept the **default location** (`~/.ssh/id_ed25519`) so SSH finds it
>   automatically.
> - **Set a passphrase** — it protects the private key file if it's ever stolen.
> - You get two files: **`id_ed25519`** (private, secret) and
>   **`id_ed25519.pub`** (public, the one-line string you share).
