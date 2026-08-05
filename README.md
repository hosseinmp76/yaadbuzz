# Yaadbuzz

**Site:** [https://yaadbuzz.ir](https://yaadbuzz.ir)

Collaborative online yearbooks for teams — free and open source (AGPL-3.0).

## What it is

Yaadbuzz is a place for a class, club, or company to **build a yearbook together**: invite teammates, write tributes, share memories with photos, vote on awards, then open a polished yearbook online and print it from the browser.

### The name

- **Yaad** (یاد) means *memory*.
- **Buzz** means someone who has a lot of something.
- Together: **someone rich in memories** — and a buzzing collaborative yearbook.

### Goals

- Keep shared memories in one collaborative workspace owned by the team
- Stay FOSS so schools and communities can self-host and inspect the code
- Prefer collaboration over single-author scrapbooks: every member contributes
- Ship an online yearbook first, with print via the browser when you are ready

## Features

- Email/password JWT auth, plus optional Google / GitHub OAuth and Telegram Login
- Teams and members via invite codes or email invites
- Tributes (anonymous / private / reveal mode)
- Shared memories with comments
- Topic awards and characteristic tags
- Optional **client-side team encryption** (AES-GCM; key never leaves the browser)
- Elasticsearch search
- Online yearbook view with browser print / Save as PDF
- Swagger UI for the REST API

### Optional team encryption

When enabled for the deployment (`app_config.team_encryption_enabled`), a team admin can turn on encryption while creating a team. An AES-256 key is generated **in the browser**, shown once to the admin, and stored only in that browser’s IndexedDB. Teammates paste the same key on their devices. Tribute, memory, and comment text (and their photos) are encrypted before upload; the server stores ciphertext and never receives the key. Without the shared key, encrypted content cannot be read.

Toggle for new teams (SQL):

```sql
UPDATE app_config SET team_encryption_enabled = true WHERE id = 1;
```

**Stack:** Quarkus, React (Quinoa), REST/OpenAPI, PostgreSQL, Elasticsearch, MinIO.

**License:** [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0)

## Quick start (dev)

Full local runbook: [`development/development.md`](development/development.md).  
Agent context: [`AGENTS.md`](AGENTS.md).

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
nvm use --lts
docker compose up -d postgres elasticsearch minio minio-init
./mvnw quarkus:dev
```

- App: http://localhost:8080
- Production site: https://yaadbuzz.ir
- Swagger: http://localhost:8080/q/swagger-ui
- OpenAPI TS client: `./mvnw -Popenapi-codegen generate-sources` (Quarkus running)

Seed users (password `password123`): `alice@yaadbuzz.local` (team admin), `bob@yaadbuzz.local`, `cara@yaadbuzz.local`, `dana@yaadbuzz.local`, `eve@yaadbuzz.local`.  
Invite code: `welcome2026`

## Docker Compose

```bash
docker compose up -d --build
# or: APP_IMAGE=youruser/yaadbuzz:latest APP_PULL_POLICY=always docker compose up -d
```

## Native image

```bash
./mvnw -DskipTests package -Dnative
./mvnw quarkus:image-build -Dnative
```

## Tests & lint

```bash
./mvnw test
cd src/main/webui && npm run lint
```

## API surface

| Surface | Purpose |
|---|---|
| `POST /api/auth/*` | Register, login, refresh, password reset |
| `GET /api/auth/oauth/{google\|github}` | Social login |
| `POST /api/media` | Image upload |
| `GET/POST /api/teams`, … | Team yearbook domain |

## Layout

```
src/main/java/com/yaadbuzz/   # backend
src/main/webui/               # React + Vite (Quinoa)
src/main/resources/db/migration
docker-compose.yml
```
