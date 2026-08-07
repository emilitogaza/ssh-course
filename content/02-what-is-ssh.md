---
title: What Is SSH?
section: Getting Started
order: 8
description: SSH in one sentence, the problem it solves, and the mental model of a secure remote shell.
---

# What Is SSH?

**SSH** stands for **Secure Shell**. In one sentence:

> SSH lets you open a terminal on a computer somewhere else and type commands
> into it, over the internet, with everything encrypted so nobody in between can
> read or tamper with it.

That's the whole idea. The rest of this course is detail on how it pulls that off
and how to use it well.

## The "shell" part

A **shell** is the program that reads the commands you type and runs them — `bash`,
`zsh`, PowerShell. When you open a terminal on your own laptop, you're talking to
a *local* shell.

SSH gives you a shell on a **remote** machine. You type `ls` and the *server's*
files are listed. You type `apt install nginx` and software is installed on the
*server*. Your keyboard is here; the computer doing the work is there. For most
purposes it feels exactly like a local terminal — just pointed at a different
machine.

## The "secure" part

SSH's ancestor was a program called **Telnet**, which did the same "remote shell"
job but sent everything — *including your password* — as plain, readable text
across the network. Anyone able to watch the traffic could read it. On today's
internet that's a non-starter.

SSH fixes this with **encryption**. Before you can type a single command, your
computer and the server perform a short negotiation (the **handshake**) that sets
up an encrypted tunnel. After that, every keystroke and every line of output is
scrambled in transit. Someone watching the network sees only noise.

Encryption also does something subtler and just as important: it lets you **verify
you're talking to the right machine**, so an attacker can't quietly impersonate
your server. We'll come back to that when we cover host keys.

## What people use SSH for

SSH is the front door to basically every server on the internet. A sampling:

| Task | What SSH does |
| --- | --- |
| **Managing a server** | Log into a rented Linux box to install software, edit config, read logs |
| **Deploying code** | Connect to a production machine to pull and restart your app |
| **Pushing to GitHub/GitLab** | `git push` over SSH authenticates you without typing a password |
| **Copying files** | `scp` and `sftp` move files across the same secure channel |
| **Tunnelling** | Reach a database or internal service that isn't exposed to the internet |
| **Remote development** | Editors like VS Code run a "remote" session over SSH |

If you end up doing any backend, DevOps, or infrastructure work, SSH stops being
a thing you occasionally copy-paste and becomes a tool you live in.

## The shape of a connection

Here's the entire interaction, in plain terms, before we zoom in over the next
chapters:

1. **You run a command** like `ssh you@a-server.com` from your terminal. Your
   machine is the **client**.
2. Your client **finds the server** on the network (its address) and knocks on
   its SSH **port** (22 by default).
3. The two sides **handshake** — they agree on encryption and set up the secure
   tunnel, and the server proves its identity to you.
4. **You prove who you are** — either with a password or, far better, with a
   **key**. This is the part that trips most people up, and it's the heart of the
   course.
5. You're in. You get a **shell prompt** on the server and start typing.
6. You type `exit` (or `logout`) and the tunnel closes.

## The one command to recognise

Almost everything starts from this shape:

```bash
ssh username@hostname
```

- `ssh` — the client program on your machine.
- `username` — *who you log in as* on the server (e.g. `root`, `ubuntu`, `deploy`).
- `hostname` — *which machine* — a domain like `example.com` or an IP address like
  `203.0.113.10`.

So `ssh deploy@203.0.113.10` means *"log into the machine at 203.0.113.10 as the
user `deploy`."* Keep that dissection in mind — the next two chapters unpack the
two halves: the **machines** talking (client and server) and the **address**
that connects them.

> **Key takeaways**
>
> - SSH = a **secure, encrypted remote shell**: a terminal on another computer.
> - It replaced Telnet, which sent everything (passwords included) in the clear.
> - Encryption also lets you **verify the server's identity**, not just hide the
>   traffic.
> - The universal shape is `ssh username@hostname` — *who* on *which machine*.
