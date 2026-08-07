---
title: Troubleshooting with -v
section: Going Further
order: 82
description: Using SSH's verbose modes to see exactly where a connection fails — reading the debug output like a story.
---

# Troubleshooting with -v

When an SSH error isn't self-explanatory, one flag turns the black box
transparent: **`-v`**. It makes SSH narrate every step of the connection, so you
can see *precisely* where things go wrong instead of guessing. This is the single
most useful debugging skill in the whole course.

## The three levels

Add `v`s for more detail:

```bash
ssh -v deploy@example.com      # verbose — usually enough
ssh -vv deploy@example.com     # more
ssh -vvv deploy@example.com    # everything (rarely needed)
```

Start with `-v`. It maps directly onto the connection steps you already learned,
so you can read it as a story of the handshake.

## Reading the output as a story

The lines prefixed `debug1:` trace the same sequence from the connection chapter.
Here's a healthy login, annotated:

```text
debug1: Connecting to example.com [203.0.113.10] port 22.
debug1: Connection established.
```
→ *Reachability is fine* — we found and reached the machine on port 22. (If it
stalled or failed **here**, it's a network/port/firewall problem, not keys.)

```text
debug1: Server host key: ssh-ed25519 SHA256:Ux2Cq0m7…s9plQ
debug1: Host 'example.com' is known and matches the ED25519 host key.
```
→ *Host identity checked* — the server's host key matched `known_hosts`. (A
mismatch shows up as the "changed" warning here.)

```text
debug1: Authentications that can continue: publickey
debug1: Offering public key: /Users/you/.ssh/id_ed25519 ED25519 SHA256:Ux2…
debug1: Server accepts key: /Users/you/.ssh/id_ed25519 ED25519 SHA256:Ux2…
debug1: Authentication succeeded (publickey).
```
→ *Authentication* — the server allows `publickey`, we **offered** a key, the
server **accepted** it, and we're in. This is the key-auth exchange from earlier,
made visible.

Once you can read those three beats — **reach → host key → auth** — you can locate
almost any failure by *where the story stops.*

## Diagnosing "Permission denied" with `-v`

The verbose output is at its best on the dreaded `publickey` denial. Watch for
these tells:

**No key offered at all:**

```text
debug1: Authentications that can continue: publickey
debug1: No more authentication methods to try.
Permission denied (publickey).
```
→ Your client had **no key to present** (none loaded, none matched). Load one
(`ssh-add`) or point at it (`ssh -i …` / `IdentityFile`).

**Key offered but rejected:**

```text
debug1: Offering public key: /Users/you/.ssh/id_ed25519 …
debug1: Authentications that can continue: publickey
```
→ You offered a key and the server **didn't accept it** (no "Server accepts key"
line). The public key isn't in that user's `authorized_keys`, or server-side
permissions are wrong, or you're logging in as the wrong user.

**Offering the wrong keys / too many:**

```text
debug1: Offering public key: /Users/you/.ssh/id_rsa …
debug1: Offering public key: /Users/you/.ssh/id_work …
```
→ It's trying keys you didn't intend. Force the right one with `-i` +
`IdentitiesOnly=yes`.

Seeing *which* keys were offered and whether any were *accepted* usually solves the
problem in seconds — the guesswork is gone.

## Verbose for the config file

`-v` also prints which config it's reading and which options apply to this host —
handy when a `Host` block isn't taking effect:

```text
debug1: Reading configuration data /Users/you/.ssh/config
debug1: /Users/you/.ssh/config line 3: Applying options for web
debug1: Connecting to 203.0.113.10 [203.0.113.10] port 2222.
```

If your alias "isn't working," `-v` shows whether SSH even matched your `Host`
block and what `HostName`/`Port`/`User` it resolved — instantly revealing typos or
the wrong block winning.

## Server-side logs (when you control the server)

`-v` shows the **client's** view. If you administer the server, its logs show the
*other* half of the story — why `sshd` rejected you:

```bash
sudo journalctl -u ssh -f        # follow the SSH service log (Debian/Ubuntu)
# or: sudo tail -f /var/log/auth.log
```

Then attempt the login and watch. `sshd` often states the real reason plainly —
e.g. *"Authentication refused: bad ownership or modes for file
/home/deploy/.ssh/authorized_keys"* — which points straight at a permissions fix
you'd never see from the client side.

## A repeatable method

When SSH misbehaves:

1. **Run it with `-v`.**
2. **Find where the story stops** — connecting, host key, or authentication.
3. That location tells you the **bucket** (reachability / host identity / auth)
   from the errors chapter.
4. For auth issues, read **which keys were offered and whether accepted.**
5. If you own the server, **watch its log** while retrying for the definitive
   reason.

Nine times out of ten, the answer is sitting right there in the `debug1:` lines.

> **Key takeaways**
>
> - **`ssh -v`** narrates the connection; read it as **reach → host key → auth** and
>   note where it stops.
> - For `publickey` denials, check **which keys were offered** and whether you see
>   **"Server accepts key"**.
> - `-v` also shows **which `Host` config block** and options were applied — great
>   for alias problems.
> - If you control the server, **`journalctl -u ssh`** / `auth.log` gives `sshd`'s
>   own reason for refusing.
