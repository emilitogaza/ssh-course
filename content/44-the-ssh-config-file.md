---
title: The SSH Config File
section: Getting Access & Connecting
order: 44
description: Turning long ssh commands into short aliases with ~/.ssh/config — the single quality-of-life upgrade everyone should make.
---

# The SSH Config File

If you take one *practical* habit from this course, make it this. The
**`~/.ssh/config`** file lets you name your servers and store their settings, so a
mouthful like:

```bash
ssh -p 2222 -i ~/.ssh/id_ed25519_work deploy@203.0.113.10
```

becomes simply:

```bash
ssh web
```

Same connection, a fraction of the typing, and nothing to memorise. Here's how.

## The file

It lives at **`~/.ssh/config`** (create it if it's missing — plain text). Each
server is a **`Host`** block:

```text
Host web
    HostName 203.0.113.10
    User deploy
    Port 2222
    IdentityFile ~/.ssh/id_ed25519_work
```

Now `ssh web` expands to all of that. Read the block as:

- **`Host web`** — the **nickname** you'll type (`ssh web`). Your choice, anything
  memorable.
- **`HostName`** — the real address (IP or domain) to actually connect to.
- **`User`** — the account to log in as (no more `deploy@`).
- **`Port`** — the port, if not 22 (no more `-p`).
- **`IdentityFile`** — which private key to use (no more `-i`).

Only `HostName` is really needed; the rest are optional overrides of the defaults.

## Several servers, one file

Stack as many blocks as you like:

```text
Host web
    HostName 203.0.113.10
    User deploy

Host db
    HostName 203.0.113.20
    User deploy
    Port 2222

Host pi
    HostName 192.168.1.50
    User pi
```

```bash
ssh web     # deploy@203.0.113.10:22
ssh db      # deploy@203.0.113.20:2222
ssh pi      # pi@192.168.1.50:22
```

The aliases also flow into other tools: **`scp file web:/tmp`** and
**`sftp db`** understand the same nicknames. Define a host once, use it everywhere.

## Defaults for every host

A `Host *` block applies to **all** connections — handy for global preferences:

```text
Host *
    AddKeysToAgent yes
    ServerAliveInterval 60
    IdentityFile ~/.ssh/id_ed25519
```

- **`AddKeysToAgent yes`** — auto-load keys into the agent on first use (pair with
  `UseKeychain yes` on macOS).
- **`ServerAliveInterval 60`** — send a keepalive every 60s so idle sessions don't
  drop (a fix for connections that die after a few quiet minutes).
- A default **`IdentityFile`** used when a host block doesn't name its own.

Specific `Host` blocks combine with `Host *`; put `Host *` at the **bottom**, since
for any setting SSH takes the **first** value it finds as it reads top to bottom.

## Genuinely useful options

A few that repay knowing:

| Option | What it does |
| --- | --- |
| `IdentitiesOnly yes` | Offer **only** the `IdentityFile` named here — fixes "Too many authentication failures" when your agent has many keys |
| `ForwardAgent yes` | Forward your agent to this host (only for hosts you trust — see the jump-hosts chapter) |
| `ProxyJump bastion` | Reach this host *through* another one in a single command (jump hosts chapter) |
| `RequestTTY yes` | Force an interactive terminal for commands that need one |
| `LogLevel VERBOSE` | Extra detail without typing `-v` each time |

You don't need these on day one — but when a problem calls for one, you'll know
where it goes.

## Comments and organisation

Lines starting with `#` are comments. Group and label as your list grows:

```text
# ---- Production ----
Host web
    HostName 203.0.113.10
    User deploy

# ---- Home lab ----
Host pi
    HostName 192.168.1.50
    User pi
```

## Permissions

Like everything in `~/.ssh`, keep the config private:

```bash
chmod 600 ~/.ssh/config
```

Not strictly required, but tidy and consistent with the rest of the folder.

## Why this matters more than it looks

Beyond saving keystrokes, the config file is *documentation you actively use*: a
readable inventory of every machine you touch, each with the right user, port, and
key baked in. It removes a whole category of mistakes — wrong user, wrong key,
forgotten port — and it makes the fancier features later (jump hosts, forwarding)
a one-line addition instead of an ever-growing command. Set it up early; thank
yourself constantly.

> **Key takeaways**
>
> - **`~/.ssh/config`** maps a short **`Host` alias** to `HostName`, `User`,
>   `Port`, and `IdentityFile` — so `ssh web` replaces a long command.
> - The same aliases work with **`scp`** and **`sftp`**.
> - **`Host *`** sets defaults for everything; SSH uses the **first** matching
>   value, so put wildcards last.
> - **`IdentitiesOnly yes`** is the cure for "Too many authentication failures".
