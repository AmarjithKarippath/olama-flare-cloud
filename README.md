# Olama

Upload videos, get a public URL, and share a player page. Only you can upload. Anyone with a link can watch.

The app runs in Docker Compose behind an nginx reverse proxy. Public HTTPS is provided by a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) run separately (no public IP or Let’s Encrypt required). Same pattern as the [boiler-plate](https://github.com/AmarjithKarippath/boiler-plate).

## Requirements

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose
- A free [Cloudflare](https://dash.cloudflare.com) account
- Domain `olama.so` using Cloudflare nameservers

## Configure

```bash
cp .env.example .env
```

Edit `.env` (do not commit it):

```bash
ADMIN_PASSWORD=pick-a-password
SESSION_SECRET=   # openssl rand -hex 32
APP_URL=http://localhost
MAX_UPLOAD_MB=2048
```

| Variable | Local | Production |
| --- | --- | --- |
| `ADMIN_PASSWORD` | anything you will remember | a strong password |
| `SESSION_SECRET` | `openssl rand -hex 32` | a different random value |
| `APP_URL` | `http://localhost` | `https://olama.so` (no trailing slash) |
| `MAX_UPLOAD_MB` | `2048` | same, or lower |

`APP_URL` is baked into share links and Open Graph previews. Videos, posters, and SQLite live in `./data` (gitignored). Backup that folder.

## Run the app

```bash
docker compose up -d --build
```

Open [http://localhost](http://localhost). nginx listens on port **80** and proxies to the Next.js app.

Stop:

```bash
docker compose down
```

`./data` is kept on disk after `down`.

## Cloudflare Tunnel (https://olama.so)

1. Add `olama.so` to Cloudflare and point Namecheap nameservers at the two Cloudflare NS records. Wait until the zone is **Active**.

2. Zero Trust → Networks → Tunnels → Create a **Cloudflared** tunnel. Copy the token.

3. In the tunnel, add Public Hostnames. Because `cloudflared` runs **outside** this Compose file, the origin is the host, not the `nginx` service name:

| Subdomain | Domain | Type | URL |
| --- | --- | --- | --- |
| *(empty)* | olama.so | HTTP | `http://127.0.0.1:80` |
| www | olama.so | HTTP | `http://127.0.0.1:80` |

4. SSL/TLS → Overview → **Full**. Optional: Edge Certificates → Always Use HTTPS.

5. Set `APP_URL=https://olama.so` in `.env`, start the app with Compose, then start the tunnel on the host (`--network host` so `127.0.0.1:80` is nginx on this machine):

```bash
docker compose up -d --build

sudo docker run -d --name cloudflared --restart unless-stopped --network host \
  cloudflare/cloudflared:latest tunnel --no-autoupdate run --token YOUR_TOKEN
```

Connector logs (`docker logs -f cloudflared`) should show the tunnel is connected. Then open [https://olama.so](https://olama.so).

Do not commit the tunnel token. Do not point DNS at a Tailscale or CGNAT address.

## Backup and updates

```bash
tar -czf olama-data-$(date +%F).tar.gz data
git pull
docker compose up -d --build
```

## Useful commands

```bash
docker compose ps
docker compose logs -f
docker compose restart
docker compose down
```

## Project layout

```
├── docker-compose.yml    # web + nginx
├── Dockerfile            # Next.js app
├── nginx/
│   └── nginx.conf        # reverse proxy to web:3000
└── data/                 # sqlite + videos (gitignored)
```

## API (for a later Mac recorder)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | none | JSON `{ "password": "..." }` → session cookie |
| `POST` | `/api/upload` | cookie or `Authorization: Bearer <ADMIN_PASSWORD>` | multipart field `file`, optional `title` |
| `DELETE` | `/api/videos/:id` | same | deletes row + files |
| `GET` | `/v/:id` | public | player page |
| `GET` | `/v/:id/file` | public | MP4 with Range support |
| `GET` | `/v/:id/poster` | public | JPEG (or SVG placeholder) |

Upload response: `{ "id", "url", "title" }`.
