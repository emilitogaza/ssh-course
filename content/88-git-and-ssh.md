---
title: Git & SSH
section: Going Further
order: 88
description: Why your git push uses SSH, how to set up a key with GitHub/GitLab, and the difference between account keys and deploy keys.
---

# Git & SSH

You've almost certainly used SSH without realising it: every time you `git push`
over an SSH remote, the exact machinery from this course authenticates you. This
chapter connects the dots — it's the most common place a developer meets SSH, and
now you'll actually understand what's happening.

## HTTPS vs SSH remotes

A Git remote URL comes in two shapes:

```text
https://github.com/you/project.git      ← HTTPS
git@github.com:you/project.git          ← SSH
```

Look at the SSH one: **`git@github.com:you/project.git`**. That's the familiar
`user@host` shape! The user is **`git`**, the host is **`github.com`**. When you
push to this remote, Git opens an SSH connection to `github.com` as the user `git`
and authenticates **with your key** — no password, no token typed. That's why SSH
remotes "just work" once set up, while HTTPS often nags for credentials or a
personal access token.

## Setting up your key with GitHub/GitLab

The pattern is identical to enrolling a key on any server — you're putting your
**public** key where the service can check it. GitHub's account settings play the
role of `authorized_keys`:

1. **Copy your public key:**

   ```bash
   cat ~/.ssh/id_ed25519.pub
   # macOS:   pbcopy < ~/.ssh/id_ed25519.pub
   # Windows: Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
   ```

2. **Paste it** into the host's settings → **SSH keys** → *New SSH key* (GitHub:
   Settings → SSH and GPG keys). Give it a name like "work laptop." You're adding
   the **public** half — never paste anything beginning with `BEGIN … PRIVATE
   KEY`.

3. **Test the connection:**

   ```bash
   ssh -T git@github.com
   ```

   First time, you'll get the **host-key prompt** (verify the fingerprint against
   GitHub's published one if you're careful, then `yes`). Success looks like:

   ```text
   Hi you! You've successfully authenticated, but GitHub does not provide shell access.
   ```

   That message is perfect: you authenticated by key, and GitHub — unlike a normal
   server — deliberately gives no shell, only Git operations. Everything from the
   key-auth chapter just happened.

4. **Use SSH remotes.** Clone with the SSH URL, or switch an existing repo:

   ```bash
   git clone git@github.com:you/project.git
   # or convert an existing repo:
   git remote set-url origin git@github.com:you/project.git
   ```

Now `git push`/`pull` authenticate silently with your key.

## Account keys vs deploy keys

Two distinct uses of keys with Git hosts — worth not muddling:

| | **Account key** | **Deploy key** |
| --- | --- | --- |
| Added to | Your **user account** | A **single repository** |
| Grants | Access to **all** your repos | Access to **one** repo only |
| Who's it for | **You**, on your machines | A **server** that needs to pull one project |
| Typical scope | Read/write | Often read-only |

**Account key:** your personal key, your identity across all your repositories —
what you set up above.

**Deploy key:** a key you generate **on a server** so it can pull one specific repo
(e.g. your production box fetching your app to deploy it). You add its **public**
key to that repo's *Deploy keys* settings, usually read-only. It's scoped to one
project, so if the server is compromised the blast radius is that single repo — not
your whole account.

## Multiple keys for multiple accounts

Got separate work and personal GitHub accounts? A host can't tell two keys apart on
the same `github.com`, so use `~/.ssh/config` with host **aliases** and distinct
keys:

```text
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes
```

Then use the **alias** as the host in the remote URL:

```bash
git clone git@github-work:company/project.git
git clone git@github-personal:you/sideproject.git
```

SSH matches the alias, picks the right key (`IdentitiesOnly yes` ensures *only*
that key is offered), and each account sees the identity you intended. This is a
direct payoff of the config-file chapter.

## Why it all clicks now

Nothing here is new SSH — it's the same key pair, the same `authorized_keys` idea
(GitHub's key list), the same host-key prompt, the same config file. Git hosting
simply applies the mechanics you already understand. Once you see `git@github.com`
as `user@host` and your GitHub key list as `authorized_keys`, the whole thing is
just SSH wearing a Git hat.

> **Key takeaways**
>
> - An SSH Git remote (**`git@github.com:you/repo.git`**) is `user@host` — Git
>   authenticates with **your key**, which is why it never asks for a password.
> - Set up by pasting your **public** key into the host's **SSH keys** settings
>   (their version of `authorized_keys`); test with **`ssh -T git@github.com`**.
> - **Account keys** = you, all repos; **deploy keys** = one repo, usually for a
>   server, read-only.
> - Juggle multiple accounts with **`~/.ssh/config` host aliases** +
>   **`IdentitiesOnly yes`**.
