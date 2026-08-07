---
title: "When a Site Goes Down: A Debug Playbook"
section: Our Hosting Stack
order: 140
description: A calm, layered checklist for our stack — from "the client's site is down" to the exact cause, working down through DNS, Traefik, the container, and the app.
---

# When a Site Goes Down: A Debug Playbook

A client messages: *"our site is down."* This chapter is the checklist to run,
**in order**, so you go from panic to cause in minutes. It pulls together every
layer of the stack — and every layer of SSH — into one repeatable routine. Bookmark
it; it's the payoff of the whole section.

## Work down the layers, in order

The cardinal rule: **don't guess — descend.** Each layer rules out the ones above
it, so check them top to bottom rather than jumping around.

```text
   1. Symptom     what EXACTLY is broken?  (404 / 502 / cert / timeout / wrong content)
   2. DNS         does the domain point at our server?        dig
   3. Server      is the box up and reachable?                ssh
   4. Proxy       is Traefik routing this domain?             404 vs 502
   5. Container   is the app's container actually running?    docker ps -a
   6. App         is the app healthy inside the container?    docker logs / exec
   7. Data/env    DB reachable? env vars set? volume intact?
```

## Step 1 — Read the symptom precisely

The *kind* of failure narrows the cause enormously before you touch anything:

| Symptom | Skip straight toward |
| --- | --- |
| **404** "not found" (Traefik's page) | Step 4 — routing/domain not matched |
| **502 / 504** bad gateway | Step 5 — container down/unhealthy |
| **Certificate / "not secure" warning** | Step 2 + Step 7 — DNS or port 80 |
| **Times out / can't connect at all** | Step 3 — server or firewall |
| **Loads, but wrong/old content** | Step 6 — deploy/app issue, not infra |

Open the site yourself. Note the exact error and whether it's HTTP or HTTPS.

## Step 2 — Is it DNS?

From your Mac, does the domain still point at the server?

```bash
dig +short client-a.com        # expect the server's IP, e.g. 203.0.113.10
```

- Wrong IP or empty → **DNS problem** (expired domain, changed records, registrar
  issue). Nothing on the server can fix this; correct the DNS.
- Correct IP → move down a layer.

## Step 3 — Is the server even up?

```bash
ssh coolify        # can you get in at all?
```

- **Timed out** → the box may be down or the network/firewall is blocking you.
  Check the provider's dashboard; is the VPS running? Is `22` (and `80`/`443`) open
  in the security group? (Recall *Common Errors*: timed out = unreachable.)
- **You're in** → the machine is alive; the problem is above the OS. Continue on the
  server.

Quick health glance once in:

```bash
df -h          # is the disk full? (a very common silent killer — builds and logs fill it)
free -h        # out of memory?
docker ps      # is the Traefik proxy container running?
```

> A **full disk** is one of the most common real causes of "everything's down at
> once" — Docker can't write, containers won't start, certs won't save. `df -h`
> early.

## Step 4 — Is Traefik routing this domain?

If the symptom was a **404 from Traefik**, the request reached the proxy but no
route matched:

- Is the **domain set** on the resource in Coolify (spelled correctly, including
  `www` if needed)? A missing/typo'd domain means missing labels means no route.
- Did the last deploy finish? A resource mid-failed-deploy may have no running
  container to route to.
- The Traefik **dashboard** (if enabled) shows whether a router for this host
  exists.

Fix the domain in Coolify and redeploy so the labels regenerate.

## Step 5 — Is the container running?

For a **502/504**, Traefik has a route but nothing healthy behind it:

```bash
docker ps -a | grep client-a      # is it Up, or Exited?
```

- **Exited / Restarting** → it crashed. Go to its logs (Step 6).
- **Up** but still 502 → it may be starting slowly, listening on the wrong port, or
  failing its health check. Logs again.

## Step 6 — Is the app healthy inside?

The logs almost always name the cause:

```bash
docker logs --tail 100 client-a       # last 100 lines — look for the crash/stack trace
docker logs -f client-a               # follow while you retry the site
```

Then get inside and test it locally, which **separates app from infra**:

```bash
docker exec -it client-a sh
# inside the container:
env | grep -i -E "DATABASE|API|SECRET"      # are the expected env vars present?
wget -qO- http://localhost:3000/ >/dev/null && echo "app answers locally"
```

- **App answers on `localhost` inside the container, but the domain doesn't** →
  the app is fine; the problem is **Traefik/DNS** (back to Steps 2/4).
- **App errors inside too** → it's an **app/config** problem: read the logged error.

## Step 7 — Data & environment

Most "it crashed on deploy" causes live here:

- **Missing/wrong env var** → the log will complain (undefined variable, auth
  failure). Fix it in Coolify's env vars and **redeploy** (they only apply at
  start).
- **Database unreachable** → is the DB resource running (`docker ps`)? Is the
  connection string right? Can the app reach it by container name over the Docker
  network?
- **Lost data after a deploy** → something wasn't on a **volume**. Restore from a
  backup, then add Persistent Storage so it can't recur.

## Certificate-specific issues

If the only problem is HTTPS (cert warning), it's almost always one of:

1. **DNS** isn't pointing at the server yet (Step 2) — Let's Encrypt can't verify.
2. **Port 80 is blocked** — the HTTP-01 challenge can't reach Traefik. Open it
   (`sudo ufw allow 80`).
3. **Rate-limited** — too many redeploys of the same domain tripped Let's Encrypt's
   weekly limit; wait, or use staging while testing.

## The one-screen version

```text
site down?
 ├─ what's the exact error?              (404 / 502 / cert / timeout / wrong content)
 ├─ dig +short domain   → right IP?      no → DNS
 ├─ ssh coolify         → get in?        no → server/firewall   ·  df -h (disk full?)
 ├─ 404?                → domain/labels in Coolify → redeploy
 ├─ 502?                → docker ps -a   → Exited? → docker logs
 ├─ docker logs client  → the error is usually right here
 ├─ docker exec → curl localhost inside → works? problem is Traefik/DNS, not the app
 └─ cert warning?       → DNS + port 80 + rate limits
```

## Escalate calmly

If you've walked the ladder and it's genuinely stuck: capture the evidence (the
exact error, the relevant `docker logs`, `docker ps -a` output) before changing
things, so you can undo and so a teammate can help. A **rollback** in Coolify to the
last known-good deploy is a legitimate fast mitigation while you investigate — get
the client back up first, diagnose second.

You now have the whole stack in your hands: your Mac, SSH, Coolify, Docker, and
Traefik — and a method to fix any of them. That's the course.

> **Key takeaways**
>
> - **Descend the layers in order** — symptom → DNS → server → Traefik → container
>   → app → data — instead of guessing.
> - The **symptom picks your starting point**: 404 = routing, 502 = container down,
>   cert = DNS/port 80, timeout = server/firewall.
> - **`dig`, `ssh`, `df -h`, `docker ps -a`, `docker logs`, `docker exec`** are the
>   six commands that resolve almost everything.
> - App answers **inside** the container but not on the domain → it's
>   **Traefik/DNS**, not the app. And when in doubt, **roll back** to restore
>   service, then debug.
