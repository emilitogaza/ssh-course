---
title: The Passphrase & the SSH Agent
section: Keys & Authentication
order: 32
description: Protecting your private key with a passphrase without retyping it every time — how ssh-agent works, and ssh-add.
---

# The Passphrase & the SSH Agent

A passphrase on your private key is the difference between a stolen key file being
a catastrophe and a shrug. But nobody wants to type a passphrase on every single
connection. The **ssh-agent** resolves that tension: strong protection, typed
once. This chapter explains both halves.

## What the passphrase protects

Recall the passphrase from key generation. It **encrypts the private key file
itself**. So the file on disk isn't directly usable — it must be decrypted with the
passphrase before it can sign anything.

That creates two layers, and you need **both** to log in with the key:

1. **Something you have** — the private key file.
2. **Something you know** — the passphrase that unlocks it.

If your laptop is stolen but the key has a passphrase, the thief has layer 1 and
not layer 2. They can't use the key. A passphrase-less key, by contrast, is usable
by anyone who copies the file. That's why the passphrase matters — it's specifically
insurance against **the key file leaking.**

> The passphrase is **local**. It's never sent to any server; it only unlocks the
> file on your machine. Servers know nothing about it — they only ever see your
> signatures.

## The annoyance, and the fix

Type your passphrase on every connection and you'll soon be tempted to strip it
off "to save time" — trading away your safety net. The proper fix is the
**ssh-agent**: a small background program that holds your **decrypted** private key
in memory for the duration of your session. You unlock the key **once**; the agent
does the signing on your behalf after that.

The flow:

1. Start (or already have) an **agent** running.
2. **Add** your key to it — you type the passphrase **this once**; the agent
   decrypts and holds the key.
3. Every later `ssh` this session asks the agent to sign — **no prompt**.
4. Log out / reboot, the agent's memory clears, and you unlock once again next
   time.

Strong key, typed once. Best of both.

## Doing it: `ssh-add`

Make sure an agent is running (most desktops start one at login; if not):

```bash
eval "$(ssh-agent -s)"
```

Add your key (enter the passphrase when asked):

```bash
ssh-add ~/.ssh/id_ed25519
```

List what the agent currently holds:

```bash
ssh-add -l
```

Now connect — no passphrase prompt:

```bash
ssh deploy@example.com
```

The agent signed the challenge for you.

## macOS: store it in the Keychain

On macOS, `ssh-add` can save your passphrase to the **Keychain**, so it's loaded
automatically after every reboot and you rarely type it at all:

```bash
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

To make this the default behaviour, add to `~/.ssh/config`:

```text
Host *
  AddKeysToAgent yes
  UseKeychain yes
  IdentityFile ~/.ssh/id_ed25519
```

- `AddKeysToAgent yes` — automatically hand a key to the agent the first time it's
  used.
- `UseKeychain yes` — pull the passphrase from the macOS Keychain.

With that, the first connection after a fresh install prompts once; thereafter it's
seamless.

## Windows and Linux

- **Windows** has an `ssh-agent` **service**. Start it once (in an admin
  PowerShell): `Get-Service ssh-agent | Set-Service -StartupType Automatic` then
  `Start-Service ssh-agent`. After that, `ssh-add` works the same, storing the key
  in the Windows agent.
- **Linux** desktops usually run an agent under your login session already; if a
  key isn't being remembered, ensure the agent is running and `ssh-add` your key
  (or use your desktop's "keyring" integration).

## Agent forwarding — a preview and a caution

The agent can also be **forwarded** to a server (`ssh -A`), letting you use your
local keys *from* that server to hop onward — without copying any key onto it.
It's powerful and occasionally necessary, but forwarding your agent to an
untrusted server lets its root user piggyback on your keys while you're connected.
We'll cover it properly, safely, in **Jump Hosts & Agent Forwarding** — for now,
just know `-A` exists and shouldn't be used casually.

## Should a key *ever* be passphrase-less?

Sometimes, deliberately: an automated deploy key or CI job with no human to type a
passphrase. In those cases the key is unattended by design, and you compensate with
other limits (a dedicated key, restricted to one server, easily revoked). For your
**personal** key that unlocks real machines, **always use a passphrase** and let
the agent handle the convenience.

> **Key takeaways**
>
> - A **passphrase encrypts the private-key file**, protecting it if the file is
>   ever stolen. It's local and never sent anywhere.
> - **`ssh-agent`** holds the decrypted key in memory so you type the passphrase
>   **once per session**; add keys with **`ssh-add`**.
> - On **macOS**, `--apple-use-keychain` plus `AddKeysToAgent`/`UseKeychain` makes
>   it seamless across reboots.
> - Keep a passphrase on personal keys; only go passphrase-less for deliberate,
>   restricted automation.
