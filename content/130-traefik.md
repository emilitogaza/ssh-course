---
title: "Traefik: Routing & Automatic HTTPS"
section: Our Hosting Stack
order: 130
description: How the reverse proxy sends each client domain to the right container and issues HTTPS certificates automatically — and what to check when it doesn't.
---

# Traefik: Routing & Automatic HTTPS

One server hosts many client sites, all sharing ports **80** and **443**. Something
has to look at each incoming request and decide *"this one's for `client-a.com`,
send it to that container; this one's for `client-b.com`, send it there"* — and
give each a valid HTTPS certificate. That something is **Traefik**, the reverse
proxy Coolify runs. You rarely configure it by hand, but understanding it is the
difference between fixing a broken domain in two minutes and flailing.

## What a reverse proxy is

A **reverse proxy** is the single front door in front of many apps. All public
traffic hits it first; it then forwards each request to the correct app behind it
based on the request. Benefits for us:

- **One entry point** on ports 80/443 for the whole server.
- **Host-based routing** — split traffic by domain name.
- **Central TLS** — certificates are handled in one place, not per app.

The client containers themselves have **no public port**. Only Traefik faces the
internet; it reaches the containers over Docker's internal network. That's why a
site is invisible until Traefik is routing to it — and why exposing a container's
port directly is unnecessary.

## How Traefik knows where to send things

Traefik configures itself **dynamically from Docker labels**. Each container can
carry labels describing how it should be routed, and Traefik watches the Docker
engine and picks them up automatically. **Coolify writes these labels for you**
based on the domain you set on a resource. Conceptually, a client app ends up
labelled something like:

```text
traefik.enable=true
traefik.http.routers.client-a.rule=Host(`client-a.com`)
traefik.http.routers.client-a.tls.certresolver=letsencrypt
```

Read that as: *enable routing for this container; when the request's host is
`client-a.com`, this is the target; get its certificate from Let's Encrypt.* You
set **`client-a.com`** in Coolify's UI; Coolify turns it into labels; Traefik turns
labels into live routing. You almost never write these yourself — but when a domain
misbehaves, knowing they exist tells you where to look.

## Automatic HTTPS, explained

This is the feature that saves the most manual pain. Traefik obtains and renews TLS
certificates from **Let's Encrypt** (a free, automated certificate authority)
without you touching `certbot`:

1. You point the domain's **DNS** at the server and set the domain in Coolify.
2. Traefik asks Let's Encrypt for a certificate for that domain.
3. Let's Encrypt verifies you control the domain via the **HTTP-01 challenge** — it
   requests a special file over **port 80** on that hostname, which must reach
   Traefik on your server.
4. On success, Traefik installs the cert, serves the site over **HTTPS on 443**,
   and **auto-renews** before expiry (certs last 90 days).

Two preconditions fall straight out of step 3, and they're the cause of most cert
failures:

> **For a certificate to issue: (1) the domain's DNS must already point to the
> server's IP, and (2) port 80 must be open and reaching Traefik.** No DNS, no
> cert. Blocked port 80, no cert — even though the site itself runs on 443.

Traefik also typically **redirects HTTP → HTTPS**, so visitors on
`http://client-a.com` are bounced to `https://`. Coolify sets this up per site.

## Pointing a client domain at the server

The DNS half is on you (or the client's registrar), and it's simple:

| Record | Name | Value |
| --- | --- | --- |
| `A` | `client-a.com` (`@`) | `203.0.113.10` (the server's IP) |
| `A` | `www` | `203.0.113.10` |

Once those propagate, set `client-a.com` in Coolify, deploy, and Traefik does the
rest. Check propagation from your Mac before blaming Coolify:

```bash
dig +short client-a.com        # should print the server's IP
```

If `dig` shows the wrong IP or nothing, it's **DNS**, and no amount of Coolify
poking will fix it until that resolves.

## Reading Traefik when something's wrong

The failure modes are few and recognisable:

| What you see | Likely cause |
| --- | --- |
| Browser: **404 page from Traefik** | No router matches this host — domain typo, or the domain isn't set on the resource (labels missing) |
| **502 Bad Gateway** / **504** | Traefik found the route but the **container is down/unhealthy** — check `docker ps -a` and `docker logs` |
| **Certificate warning / not secure** | Cert didn't issue — **DNS** not pointing here yet, or **port 80** blocked, or hit Let's Encrypt **rate limits** from repeated redeploys |
| Site loads on IP but **not the domain** | DNS not pointing to the server |
| Nothing loads at all | Server unreachable, or **80/443 blocked** by the firewall/security group |

Notice how these map to layers: a **404** is Traefik's own routing (labels/domain);
a **502** is the app **behind** Traefik (a Docker problem); a **cert** issue is
**DNS or port 80**. Locating which of the three you're in is most of the fix.

## Firewall reminder

Traefik can only work if the world can reach it. On the server, the firewall must
allow inbound **80** and **443** (and **22** for your SSH). If you use `ufw` or a
cloud security group:

```bash
sudo ufw allow 22       # SSH
sudo ufw allow 80       # HTTP (needed for cert issuance + redirects)
sudo ufw allow 443      # HTTPS
```

Forgetting **80** is a classic: the site "works" once a cert exists, but new certs
never issue because the challenge on port 80 can't get through.

## The Traefik dashboard

Traefik can expose a **dashboard** listing every router, service, and any errors —
useful for confirming a site's router exists and its rule is what you expect. Coolify
can enable it (protect it behind auth). It's a quick way to answer *"does Traefik
even know about this domain?"* when debugging a 404.

## What to take away

Traefik is the traffic cop and the certificate clerk. Coolify programs it through
Docker labels from the domains you set, so day to day you just type a domain and get
working HTTPS. When a domain breaks, it's almost always one of three things — **DNS,
a down container, or a blocked port 80** — and now you know how to tell them apart.

> **Key takeaways**
>
> - **Traefik** is the reverse proxy on ports 80/443; it routes each **domain** to
>   the right container and issues **Let's Encrypt HTTPS** automatically.
> - It configures itself from **Docker labels** that **Coolify writes** from the
>   domain you set — you rarely touch it directly.
> - Certificates need **DNS pointing at the server** and **port 80 open**; missing
>   either is the top cause of cert failures.
> - Debug by symptom: **404** = routing/domain, **502** = container down, **cert
>   warning** = DNS/port 80.
