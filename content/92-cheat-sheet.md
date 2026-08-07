---
title: Quick Reference & Cheat Sheet
section: Going Further
order: 92
description: Every command, file, and concept from the course on one page — bookmark it.
---

# Quick Reference & Cheat Sheet

One page with everything worth keeping. Bookmark it. If a line here is unfamiliar,
the chapter it came from explains it in full.

## The mental model, in four lines

- **Client** (`ssh`, your machine) connects to a **server** (`sshd`, the remote).
- Your **private key** stays on your machine; a copy of your **public key** goes
  in the server's **`authorized_keys`**.
- The server proves itself with its **host key** (checked against your
  **`known_hosts`**); you prove yourself by **signing a challenge** with your
  private key.
- **Local = your machine; remote = the server.**

## Everyday commands

```bash
ssh user@host                     # connect
ssh -p 2222 user@host             # connect on a non-standard port
ssh user@host "command"           # run one command remotely and exit
ssh web                           # connect using a ~/.ssh/config alias
exit            # (or Ctrl-D)     # log out
```

## Keys

```bash
ssh-keygen -t ed25519 -C "you@example.com"   # generate a key pair
cat ~/.ssh/id_ed25519.pub                    # show your PUBLIC key (safe to share)
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host   # enrol your key on a server
ssh -i ~/.ssh/id_ed25519 user@host           # use a specific key
```

Manual enrol (no `ssh-copy-id`):

```bash
cat ~/.ssh/id_ed25519.pub | ssh user@host \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

## The agent (type your passphrase once)

```bash
eval "$(ssh-agent -s)"            # start an agent (if none running)
ssh-add ~/.ssh/id_ed25519         # add key (asks passphrase once)
ssh-add -l                        # list loaded keys
ssh-add --apple-use-keychain ~/.ssh/id_ed25519   # macOS: remember across reboots
```

## Copying files

```bash
scp file user@host:~/            # upload
scp user@host:~/file .           # download
scp -r folder user@host:~/       # whole folder
scp -P 2222 file user@host:~/    # non-standard port (CAPITAL -P!)
sftp user@host                   # interactive: get / put / ls / lls / bye
rsync -avz ./dir/ user@host:~/dir/   # sync (best for repeated/large)
```

## The files (and where they live)

| File | Side | Purpose |
| --- | --- | --- |
| `~/.ssh/id_ed25519` | client | **private** key (secret) |
| `~/.ssh/id_ed25519.pub` | client | **public** key (shareable) |
| `~/.ssh/known_hosts` | client | host keys of servers you trust |
| `~/.ssh/config` | client | per-host aliases & settings |
| `~/.ssh/authorized_keys` | server | public keys allowed to log in |
| `/etc/ssh/sshd_config` | server | the SSH **daemon**'s configuration |

## Permissions (SSH insists)

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 600 ~/.ssh/authorized_keys        # on the server
chmod 644 ~/.ssh/id_ed25519.pub
```

## `~/.ssh/config` template

```text
Host web
    HostName 203.0.113.10
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_ed25519

Host app
    HostName 10.0.1.15
    User deploy
    ProxyJump web            # hop through 'web' to reach a private host

Host *
    AddKeysToAgent yes
    UseKeychain yes          # macOS only
    ServerAliveInterval 60
    IdentitiesOnly yes
```

## Port forwarding

```bash
ssh -L 5432:localhost:5432 user@host    # remote/internal service → your local port
ssh -R 8080:localhost:3000 user@host    # your local service → a port on the server
ssh -D 1080 user@host                   # SOCKS proxy through the server
ssh -fN -L 5432:localhost:5432 user@host   # background tunnel, no shell
```

## Jump host

```bash
ssh -J user@bastion user@10.0.1.15      # hop through a gateway (or ProxyJump in config)
```

## Server hardening (in `/etc/ssh/sshd_config`)

```text
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

```bash
sudo sshd -t                    # validate config BEFORE applying
sudo systemctl restart ssh      # apply (test in a NEW terminal, keep old open!)
```

## Troubleshooting

```bash
ssh -v user@host                # verbose: watch reach → host key → auth
ssh-keygen -R host              # remove a stale/changed host key from known_hosts
sudo journalctl -u ssh -f       # server side: why sshd refused (run on the server)
```

| Error | First thing to check |
| --- | --- |
| `Connection refused` | Wrong port, or `sshd` not running |
| `Connection timed out` | Wrong IP / firewall / not reachable |
| `Could not resolve hostname` | DNS / spelling — try the IP |
| `Permission denied (publickey)` | Wrong **user**, key not in `authorized_keys`, or permissions |
| `Too many authentication failures` | Add `IdentitiesOnly yes` |
| `IDENTIFICATION HAS CHANGED` | `ssh-keygen -R host` (once you trust the change) |
| `Permissions … too open` | `chmod 600` the private key |

## Git

```bash
git@github.com:you/repo.git     # SSH remote = user 'git' @ host 'github.com'
ssh -T git@github.com           # test your key against GitHub
```

## The one rule, one last time

> Your **private key is a secret**. It lives on your machine and never travels.
> You share the **public** key freely. Everything else is detail.

That's SSH. You now know what happens between pressing Enter and seeing the prompt —
and how to fix it when it doesn't. Go log into something.
