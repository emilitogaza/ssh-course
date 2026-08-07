---
title: Running Client Sites on Coolify
section: Our Hosting Stack
order: 125
description: The day-to-day of hosting clients — deploys, environment variables, persistent storage, databases, logs, and shelling into a container.
---

# Running Client Sites on Coolify

With Coolify installed and the concepts in place, this is the operational chapter:
the things you actually do to keep client sites deployed and healthy. Everything
here has a UI button *and* a command-line equivalent — knowing both means you're
never stuck when one is unavailable.

## Deploying and redeploying

- **First deploy:** create the application, connect the repo, set domain + env
  vars, hit **Deploy**. Coolify clones, builds the image, starts the container.
- **Auto-deploy:** enable the repo **webhook** so every `git push` to the chosen
  branch triggers a rebuild. This is the normal mode — push, and the client's site
  updates itself.
- **Manual redeploy:** the **Redeploy** button rebuilds from the current commit —
  handy after changing an env var or clearing a bad state.
- **Rollback:** Coolify keeps previous deployments; you can redeploy an earlier one
  if a release breaks. (Still, treat the Git repo as the source of truth.)

Each deploy builds a **new image** and swaps the container. Remember the ephemerality
rule: the new container starts clean, so anything not in a volume resets.

## Environment variables & secrets

Client apps need configuration — API keys, database URLs, feature flags. In the
resource's **Environment Variables** tab:

- Add them as key/value pairs; mark sensitive ones as **secret** so they're masked.
- They're injected into the container at runtime (visible inside as normal env
  vars — check with `docker exec -it client-a env`).
- **Changing an env var requires a redeploy** to take effect — the running
  container only reads them at start.
- Coolify also exposes handy build-time values and can generate secrets for you.

> **Never commit secrets to the client's repo.** They belong in Coolify's env vars,
> not in the code Coolify pulls. This is also why a leaked *repo* shouldn't leak
> your production credentials.

## Persistent storage (volumes)

By default a client site's container is disposable. For anything that must survive
deploys — uploaded images, user files, a SQLite database — add **Persistent
Storage** to the resource:

- Map a **path inside the container** (e.g. `/app/uploads`) to a **volume** Coolify
  manages on the host.
- That path now survives redeploys, restarts, and image updates.

Get this wrong and a client's uploads vanish on the next deploy — one of the few
ways to actually lose data here, and entirely avoidable.

## Databases

Rather than run a database inside the app container, add it as its **own resource**:

- Coolify offers one-click **PostgreSQL, MySQL/MariaDB, MongoDB, Redis**, and more.
- It provisions the database as a container **with its data on a volume**, and gives
  you a **connection string**.
- Link it to the app by putting that connection string in the app's env vars. The
  app reaches the database **by its container name** over Docker's internal network
  — no public port, so the database is never exposed to the internet.

> **Back up the database's volume.** Coolify has scheduled backups (e.g. to S3-style
> storage) — set them up per client. A container you can rebuild from Git; a
> database you can't. Volumes and DB backups are the data you actually protect.

## Reading logs

Two levels, matching the debugging ladder from the overview:

- **Build logs** — in the deployment view: shows the image build (dependency
  installs, compile steps). Where you look when a **deploy fails**.
- **Runtime logs** — the container's stdout/stderr: where you look when the site
  **deployed but misbehaves**. The UI streams these, and on the server it's exactly
  `docker logs -f client-a`.

## A terminal into the container

Coolify's UI has a **Terminal** / **Execute Command** button for a resource — it
opens a shell **inside the running container**. Under the hood that's the
`docker exec -it client-a sh` you already know. Use it to inspect files, run the
app's migration command, or test connectivity to the database:

```bash
# equivalent from an SSH session on the host:
docker exec -it client-a sh
# then, inside:
env | grep DATABASE      # is the DB URL present?
wget -qO- http://localhost:3000/health   # does the app answer locally?
```

If the app answers on `localhost` *inside* the container but the public domain
doesn't, you've just localised the problem to **Traefik/DNS**, not the app — a
distinction the playbook chapter leans on.

## Multiple clients on one server

The common shape for us — several clients sharing a box:

- **One Project per client** keeps env vars, domains, and resources tidy and
  separate.
- Each site is its **own container**, isolated from the others (separate
  filesystem, separate env). A crash in client A's container doesn't touch client
  B's.
- Each has its **own domain(s)**; Traefik keeps them apart by hostname (next
  chapter).
- Watch total **resources** — `docker stats` (or Coolify's metrics) shows if one
  client is eating the CPU/RAM everyone shares. Busy or sensitive clients may
  deserve their **own server**, which you add to Coolify over SSH.

## Everyday, distilled

Ninety percent of running client sites is: push code (auto-deploy), set an env var
and redeploy, read logs when something's off, and occasionally shell into a
container to check something. The other ten percent — domains and certs — is
Traefik, which is next.

> **Key takeaways**
>
> - **Auto-deploy on `git push`** is the default loop; **Redeploy** and **rollback**
>   cover the rest. Every deploy is a fresh container.
> - **Env vars/secrets** live in Coolify (never in the repo) and need a **redeploy**
>   to apply.
> - Anything that must persist goes in **Persistent Storage**; run **databases as
>   their own resource** and **back up their volumes**.
> - Build logs = deploy failures; runtime logs = misbehaving site; the **Terminal**
>   button is `docker exec` into the container.
