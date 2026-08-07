---
title: Renting a Server & First Login
section: Running Your Own Server
order: 60
description: From "I have no server" to a shell prompt on your own cloud machine — what a VPS is, how to create one with your key, and first steps once you're in.
---

# Renting a Server & First Login

The best way to *really* learn SSH is to have a server of your own to poke at. A
small cloud machine costs a few dollars a month (or is free on some trials), and
setting one up ties together everything so far: keys, access, host keys, the lot.
This chapter walks the whole path, from signing up to your first prompt.

## What a VPS is

A **VPS** (Virtual Private Server) is a slice of a larger physical machine in a
data centre, rented to you as if it were a whole computer. You get a public IP,
root access, and a fresh Linux install to do as you like with. Providers you'll
see: **DigitalOcean, Hetzner, Linode, Vultr, Scaleway**, and the big clouds
(**AWS EC2, Google Cloud, Azure**). For learning, a "€4/month" or smallest-size
instance is plenty.

> This is a great sandbox precisely because it's disposable. If you break it, you
> **destroy and recreate** it in a minute. There's no better way to lose the fear
> of the command line than owning a server you're allowed to wreck.

## Step 1 — Have your key ready

Before creating anything, make sure you have a key pair (from the earlier chapter)
and grab the **public** half to paste:

```bash
cat ~/.ssh/id_ed25519.pub
# macOS:   pbcopy < ~/.ssh/id_ed25519.pub
# Windows: Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
```

## Step 2 — Create the server with your key attached

In the provider's "create" flow you'll choose:

- **An image / OS** — pick **Ubuntu LTS** (the friendliest, best-documented
  choice).
- **A size** — the smallest available is fine.
- **A region** — closest to you for lower latency.
- **SSH keys** — the important bit: **add/paste your public key here.** The
  provider writes it into the new machine's `authorized_keys` before boot.

> **Choose key auth, not a password, if asked.** Some providers otherwise email you
> a root password. Attaching your key from the start means you never handle a
> password and the machine is key-only immediately.

A minute later you'll have a running server and a **public IP** (e.g.
`203.0.113.10`).

## Step 3 — First login

Log in as the image's default user — for Ubuntu on most providers that's `root`
(some use `ubuntu`):

```bash
ssh root@203.0.113.10
```

You'll meet the **host-key prompt** (first connection — type `yes`, it saves to
your `known_hosts`), then, because your key is already enrolled, you're dropped
straight to a prompt:

```text
root@ubuntu-s-1vcpu-1gb-lon1:~#
```

You're on your own server. That `#` (rather than `$`) is a subtle signal you're
**root** — the all-powerful administrator. Which brings us to safety.

## Step 4 — Get your bearings

A few read-only commands to see what you've got:

```bash
hostname          # the server's name
lsb_release -a    # which Ubuntu version
df -h             # disk space
free -h           # memory
whoami            # 'root'
ip addr           # network addresses
```

## Step 5 — Update the system

First habit on any fresh server — pull the latest security updates:

```bash
apt update && apt upgrade -y
```

(`apt` is Ubuntu/Debian's package manager. On other distros it's `dnf`, `yum`, or
`pacman`.)

## Don't stop at root

You *can* run everything as root, but you **shouldn't** — one typo as root can
wreck the box, and leaving `root` open to SSH is a magnet for attacks. The very
next chapter fixes this properly: create a normal user for yourself, give it admin
rights via `sudo`, enrol your key for it, and stop logging in as root. Do that
before you put anything real on the machine.

## When you're done experimenting

Because it's disposable, tear it down when you like — providers bill by the hour,
and **destroying** the server (from their dashboard) stops charges. If you recreate
one later at the same IP, remember you'll hit the **"host identification has
changed"** warning — expected, because it's genuinely a new machine; clear it with
`ssh-keygen -R 203.0.113.10` and reconnect.

## The whole flow at a glance

```text
  Create VPS (paste public key)  ─▶  ssh root@IP  ─▶  update  ─▶  make a user (next)
        │                                 │
   provider writes your            host-key prompt once,
   key to authorized_keys          then straight in (key auth)
```

Everything you configured in the abstract — key on the client, public key in
`authorized_keys`, host key in `known_hosts` — you just watched happen on a real
machine. Now let's make it a machine you can use safely.

> **Key takeaways**
>
> - A **VPS** is a cheap, disposable cloud Linux box — the ideal SSH practice
>   ground.
> - **Paste your public key** during creation so the server is **key-only from
>   first boot**; log in as the default user (`root`/`ubuntu`).
> - First habits: answer the host-key prompt, **`apt update && apt upgrade`**, look
>   around.
> - **Don't stay as root** — the next chapter creates a proper user with `sudo`.
