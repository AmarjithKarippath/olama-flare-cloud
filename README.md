# Olama

Upload videos, get a public URL, and share a player page. Only you can upload. Anyone with a link can watch.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose

## Configure

```bash
cp .env.example .env
```

Edit `.env` (do not commit it):

```bash
ADMIN_PASSWORD=pick-a-password
SESSION_SECRET=   # openssl rand -hex 32
APP_URL=http://localhost:3000
MAX_UPLOAD_MB=2048
```

| Variable | Notes |
| --- | --- |
| `ADMIN_PASSWORD` | Password used to sign in and upload |
| `SESSION_SECRET` | `openssl rand -hex 32` |
| `APP_URL` | Public origin with no trailing slash. Used in share links and Open Graph previews |
| `MAX_UPLOAD_MB` | Upload size limit |

Videos, posters, and SQLite live in `./data` (gitignored). Backup that folder.

## Run the app

```bash
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

Stop:

```bash
docker compose down
```

`./data` is kept on disk after `down`.

## Local development (without Docker)

```bash
npm install
npm run dev
```

The Next.js dev server runs at [http://localhost:3000](http://localhost:3000).

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
├── docker-compose.yml    # Next.js app on port 3000
├── Dockerfile
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
