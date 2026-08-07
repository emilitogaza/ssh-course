---
title: Welcome & How to Use This Course
section: Getting Started
order: 5
description: What this course covers, who it's for, and how to get the most out of it.
---

# Welcome to Port 22

This is a course about **SSH** — the tool you use to log into another computer
over the network and control it as if you were sitting in front of it. If you've
ever rented a server, deployed a website, pushed to GitHub, or followed a
tutorial that started with `ssh root@…`, you've touched SSH. This course is about
what's actually happening when you do.

It's named after **port 22**, the network "door" SSH knocks on by default. Don't
worry if that means nothing yet — by the end of the first few chapters it will.

## Who this is for

You can **code a little**. You're comfortable running commands in a terminal,
you've maybe generated an SSH key by copy-pasting from a README, but the whole
picture never clicked:

- What's the difference between the key on *my* laptop and the key on *the
  server*?
- Why does it say *"the authenticity of host … can't be established"* — and is it
  safe to type `yes`?
- Why do some servers let me in instantly and others say *"Permission denied
  (publickey)"*?
- How do I get access to a brand-new machine that's never heard of me?

If those questions feel familiar, you're in exactly the right place. You **don't**
need to be a sysadmin, a network engineer, or a cryptographer. Where we touch
cryptography, we'll keep it to the mental model — just enough to understand what's
happening, not enough to write your own.

## What you'll learn

- **The mental model** — clients and servers, ports and addresses, and what
  really happens in the second between pressing Enter and seeing a prompt
- **Key pairs, properly** — what a public and private key actually are, why the
  private one *never leaves your machine*, and where each one lives
- **How to get access** — generating a key, getting your public key onto a
  server, and logging in for the first time
- **Living in `~/.ssh`** — the config file that turns `ssh -p 2222 deploy@203.0.113.10`
  into just `ssh web`
- **Running your own box** — renting a cheap server, creating a user, adding your
  key, and locking down the defaults that get servers hacked
- **Reading the errors** — the handful of failures you'll actually hit, and how
  to decode them with `-v`
- **The good stuff beyond basics** — tunnels, port forwarding, jump hosts, and
  why your `git push` quietly uses SSH the whole time

## How this course is organised

The **sidebar on the left** groups chapters into sections — Getting Started, How
SSH Works, Keys & Authentication, Getting Access & Connecting, Running Your Own
Server, and Going Further. Use **Previous / Next** at the bottom of each page to
read in order, and the **"On this page"** rail on the right to jump between
sections of a chapter. On a phone, the **tray at the bottom** shows where you are
and opens the full chapter list.

You can read straight through — it's built to be read in order, each chapter
assuming the last — or skip to what you need.

## A note on the commands

Every command is real. You're encouraged to run them.

- Examples use **macOS / Linux** syntax, with **Windows (PowerShell)** notes where
  it differs. Modern Windows 10/11 ships the same OpenSSH client, so nearly
  everything works identically.
- Placeholder values look like `you@example.com` or `203.0.113.10` (that IP range
  is reserved for documentation — it's a safe stand-in for "your server's
  address").
- Nothing here will harm your machine. The one place you can lock *yourself* out
  of a **remote** server — hardening its SSH config — comes with a clearly marked
  safety net.

> **The golden rule, stated once up front:** your **private key is a secret**,
> like a password. It stays on your device. You never email it, paste it into a
> website, or copy it to a server. The **public key** is the half you hand out
> freely. If you remember only one thing from this course, make it that.

Ready? Start with **What Is SSH?**
