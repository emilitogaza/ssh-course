---
title: "Users, sudo & Adding Keys"
section: Running Your Own Server
order: 62
description: Creating a proper non-root user on your server, giving it admin rights with sudo, and enrolling your SSH key for it.
---

# Users, sudo & Adding Keys

You're logged into your fresh server as `root`. Before doing anything real, create
a normal user for yourself, give it administrator powers through `sudo`, and put
your SSH key on it. This is the standard first-day setup for any Linux server, and
it's good SSH practice: you'll stop logging in as root entirely.

Run these as `root` (or with `sudo`) on the **server**.

## Why not just use root?

`root` can do *anything*, instantly, with no confirmation — including destroy the
system with one mistyped command. Two problems follow:

- **Accidents.** A stray `rm -rf` as root doesn't ask twice.
- **Attacks.** Every server on the internet gets bombarded with bots trying to log
  in as `root`. It's the one username they *know* exists.

The fix is a normal user for daily work that can *borrow* root powers deliberately,
per-command, via **`sudo`** — and then closing root's SSH door (next chapter).

## Step 1 — Create a user

Replace `deploy` with whatever name you like:

```bash
adduser deploy
```

This prompts for a password (choose a strong one — it's used for `sudo`, not for
SSH login) and a few optional details you can skip with Enter. It creates the user
and their home directory `/home/deploy`.

## Step 2 — Grant sudo

Add the user to the group that's allowed to use `sudo`:

```bash
usermod -aG sudo deploy
```

- **`-aG sudo`** = **a**ppend to **G**roup `sudo`. (On Ubuntu/Debian the group is
  `sudo`; on Fedora/CentOS it's `wheel`.)

Now `deploy` can run admin commands by prefixing `sudo`, like
`sudo apt update` — it'll ask for **deploy's** password the first time, then
remember for a few minutes.

> **The `-a` is not optional.** `usermod -G sudo deploy` (without `-a`) *replaces*
> all of the user's groups with just `sudo`, quietly dropping them from others.
> Always `-aG` to **append**.

## Step 3 — Give the user your SSH key

Your key is currently enrolled for `root` (that's how you logged in). The new user
needs its own copy in **its** `authorized_keys`. Two easy ways:

**A — From your laptop with `ssh-copy-id`** (open a second terminal, leave the root
session running):

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@203.0.113.10
```

It'll ask for the deploy password you just set, then enrol your key.

**B — On the server, copy root's key across.** Since you logged in as root with
your key, it's already in root's file — reuse it:

```bash
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

The `chown` is essential: the files must be **owned by `deploy`**, or `sshd` won't
trust them. The permissions (`700`/`600`) are the same strict rules from the keys
chapters.

## Step 4 — Test the new user *before* closing root

**Crucial ordering.** Keep your root session open and, in a **separate terminal**,
prove you can log in as the new user with your key:

```bash
ssh deploy@203.0.113.10
```

You should land at `deploy@server:~$` with **no password prompt** (key auth). Then
confirm sudo works:

```bash
sudo whoami        # should print: root
```

Only once **both** work — key login as `deploy`, and `sudo` — are you safe to stop
using root. If something's off, you still have the root session to fix it. Never
lock down root until the replacement is verified.

## Step 5 — Adopt the new user

From now on, log in as `deploy`. Update your `~/.ssh/config` so it's automatic:

```text
Host myserver
    HostName 203.0.113.10
    User deploy
```

Now `ssh myserver` gets you in as your proper user. The next chapter hardens the
server — turning off password logins and shutting the root SSH door — now that you
have a safe, key-based way in that doesn't depend on either.

## Adding *other* people later

Same pattern for a teammate: create their user (or reuse a shared one),
`usermod -aG sudo` if they need admin, and add **their** public key (which they
send you) to the relevant `authorized_keys`. Access is always "their public key in
the right `authorized_keys`," exactly as the keys section described — nothing new.

> **Key takeaways**
>
> - Don't work as **root**; create a normal user (**`adduser`**) and grant admin
>   with **`usermod -aG sudo`** (append!).
> - Enrol your key for the new user — **`ssh-copy-id`** from your laptop, or copy
>   root's `authorized_keys` and **`chown`** it to the user.
> - **Test key login *and* `sudo` as the new user in a second terminal** before you
>   stop using root.
> - Point your `~/.ssh/config` at the new user so `ssh myserver` just works.
