---
title: Your Mac as the Control Machine
section: Our Hosting Stack
order: 105
description: Setting up macOS as the command centre for the stack — SSH config for the Coolify server, Keychain-backed keys, and the handful of tools worth installing.
---

# Your Mac as the Control Machine

In our setup the Mac is the **control room**: it never runs a client site, but it's
where you SSH from, push code from, and open the Coolify dashboard. A few minutes
tuning it makes everything after this frictionless. Most of this reuses the
Keys and Config chapters — here it's aimed squarely at this stack.

## macOS already has what you need

The OpenSSH client, `git`, and a terminal ship with macOS. Confirm:

```bash
ssh -V        # OpenSSH_9.x
git --version
```

That's enough to operate the whole stack. Everything below is polish and optional
tooling.

## Step 1 — A Keychain-backed key

You made an `ed25519` key earlier. On macOS, let the **Keychain** hold its
passphrase so you unlock it once and never think about it again — ideal when you're
SSHing into the server many times a day. In `~/.ssh/config`:

```text
Host *
    AddKeysToAgent yes
    UseKeychain yes
    IdentityFile ~/.ssh/id_ed25519
```

Load it into the agent + Keychain once:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

From now on, connecting to the server is prompt-free even after a reboot. (Full
detail in *The Passphrase & the SSH Agent*.)

## Step 2 — A config entry for the Coolify server

Give the server a short alias so you're not retyping its IP. In `~/.ssh/config`:

```text
Host coolify
    HostName 203.0.113.10
    User root
    IdentityFile ~/.ssh/id_ed25519

# add each client's dedicated server the same way, if you run more than one
Host client-box-2
    HostName 203.0.113.20
    User deploy
```

Now `ssh coolify` drops you onto the box. `scp file coolify:~/` and
`rsync … coolify:…` work too. If you later move SSH off port 22 or add a jump host,
this is the one place you change it.

> **Reminder from the hardening chapter:** once your key works, we log in as a
> **sudo user**, not `root`, and turn off password auth on the server. The `User`
> above becomes your deploy user rather than `root` at that point.

## Step 3 — Copying your public key around

You'll paste your **public** key into Coolify (to register servers) and into
GitHub. Get it onto the clipboard in one go:

```bash
pbcopy < ~/.ssh/id_ed25519.pub      # now paste it wherever it's needed
cat  ~/.ssh/id_ed25519.pub          # or just print it
```

`pbcopy` is the macOS-specific bit — it puts stdin on the clipboard.

## Step 4 — Tools worth installing (via Homebrew)

[Homebrew](https://brew.sh) is the standard macOS package manager. None of these
are required — you can run the whole stack with just `ssh` — but they're handy:

```bash
brew install git            # a newer git than the system one
brew install docker         # the docker CLI (client only — see below)
brew install lazydocker     # optional: a friendly TUI for docker
brew install --cask orbstack   # optional: lightweight Docker Desktop alternative
```

- The **`docker` CLI** on your Mac is just a *client*. On its own it needs a Docker
  engine to talk to — either a local one (OrbStack / Docker Desktop) for building
  and testing images locally, or the **remote** engine on the server (next
  section).
- A terminal upgrade like **iTerm2** or **Ghostty** (`brew install --cask iterm2`)
  is nice but entirely optional.

## Step 5 (power move) — Drive the server's Docker from your Mac

You don't have to SSH in and type `docker` on the server. Docker can point your
**local** CLI at the **server's** engine, tunnelled over SSH — using the `coolify`
alias you just defined:

```bash
docker context create coolify --docker "host=ssh://coolify"
docker context use coolify

docker ps        # this now lists containers ON THE SERVER
docker logs -f client-a
```

Everything runs against the remote engine, over your SSH connection, with no daemon
exposed to the network. Switch back to local with `docker context use default`.
This is a lovely tie-together of the whole course: it's *Docker over SSH*, secured
by the same key and config as everything else.

> **Why this is safe:** the Docker engine on the server stays bound to a local
> socket — you're reaching it *through* SSH, not over an open Docker port (exposing
> the Docker API to the internet is a classic way to get a server taken over).
> Never publish the Docker daemon port; use the SSH context instead.

## Your Mac, ready

With a Keychain-backed key, a `coolify` alias, `pbcopy` for pasting keys, and
optionally the docker CLI wired to the server, your Mac is a proper control room.
Now to the thing it's controlling — Docker.

> **Key takeaways**
>
> - macOS already ships `ssh` and `git` — enough to run the whole stack.
> - Use **`UseKeychain` + `--apple-use-keychain`** so your key unlocks once and
>   survives reboots.
> - Add a **`Host coolify`** alias in `~/.ssh/config`; **`pbcopy < …pub`** copies
>   your public key for pasting into Coolify/GitHub.
> - Optionally point your local **`docker` CLI at the server over SSH** with a
>   **docker context** — never by exposing the Docker port.
