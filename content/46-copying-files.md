---
title: "Copying Files: scp & sftp"
section: Getting Access & Connecting
order: 46
description: Moving files to and from a server over the same secure channel — scp for quick copies, sftp for browsing, and when to reach for rsync.
---

# Copying Files: scp & sftp

SSH isn't only for typing commands — the same secure channel moves **files**. Once
you can log into a server, you can push files to it and pull files from it, all
encrypted, using the credentials you already have. No new setup, no FTP, no
passwords if you're on keys.

## `scp` — secure copy

`scp` ("secure copy") works like the ordinary `cp`, except one side can be a
remote machine written as **`user@host:path`**. The shape is always
**`scp SOURCE DESTINATION`**.

**Upload** a local file to the server:

```bash
scp report.pdf deploy@example.com:/home/deploy/
```

Read it as *"copy `report.pdf` to `deploy@example.com`, into `/home/deploy/`."*

**Download** a file from the server to your machine:

```bash
scp deploy@example.com:/var/log/app.log .
```

The remote part is the source; `.` means "here, my current directory." Just flip
which side has the `user@host:`.

**Copy a whole folder** with `-r` (recursive):

```bash
scp -r ./mysite deploy@example.com:/var/www/
```

### The `-P` gotcha

If the server uses a non-standard port, `scp` wants a **capital `-P`** — unlike
`ssh`, which uses lowercase `-p`. This trips up everyone at least once:

```bash
scp -P 2222 report.pdf deploy@example.com:~/
```

> **And the payoff for your config file:** if you defined `Host web` in
> `~/.ssh/config` (with its port, user, and key), `scp` uses it too — no flags at
> all: `scp report.pdf web:~/`. Set up the config once; every tool benefits.

### Handy paths

- `~` on the remote is that user's home: `scp file web:~/` lands in their home
  directory.
- Rename while copying by giving a filename on the destination:
  `scp file web:~/newname.txt`.
- Copy **between two remote servers** without staging locally:
  `scp web:~/file.txt db:~/`.

## `sftp` — an interactive file session

Where `scp` is one-shot, **`sftp`** opens an interactive session for **browsing and
transferring**, like a command-line file manager over SSH:

```bash
sftp deploy@example.com
```

You get an `sftp>` prompt. Inside it, you have two "sides" — the remote (default)
and your local machine (commands prefixed with `l`):

```text
sftp> pwd                 # where am I on the SERVER
sftp> ls                  # list the server's files
sftp> lls                 # list my LOCAL files (note the leading 'l')
sftp> get app.log         # download app.log to my machine
sftp> put deploy.sh       # upload deploy.sh to the server
sftp> cd /var/www         # move around the server
sftp> lcd ~/Downloads     # move around locally
sftp> bye                 # quit
```

`sftp` shines when you want to look around before deciding what to move, or grab a
few files from different places in one session. It uses the same aliases too:
`sftp web`.

## When to reach for `rsync`

For anything beyond a quick copy — syncing a directory, re-copying only what
changed, resuming a big transfer — **`rsync` over SSH** is the better tool. It's
not part of OpenSSH but it *uses* SSH as its transport, so all your access and
config carry over:

```bash
rsync -avz ./mysite/ web:/var/www/mysite/
```

- **`-a`** preserve structure/permissions, **`-v`** verbose, **`-z`** compress in
  transit.
- Crucially, rsync **only transfers differences**, so re-running it after a small
  change is near-instant — ideal for deploys and backups. The trailing slashes
  matter (`src/` means "the contents of src"), so double-check them.

A rough rule:

| Need | Tool |
| --- | --- |
| One or a few files, quick | **`scp`** |
| Browse then grab, interactive | **`sftp`** |
| Sync folders / repeated / large / resumable | **`rsync`** |

## A note on `scp`'s status

Modern OpenSSH has quietly reworked `scp` to run over the SFTP protocol under the
hood, and the old tool has some rough edges the project has moved away from. `scp`
is still perfectly fine for everyday one-off copies — and it's the command you'll
see most in tutorials — but if you find yourself scripting lots of transfers,
`rsync` or `sftp` are the sturdier long-term choices. For learning and quick jobs,
`scp` is exactly right.

> **Key takeaways**
>
> - **`scp SOURCE DEST`**, where a remote side is **`user@host:path`** — upload or
>   download by choosing which side is remote; **`-r`** for folders.
> - `scp` uses a **capital `-P`** for the port (unlike ssh's `-p`), and it honours
>   your `~/.ssh/config` aliases.
> - **`sftp`** is an interactive browse-and-transfer session (`get`, `put`, `lls`).
> - For syncing, repeated, or large transfers, prefer **`rsync -avz … over SSH`**.
