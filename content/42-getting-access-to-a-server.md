---
title: Getting Access to a Server
section: Getting Access & Connecting
order: 42
description: The end-to-end flow for gaining SSH access to a machine you don't yet have keys on — the three real-world starting points.
---

# Getting Access to a Server

"How do I actually *get in* to a new server?" is the question that sends people in
circles, because the answer depends on where you're starting from. This chapter
lays out the three real starting points and the exact path from each to
permanent, key-based access. Every path ends the same way: **your public key in the
server's `authorized_keys`.**

## The goal, restated

However you begin, the destination is always:

> A line containing **your public key** sits in **`~/.ssh/authorized_keys`** for
> the user you log in as on the server.

Getting there is "enrolling" your key. The three scenarios differ only in how you
make that first append.

## Scenario A — The cloud provider asks for a key up front

The smoothest case, and the most common today. When you create a server on DigitalOcean,
AWS, Hetzner, Linode, Vultr, etc., the creation form has an **"SSH keys"** section.
You paste your **public** key (or select one you saved earlier), and the provider
writes it into `authorized_keys` on the new machine before it boots.

Get your public key to paste:

```bash
cat ~/.ssh/id_ed25519.pub          # then copy the whole line
# macOS: pbcopy < ~/.ssh/id_ed25519.pub   (copies it straight to your clipboard)
# Windows: Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
```

Then, once the server is up, you just connect — key login works immediately, no
password ever:

```bash
ssh root@203.0.113.10       # or the default user the provider tells you
```

That's the whole flow. If your provider offers this, **use it** — it skips the
password dance entirely.

## Scenario B — You have a password (but no key yet on the server)

Common with budget hosts or a machine someone set up for you: they email you a
username and a temporary **password**. You can log in, but you want key access.
Two ways to enrol your key:

**The easy tool** (macOS/Linux):

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub deploy@203.0.113.10
```

It asks for that password *this once*, appends your public key, fixes permissions,
and you're done. Now:

```bash
ssh deploy@203.0.113.10     # logs in with your key — no password
```

**The manual one-liner** (works anywhere, including from Windows PowerShell where
`ssh-copy-id` isn't present):

```bash
cat ~/.ssh/id_ed25519.pub | ssh deploy@203.0.113.10 \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Either way, once key login works, head to the hardening chapter and **turn
password login off** so no one can brute-force that account.

## Scenario C — Someone else controls the server

You don't have any access; an admin or teammate does. You can't append your own key
— but you have the one thing they need:

1. **Send them your public key** — the `.pub` line. It's safe to email, Slack, or
   paste anywhere; it's not a secret.
2. **They add it** to `authorized_keys` for the user you'll use (or hand it to
   their automation / config management).
3. **You connect** with your key as usual.

This is the everyday reality on teams: you never see the server's setup, you just
provide your public key and access appears. Note the direction — *you send the
public half; you never ask for, or receive, anyone's private key.* If someone asks
you to send your **private** key, that's wrong every time.

## Which user do I log in as?

A frequent snag. Fresh cloud images have a conventional default user, and logging
in as the wrong one gives "Permission denied" even with a perfect key:

| Image / provider | Typical default user |
| --- | --- |
| Ubuntu (many clouds) | `ubuntu` |
| Debian | `debian` (or `root`) |
| Amazon Linux | `ec2-user` |
| Fedora | `fedora` |
| Generic / bare VPS | `root` |

When in doubt, your provider's docs say which. After first login you'll typically
**create your own user** (next section) and stop using the default.

## Putting the whole path together

```text
  Generate key (once)  ─▶  Get public key onto server's authorized_keys  ─▶  ssh in
     ssh-keygen              (paste at creation │ ssh-copy-id │ send to admin)     with key
```

Three on-ramps, one road. Once your public key is in `authorized_keys`, the
mechanics from here — logging in, copying files, configuring shortcuts — are
identical no matter how you got there. Speaking of shortcuts, that's next: making
`ssh deploy@203.0.113.10 -p 2222 -i ~/.ssh/id_work` collapse into a tidy `ssh web`.

> **Key takeaways**
>
> - Every route ends with **your public key in the server's `authorized_keys`** —
>   that's what "getting access" means.
> - **Provider key field** (paste at creation) → instant key login, no password.
> - **Have a password?** Enrol with **`ssh-copy-id`** (or the manual pipe), then
>   disable passwords.
> - **Someone else's server?** Send them your **public** key — never your private
>   one — and connect once they add it.
> - Log in as the image's **default user** (`ubuntu`, `ec2-user`, `root`, …) until
>   you make your own.
