---
title: Tunnels & Port Forwarding
section: Going Further
order: 84
description: Using SSH to reach services that aren't exposed to the internet — local, remote, and dynamic port forwarding, explained with concrete examples.
---

# Tunnels & Port Forwarding

SSH can do more than give you a shell — it can carry *other* network traffic
through its encrypted tunnel. This is **port forwarding**, and it's how you reach a
database, an internal dashboard, or any service that isn't (and shouldn't be)
exposed to the internet. It feels like magic the first time; the mental model is
simple once you see it.

## The core idea

A forward makes a **port on one machine secretly connect to a port on another**,
through your SSH connection. Traffic that goes in one end comes out the other,
encrypted along the way. There are three flavours. The one you'll use most is the
first.

## Local forwarding (`-L`) — "bring a remote service to me"

The classic case: a database runs on your server, listening only on the server's
*own* `localhost` (port 5432), deliberately not exposed to the internet. You want
to connect to it from your laptop with a local tool. Local forwarding makes a port
on **your** machine tunnel to it:

```bash
ssh -L 5432:localhost:5432 deploy@example.com
```

Read the `-L` value **left to right as "here : there"**:

- `5432` — a port on **your laptop** (the "here" you'll connect to).
- `localhost:5432` — where, **as seen from the server**, the traffic should go
  (the "there"). `localhost` here means *the server itself*.

While that SSH session is open, pointing your database client at
**`localhost:5432` on your laptop** actually reaches the database on the server —
tunnelled and encrypted. Close the SSH session and the tunnel's gone.

> **The subtlety that trips people:** the `localhost` in the middle is resolved
> **on the server end**, not yours. `-L 8080:localhost:80` means "port 8080 here →
> port 80 on the *server*." You can also target a **third** machine the server can
> reach: `-L 5432:db.internal:5432` tunnels to `db.internal` *from the server's
> vantage point* — reaching a database the server can see but you can't.

A common convenience: `-N` (don't run a remote shell, just hold the tunnel) and
`-f` (go to background):

```bash
ssh -fN -L 5432:localhost:5432 deploy@example.com
```

## Remote forwarding (`-R`) — "expose something of mine to the server"

The reverse: open a port on the **server** that tunnels back to a service on
**your** machine. Useful for letting a remote host reach a dev server running on
your laptop:

```bash
ssh -R 8080:localhost:3000 deploy@example.com
```

Now hitting **`localhost:8080` on the server** reaches **port 3000 on your
laptop**. It's `-L` pointed the other way — you're publishing *your* local service
*to* the remote side. (Tools like ngrok are essentially this idea, productised.)

## Dynamic forwarding (`-D`) — a personal proxy

`-D` turns your SSH connection into a **SOCKS proxy**: instead of one fixed
destination, apps configured to use the proxy send *all* their traffic through the
server, which makes the requests on their behalf:

```bash
ssh -D 1080 deploy@example.com
```

Point a browser at SOCKS proxy `localhost:1080` and every page loads *as if from
the server* — handy for reaching things only that server can access, or routing
your browsing through a trusted machine. One flag, a whole proxy.

## The three in one table

| Flag | Direction | "A port here → a service there" | Typical use |
| --- | --- | --- | --- |
| **`-L`** | Local → remote | your port → a service the **server** can reach | reach a remote DB / internal site from your laptop |
| **`-R`** | Remote → local | a **server** port → a service **you** can reach | expose your local dev app to the server |
| **`-D`** | Dynamic (SOCKS) | your port → **anywhere** the server can reach | proxy/route arbitrary traffic through the server |

A memory hook: **`-L`** = pu**L**l something to you; **`-R`** = **R**each back to
you; **`-D`** = **D**ynamic, anywhere.

## Why this is safe and useful

Port forwarding lets you keep sensitive services **off the public internet
entirely** — a database bound to `localhost`, an admin panel with no public route —
and still reach them, over an authenticated, encrypted SSH connection, only when
you need to. It's a favourite because it needs **nothing installed** on the server
beyond the SSH you already have. No VPN to configure, no ports to open to the
world.

## Doing it from the config file

Forwards can live in `~/.ssh/config` so a plain `ssh dbtunnel` sets them up:

```text
Host dbtunnel
    HostName example.com
    User deploy
    LocalForward 5432 localhost:5432
    RequestTTY no
```

Now `ssh dbtunnel` opens the tunnel with no flags to remember.

> **Key takeaways**
>
> - Port forwarding carries **other services' traffic** through your SSH tunnel,
>   encrypted — no extra software on the server.
> - **`-L here:there`** brings a remote/internal service **to a local port** (the
>   middle host is resolved **on the server**).
> - **`-R`** exposes a **local** service on a **server** port; **`-D`** makes a
>   SOCKS **proxy** through the server.
> - It's the standard way to reach databases and internal tools kept **off the
>   public internet.**
