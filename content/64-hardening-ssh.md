---
title: Hardening SSH (sshd_config)
section: Running Your Own Server
order: 64
description: Locking down your server's SSH — disabling password logins and root access via sshd_config — with a safety net so you never lock yourself out.
---

# Hardening SSH (sshd_config)

Your server works with key login and you have a proper sudo user. Now close the
doors you're no longer using. Two changes remove the vast majority of automated
attacks: **turn off password authentication** and **disable root SSH login**. Both
live in the server's SSH daemon config, **`/etc/sshd_config`**… almost —
it's `/etc/ssh/sshd_config`. Note the difference from your *client* config in
`~/.ssh/config`; this is the **server** side.

> **Read the safety section first.** Editing SSH config on a remote box carries one
> real risk: locking *yourself* out. The rule below makes that essentially
> impossible to do permanently. Follow it.

## The golden safety rule

**Never close your current SSH session while changing SSH config. Open a second
connection to test.** As long as one working session stays open, a mistake is
recoverable — you fix it in the session you still have. Only disconnect the last
session once a **fresh** login has proven the new settings work.

## Step 1 — Confirm key login works right now

Before disabling passwords, be certain your key login is solid — otherwise turning
off passwords locks everyone out. From your laptop:

```bash
ssh deploy@203.0.113.10
```

Land at the prompt with **no password** asked? Good — key auth is working. If it
*does* ask for a password, **stop** and fix key login first (revisit the
`authorized_keys` and permissions chapters). Do not proceed until this is clean.

## Step 2 — Edit sshd_config

On the server, open the file with `sudo`:

```bash
sudo nano /etc/ssh/sshd_config
```

Find these settings (they may be present, commented with a `#`, or absent — set
them explicitly, uncommented):

```text
PubkeyAuthentication yes
PasswordAuthentication no
PermitRootLogin no
```

- **`PubkeyAuthentication yes`** — allow key login (usually already on).
- **`PasswordAuthentication no`** — the big one: refuse password logins entirely,
  so brute-force bots have nothing to attack.
- **`PermitRootLogin no`** — no direct SSH login as root; you use your sudo user
  and escalate with `sudo`. (`prohibit-password` is a middle ground that allows
  root by key only — but `no` is cleaner once your sudo user is set up.)

Optional, if a provider left it off:

```text
AllowUsers deploy        # only this user may log in via SSH
```

Save and close (in `nano`: Ctrl-O, Enter, Ctrl-X).

## Step 3 — Check the config for typos

`sshd` can validate its config *before* you apply it. Always do this — a typo that
stops `sshd` starting could otherwise lock you out:

```bash
sudo sshd -t
```

No output means it's valid. An error names the file and line to fix. Don't skip
this.

## Step 4 — Apply it

Restart the SSH service so the new settings take effect:

```bash
sudo systemctl restart ssh
```

> On some systems the service is named **`sshd`** rather than `ssh` — if the above
> says "unit not found", use `sudo systemctl restart sshd`. Restarting the service
> does **not** kick off your current session — another reason to keep it open.

## Step 5 — Test in a NEW terminal

Leave your current session running. In a **separate** terminal, connect fresh:

```bash
ssh deploy@203.0.113.10        # should log in by key, as before
ssh root@203.0.113.10          # should now be REFUSED
```

The first should work exactly as before. The second should be denied (root login
off). If your normal login still works — you're done, and you can close the old
session. If it *doesn't*, go back to the still-open original session and revert the
change, then investigate.

## What you've accomplished

With password auth off and root login disabled, the constant background noise of
bots guessing passwords simply **stops mattering** — there's no password to guess
and the obvious `root` target is closed. Your server now only accepts the one thing
that's genuinely hard to fake: a signature from a private key you hold. That's the
lion's share of practical SSH hardening from three config lines.

## Worth knowing (beyond this course)

If you go further, these are the usual next steps — names to search, not things you
must do now:

| Measure | What it adds |
| --- | --- |
| **`fail2ban`** | Auto-bans IPs that hammer the server |
| **A firewall** (`ufw`) | Only expose the ports you actually use (e.g. 22, 80, 443) |
| **Changing the SSH port** | Cuts scan noise (obscurity, not real security) |
| **2FA / hardware keys** | A second factor, or keys stored on a YubiKey |

The three config lines above are the high-value core; the rest is refinement.

> **Key takeaways**
>
> - Harden in **`/etc/ssh/sshd_config`** (the **server** config, distinct from your
>   `~/.ssh/config`).
> - Set **`PasswordAuthentication no`** and **`PermitRootLogin no`** — but only
>   **after** confirming key login works.
> - **Always** validate with **`sudo sshd -t`**, then restart the service; keep
>   your old session open and **test in a new terminal**.
> - Golden rule: never close your last working session until a fresh login proves
>   the new config.
