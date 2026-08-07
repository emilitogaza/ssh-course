---
title: "Common Errors & How to Read Them"
section: Going Further
order: 80
description: The handful of SSH errors you'll actually hit — what each one means, the real cause, and how to fix it.
---

# Common Errors & How to Read Them

SSH's error messages look intimidating but are actually a small, finite set. Learn
these half-dozen and you'll diagnose almost anything. For each: what it says, what
it *means*, and how to fix it. Skim now; come back when one bites.

## `Connection refused`

```text
ssh: connect to host example.com port 22: Connection refused
```

**Means:** you reached the machine, but **nothing is listening** on that port. The
door exists; it's shut.

**Usual causes & fixes:**

- `sshd` isn't running on the server → start it (`sudo systemctl start ssh`), if
  you have another way in.
- SSH is on a **different port** → try `ssh -p 2222 …`.
- A **firewall** is blocking the port → open it.

Contrast with "timed out" below — "refused" means something actively said *no*.

## `Connection timed out`

```text
ssh: connect to host example.com port 22: Connection timed out
```

**Means:** the knock went unanswered — you couldn't reach the machine at all. No
one said no; no one said anything.

**Usual causes & fixes:**

- **Wrong IP/hostname**, or the server is **off/rebooting** → double-check the
  address; is it up in your provider's dashboard?
- A **firewall/security group** silently drops the traffic → allow inbound 22 (very
  common on AWS/GCP — check the security group).
- The server is on a **private network** you're not on → you need a VPN, tunnel, or
  jump host.

## `Could not resolve hostname`

```text
ssh: Could not resolve hostname exmaple.com: nodename nor servname provided
```

**Means:** **DNS** couldn't turn that name into an IP — SSH never even tried to
connect.

**Fixes:** check the spelling (`exmaple`?), confirm the domain exists
(`ping thename.com`), or connect by **IP** to bypass DNS entirely.

## `Permission denied (publickey)`

```text
deploy@example.com: Permission denied (publickey).
```

The one everyone meets. **Means:** you reached SSH fine, but **authentication
failed** — the server didn't accept any key you offered (and password auth is off,
hence only `publickey` listed).

**Work through, most common first:**

1. **Wrong user?** `ssh ubuntu@…` vs `ssh root@…` — the key must be in *that
   user's* `authorized_keys`. A perfect key as the wrong user still fails.
2. **Key not enrolled** on the server → add your **public** key to
   `~/.ssh/authorized_keys` (`ssh-copy-id`, or manually).
3. **Server-side permissions** too loose → on the server, `chmod 700 ~/.ssh` and
   `chmod 600 ~/.ssh/authorized_keys`; the home dir must not be group/word
   writable. `sshd` silently ignores keys in badly-permissioned files.
4. **Client not offering the right key** → `ssh -i ~/.ssh/id_ed25519 …`, or set
   `IdentityFile` in your config.
5. **Diagnose with `-v`** → `ssh -v …` shows which keys were offered and whether
   any were accepted (next chapter).

## `Too many authentication failures`

```text
Received disconnect from … : Too many authentication failures
```

**Means:** your client offered **too many keys** in a row (often because
`ssh-agent` holds several) and the server cut you off before reaching the right
one.

**Fix:** tell SSH to offer only the correct key:

```bash
ssh -o IdentitiesOnly=yes -i ~/.ssh/id_ed25519 deploy@example.com
```

…or, permanently, add `IdentitiesOnly yes` and the right `IdentityFile` to that
host's config block.

## `Host key verification failed` / "IDENTIFICATION HAS CHANGED"

```text
@@@ WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED! @@@
…
Host key verification failed.
```

**Means:** the server's **host key** doesn't match what's saved in your
`known_hosts`. Covered fully in the host-keys chapter.

**Fix (once you've confirmed the change is legitimate** — e.g. you rebuilt the
server):

```bash
ssh-keygen -R example.com     # remove the stale entry, then reconnect
```

If you *can't* explain the change on a sensitive host, **investigate before
trusting it.**

## `Permissions 0644 … are too open`

```text
Permissions 0644 for '/Users/you/.ssh/id_ed25519' are too open.
This private key will be ignored.
```

**Means:** your **private key file (locally)** is readable by others, so SSH
refuses to use it.

**Fix:**

```bash
chmod 600 ~/.ssh/id_ed25519
chmod 700 ~/.ssh
```

## `Connection closed by remote host` / dropped after idle

**Means:** the server (or a device in between) closed the connection — sometimes a
firewall/NAT timing out an idle session.

**Fix:** add a keepalive so idle sessions survive, in `~/.ssh/config`:

```text
Host *
    ServerAliveInterval 60
```

## A diagnostic mindset

Most SSH problems fall into three buckets. Identifying the bucket first saves you
from random flailing:

| Bucket | Symptom | Where to look |
| --- | --- | --- |
| **Network / reachability** | refused, timed out, can't resolve | address, port, firewall, DNS |
| **Authentication** | permission denied, too many failures | user, keys, `authorized_keys`, permissions |
| **Host identity** | identification changed, verification failed | `known_hosts` |

Ask "can I even *reach* it? → am I *allowed in*? → is it the *right machine*?" — in
that order — and the fix is usually obvious. When it isn't, `-v` (next) shows the
play-by-play.

> **Key takeaways**
>
> - **Refused** = nothing listening; **timed out** = can't reach it; **can't
>   resolve** = DNS. Different problems, different fixes.
> - **Permission denied (publickey)** is almost always **wrong user**, **key not
>   enrolled**, or **loose permissions** — check those three first.
> - **Too many authentication failures** → **`IdentitiesOnly yes`**.
> - Sort any issue into **reachability / authentication / host identity** and work
>   the right area.
