---
title: Jump Hosts & Agent Forwarding
section: Going Further
order: 86
description: Reaching servers that sit behind a gateway — ProxyJump for hopping through a bastion, and the safer alternative to forwarding your agent.
---

# Jump Hosts & Agent Forwarding

In real infrastructure, the interesting servers often aren't directly reachable —
they sit on a private network behind a single public **gateway**. To reach them you
have to go *through* that gateway. This chapter covers the clean way to do that
(**ProxyJump**) and the older, riskier technique it replaces (**agent
forwarding**), so you know both and choose the safe one.

## The bastion pattern

A common, secure setup:

```text
   You  ──ssh──▶  [ bastion / jump host ]  ──ssh──▶  [ private app server ]
               public IP, the only door       no public IP, hidden behind bastion
```

The **bastion** (a.k.a. jump host) is the one machine exposed to the internet;
everything valuable lives behind it with **no public address**. You can't
`ssh app-server` directly — your laptop can't even see it. You must hop through the
bastion.

## The clean way: ProxyJump (`-J`)

Modern SSH does the hop in one command with **`-J`**:

```bash
ssh -J deploy@bastion.example.com deploy@10.0.1.15
```

This means *"connect to `10.0.1.15`, but route the connection **through**
`bastion.example.com`."* SSH connects to the bastion, then from there opens a
second SSH connection onward to the private host — automatically, in one step. The
private server (`10.0.1.15`) is an address only the **bastion** can reach; SSH
sorts out the relay for you.

Crucially, your **authentication is end-to-end**: your keys authenticate you to
*both* hops, but the tunnel to the final server is encrypted the whole way — the
bastion relays your connection without being able to see inside it.

### In the config file (the nice part)

Encode the whole topology once and never think about it again:

```text
Host bastion
    HostName bastion.example.com
    User deploy

Host app
    HostName 10.0.1.15
    User deploy
    ProxyJump bastion
```

Now simply:

```bash
ssh app        # transparently hops through the bastion
```

`scp` and port forwards honour this too — `scp file app:~/` relays through the
bastion automatically. This is the recommended approach for jump hosts. Chain
multiple hops with commas if you ever need to: `-J host1,host2`.

## The older way: agent forwarding (`-A`) — and its risk

Before `ProxyJump`, people reached a second server by SSHing into the first and
then running `ssh` *again from there*. But the bastion doesn't have your private
key (and it **shouldn't** — you never copy private keys onto servers). **Agent
forwarding** was the workaround: `-A` lets the remote machine use your **local**
agent to authenticate the onward hop, without the key ever being stored there.

```bash
ssh -A deploy@bastion.example.com
# now, from the bastion, your local keys can authenticate onward:
deploy@bastion:~$ ssh deploy@10.0.1.15
```

It works — but it has a real hazard:

> **While your agent is forwarded, anyone with root on that server can use your
> agent to authenticate as *you* — to any server your keys unlock — for as long as
> you're connected.** They can't steal the key itself, but they can *borrow* its
> power in the moment.

So forward your agent **only to hosts you fully trust**, never to shared or
sketchy machines.

## Prefer ProxyJump

For simply *reaching a server through a gateway*, **`ProxyJump` is both simpler and
safer** than agent forwarding: the intermediate host merely relays your encrypted
connection and never gets to touch your keys at all. Reach for `-A` only when you
genuinely need to *use your keys from* the remote machine (e.g. `git` operations on
the server using your identity) — and even then, consider narrower options first.

| | ProxyJump (`-J`) | Agent forwarding (`-A`) |
| --- | --- | --- |
| Purpose | **Reach** a host through a gateway | **Use your keys** from the remote host |
| Bastion touches your keys? | **No** — just relays | Can *borrow* them while connected |
| Safety | Preferred | Only for trusted hosts |
| Config option | `ProxyJump` | `ForwardAgent` |

## A safer middle ground

If you only need agent access on a specific trusted host, scope it in config rather
than passing `-A` everywhere:

```text
Host bastion
    HostName bastion.example.com
    User deploy
    ForwardAgent yes        # only this host, only because you trust it
```

That keeps forwarding **off by default** (the safe default) and **on** only where
you've deliberately allowed it — much better than habitually typing `-A`.

> **Key takeaways**
>
> - **Bastion/jump hosts** are gateways to servers with no public address — you hop
>   *through* them.
> - **`ssh -J gateway target`** (or **`ProxyJump`** in config) does the hop in one
>   step, relaying your encrypted connection **without exposing your keys**.
> - **Agent forwarding (`-A`)** lets a remote host *use* your local keys — powerful
>   but risky: root there can act as you. **Trusted hosts only.**
> - For reaching a server, **prefer ProxyJump**; reserve agent forwarding for when
>   you truly need your keys on the far end.
