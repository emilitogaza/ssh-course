---
title: Your Local ~/.ssh Folder
section: Keys & Authentication
order: 26
description: A tour of the ~/.ssh directory on your own machine — the files inside, what each does, and the permissions SSH insists on.
---

# Your Local ~/.ssh Folder

On your own machine, everything SSH knows about lives in one hidden folder:
**`~/.ssh`**. Knowing what's in it — and why the permissions matter — turns a lot
of "it just won't let me in" moments into quick fixes.

`~` means your home directory, so this is `/Users/you/.ssh` on macOS,
`/home/you/.ssh` on Linux, `C:\Users\you\.ssh` on Windows. It's hidden (the
leading dot), so list it explicitly:

```bash
ls -la ~/.ssh
```

## The files you'll find

Not all of these exist at once — they appear as you use SSH:

| File | What it is | Secret? |
| --- | --- | --- |
| `id_ed25519` | Your **private key** | **Yes — never share** |
| `id_ed25519.pub` | Your **public key** | No — shareable |
| `known_hosts` | Fingerprints of **servers you've connected to** | No |
| `config` | Your **per-host settings** and shortcuts | No |
| `authorized_keys` | Public keys allowed to log into **this** machine | No |

Two of these often confuse people, so let's be clear about the difference.

### `known_hosts` — servers *you* trust

Every time you connect to a new server and answer `yes` to the authenticity
prompt, SSH records that server's **host key fingerprint** here. On later
connections it checks the server against this list to make sure it's still the same
machine. This file is about **which servers your client has decided to trust** —
it's the client-side memory behind the "host key changed" warning. Its own chapter
comes shortly.

### `authorized_keys` — who may log into *you*

This is the mirror image, and it only matters if *your* machine is acting as a
**server** (something is SSHing *in*). It lists the **public keys permitted to log
in** as your user. On your laptop it's usually empty or absent. On a server, this
is *the* file that grants access — and copying your public key **into the server's**
`authorized_keys` is exactly how you get in. (Next chapter.)

> **The easy way to keep them straight:**
> **`known_hosts`** = *"servers I trust to connect **to**."*
> **`authorized_keys`** = *"keys I trust to connect **in**."*
> One is outbound, one is inbound.

## Permissions: SSH is deliberately strict

SSH will **refuse to use** keys if their files are too open — on the sensible logic
that a private key readable by other users on the machine isn't really private. If
you ever see:

```text
Permissions 0644 for '/Users/you/.ssh/id_ed25519' are too open.
This private key will be ignored.
```

…that's this rule biting. The fix is to tighten permissions:

```bash
chmod 700 ~/.ssh              # the folder: only you may enter it
chmod 600 ~/.ssh/id_ed25519   # the private key: only you may read/write
chmod 644 ~/.ssh/id_ed25519.pub   # public key: world-readable is fine
chmod 600 ~/.ssh/config       # if you have one
```

The numbers are Unix permission codes; the intent is simple: **the folder and the
private key must be accessible to you and nobody else.** `700` = "owner may
read/write/enter, others get nothing." `600` = "owner may read/write, others get
nothing."

> **Windows** doesn't use `chmod`; it has its own permissions model, and the
> OpenSSH client checks the file's owner/ACLs instead. If a key is "ignored" on
> Windows, the fix is to ensure your user account is the file's owner and remove
> inherited permissions — searchable as "Windows SSH key permissions."

## If the folder doesn't exist

Perfectly normal on a fresh machine — `ssh-keygen` creates it for you when you
generate a key. To make it by hand with the right permissions:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

## A note on backups

Your private key is not automatically backed up anywhere, and it's the one thing
here you can't regenerate identically. If your disk dies, that identity is gone
(you'd generate a new pair and re-enrol its public key on each server). Some
people back up their private key to an encrypted store; at minimum, know that
**losing the file means losing that key** — not catastrophic, just a round of
re-enrolling. This is also why a **passphrase** matters: a backup of an
*encrypted* private key is far less scary if it leaks.

With the local side mapped, let's cross to the other end of the connection — the
server, and the `authorized_keys` file that decides whether you get in.

> **Key takeaways**
>
> - Everything SSH knows locally lives in **`~/.ssh`**.
> - **`known_hosts`** = servers your client trusts to connect *to*;
>   **`authorized_keys`** = keys allowed to connect *in*. Don't mix them up.
> - SSH **refuses keys with loose permissions** — keep `~/.ssh` at `700` and the
>   private key at `600`.
> - Your private key isn't backed up by magic; **losing it means re-enrolling a
>   new one.**
