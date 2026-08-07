---
title: Docker, Just Enough
section: Our Hosting Stack
order: 110
description: The container concepts and handful of commands you actually need to run client sites — images vs containers, logs, volumes, and getting a shell inside a container.
---

# Docker, Just Enough

Coolify runs every client site as a **Docker container**, so even though Coolify
does the heavy lifting, you need a working feel for Docker to operate and debug.
This isn't a Docker course — it's the 20% that covers 80% of what you'll do on the
server.

## The core idea: images and containers

Two words, often muddled:

- An **image** is a **read-only template** — a frozen snapshot of a filesystem plus
  the command to run. Think "the installer" or "the class."
- A **container** is a **running instance** of an image — a live process with its
  own isolated filesystem, network, and process space. Think "the running app" or
  "the object."

One image, many containers: the same image can run as several identical containers.
Coolify **builds an image** from each client's code, then **runs it as a
container**.

> A container is *not* a virtual machine. There's no separate OS booting inside —
> it's an isolated process on the host's own kernel. That's why containers start in
> milliseconds and are cheap to run dozens of.

## The mental model for our stack

```text
   client's Git repo  ──build──▶  image  ──run──▶  container  ◀── Traefik routes here
     (source code)               (template)      (the live site)
```

Coolify automates the two arrows. Your job is mostly to **inspect the container**
when something's off.

## The commands you'll actually use

Run these on the **server** (after `ssh coolify`), or locally via the docker-over-SSH
context from the last chapter. Coolify names containers after the resource, so
you'll see names like `client-a` or a longer generated one.

### See what's running

```bash
docker ps                 # running containers: name, image, ports, status, uptime
docker ps -a              # include stopped/exited ones (crucial when a site is DOWN)
docker images             # images present on the host
docker stats              # live CPU/memory per container (q to quit)
```

`docker ps -a` is the first thing to run when a site is down — a container that
**exited** tells you it crashed, and its status often hints why.

### Read logs (your #1 debugging tool)

```bash
docker logs client-a          # everything the container has printed
docker logs -f client-a       # follow live (like tail -f) — Ctrl-C to stop
docker logs --tail 100 client-a   # just the last 100 lines
```

A crashing site almost always explains itself in the last screenful of its logs —
a missing env var, a failed DB connection, a port clash.

### Get a shell *inside* a container

This is the container equivalent of SSHing into a machine, and it's the moment the
whole course pays off conceptually:

```bash
docker exec -it client-a sh       # a shell inside the running container
# or, if the image has bash:
docker exec -it client-a bash
```

- **`exec`** runs a command in an already-running container.
- **`-it`** = **i**nteractive + **t**erminal, i.e. "give me a real shell."
- Inside, you can `ls`, check files, run the app's CLI, test a DB connection —
  then `exit` to pop back to the host.

> **Important distinction:** you do **not** SSH *into* a container, and containers
> should **not** run their own `sshd`. You SSH into the **host**, and from there
> `docker exec` into the container via the Docker engine. "SSH gets you to the
> machine; `docker exec` gets you inside the box on it." Running an SSH server
> inside every container is a well-known anti-pattern — `docker exec` is the right
> tool.

### Start, stop, restart

```bash
docker restart client-a
docker stop client-a
docker start client-a
```

You'll usually do these from the Coolify UI instead, but knowing the raw commands
helps when the UI is the thing that's broken.

## Containers are ephemeral — volumes make data survive

The single most important gotcha. A container's filesystem is **disposable**: when
it's recreated (a redeploy, a restart of a crashed container, an image update),
**anything written inside it is wiped** and it starts fresh from the image.

That's a feature — deploys are clean and repeatable — but it means **persistent
data must live outside the container**, in a **volume**:

- A **volume** is storage on the host that's mounted into the container, and it
  **survives** the container being recreated.
- Databases, uploaded files, and anything you can't afford to lose go in volumes.

In Coolify you attach **Persistent Storage** to a resource for exactly this. The
rule to burn in:

> **If it's not in a volume, assume it's gone on the next deploy.** Client uploads
> and databases *must* be on volumes.

## Ports and networking, briefly

- A container listens on a port *inside itself* (say `3000`). It isn't reachable
  from the outside until something maps or routes to it.
- In our stack you rarely publish ports to the host directly — **Traefik** connects
  to the container over Docker's internal network and handles the public side. So a
  client container has *no* public port of its own; only Traefik faces the
  internet (next-but-one chapter).
- Containers on the same Docker network can reach each other **by name** (e.g. the
  app container talks to a `postgres` container at hostname `postgres`). Coolify
  wires this up when you link a database to an app.

## That's genuinely enough

`ps -a`, `logs`, `exec -it`, and the volume rule cover almost everything you'll do
by hand. Coolify handles building, running, and networking; you drop to these
commands to *see* and *fix*. Next: the tool doing that automation.

> **Key takeaways**
>
> - **Image** = read-only template; **container** = a running instance of it.
>   Coolify builds the image and runs the container.
> - **`docker ps -a`** and **`docker logs`** are your first two moves when a site
>   misbehaves.
> - Get a shell inside with **`docker exec -it <name> sh`** — you SSH to the
>   *host*, then `exec` into the *container* (never run `sshd` in a container).
> - Containers are **ephemeral**: persistent data must live in a **volume**, or
>   it's lost on the next deploy.
