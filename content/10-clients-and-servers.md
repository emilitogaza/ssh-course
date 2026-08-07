---
title: "Clients & Servers: The Two Sides"
section: How SSH Works
order: 10
description: The two roles in every SSH connection — the client you type on and the server you reach — and the software on each side.
---

# Clients & Servers: The Two Sides

Every SSH connection has exactly two participants, and it pays to be crystal clear
about which is which — because the keys, the config, and the errors all differ
depending on the side you're standing on.

## The client: your side

The **client** is the machine you're sitting at — your laptop, your desktop. It
runs the `ssh` **command**, which is part of a software suite called **OpenSSH**.
The client *initiates* the connection: it reaches out, knocks, and asks to be let
in.

You already have a client. It ships with:

- **macOS** — built in. Open Terminal and type `ssh`.
- **Linux** — built in (or a `apt install openssh-client` away).
- **Windows 10/11** — the OpenSSH client is included. Open PowerShell and type
  `ssh`.

Quick check that it's there:

```bash
ssh -V
```

You'll see something like `OpenSSH_9.6p1`. That's the client program and its
version.

## The server: the other side

The **server** is the machine you're logging into. For it to accept SSH
connections, it must be running a piece of software that *listens* for them: the
**SSH daemon**, `sshd` ("d" for daemon — a program that runs quietly in the
background). While the client reaches out, the daemon sits and waits.

> A **daemon** is just a long-running background service. `sshd` is the part of
> OpenSSH that waits for incoming SSH connections and handles them. No `sshd`
> running on a machine means no way to SSH into it — the knock goes unanswered.

When you rent a Linux server from a cloud provider, `sshd` is almost always
already installed and running — that's how you're expected to get in. When you
set up your own machine, installing and starting `sshd` is what turns it into
something you can SSH *to*.

## Same program, two roles

Here's a point that clears up a lot of confusion: **OpenSSH is one package that
contains both sides.** The client tools (`ssh`, `scp`, `ssh-keygen`) and the
server (`sshd`) come from the same project. A single machine can be **both** — a
server you SSH *into*, which then SSHes *out* to another server. Client and server
are **roles in a connection**, not permanent labels on a machine.

For this course, keep the roles straight:

| | **Client** | **Server** |
| --- | --- | --- |
| Which machine | The one you type on | The one you're reaching |
| Program | `ssh` | `sshd` |
| Role | Starts the connection | Waits and answers |
| Your private key | **Lives here** | never sent here |
| Your public key | copied *from* here | **stored here** (in `authorized_keys`) |

That last pair of rows is the crux of the whole course. The **private key stays
on the client**; a copy of the **public key goes to the server**. If that sounds
abstract now, it won't by the end of the Keys section — but anchoring it to
"client vs server" from the start makes everything downstream click.

## "Remote" and "local", the words

You'll see **local** and **remote** everywhere:

- **Local** = the client, your machine, "here".
- **Remote** = the server, the other machine, "there".

So "copy your public key to the remote" means "put it on the server", and "run
this locally" means "run it on your own laptop". When a tutorial says *"on the
remote host…"*, mentally translate: *the machine I'm SSHing into.*

## A tiny bit of network

For the client to reach the server, three things have to line up. The next chapter
takes each in turn, but in brief:

1. The server must be **reachable** on the network (it has an address).
2. The server must be **listening** for SSH (the `sshd` daemon is running).
3. That listening must be on a **port** the client knocks on (22 by default).

If any one is missing, you get a specific, recognisable error — and knowing which
of the three failed is half of troubleshooting. We'll build that address-and-port
picture next.

> **Key takeaways**
>
> - Every connection is a **client** (`ssh`, initiates) talking to a **server**
>   (`sshd`, listens).
> - Both sides come from the same **OpenSSH** package; "client" and "server" are
>   roles, not fixed identities.
> - **Local = your machine; remote = the server.**
> - Your **private key lives on the client**; your **public key goes on the
>   server**. Everything else builds on that split.
