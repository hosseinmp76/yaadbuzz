# Yaadbuzz development guide

How to run, build, and deploy Yaadbuzz locally and in containers, plus a map of the repository layout.

Companion agent context: [`../AGENTS.md`](../AGENTS.md).

## Prerequisites

| Tool | Notes |
|---|---|
| Java **25** | Recommended via [sdkman](https://sdkman.io/) (GraalVM or Temurin) |
| Node.js **24.x LTS** | Via [nvm](https://github.com/nvm-sh/nvm); Quinoa can also install Node automatically |
| Docker + Compose | Postgres, Elasticsearch, MinIO; also used for full-stack and image builds |
| Maven Wrapper | Use `./mvnw` from the repo root (no global Maven required) |

Shell setup used in this project:

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
nvm use --lts
```

## Infrastructure (always needed for local app runs)

Start dependencies (not the app itself):

```bash
docker compose up -d postgres elasticsearch minio minio-init
```

| Service | Host port | Purpose |
|---|---|---|
| Postgres | `5432` | Primary DB (`yaadbuzz` / `yaadbuzz` / `yaadbuzz`) |
| Elasticsearch | `9200` | Hibernate Search (8.15.5) |
| MinIO API | `9000` | S3-compatible media storage |
| MinIO console | `9001` | Optional browser UI |

Stop infra:

```bash
docker compose stop postgres elasticsearch minio
```

---

## Run locally with auto-reload

### Option A — Backend + frontend together (recommended)

Quinoa starts the Vite dev server and Quarkus proxies the SPA. Live reload works for Java (Quarkus continuous testing/dev) and for React (Vite HMR).

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
nvm use --lts   # optional; Quinoa can install Node 24.18.0
docker compose up -d postgres elasticsearch minio minio-init
./mvnw quarkus:dev
```

Open:

| URL | What |
|---|---|
| http://localhost:8080 | App (UI + API) |
| http://localhost:8080/q/swagger-ui | REST / OpenAPI (Bearer JWT) |

Vite’s managed port is **3000** (`quarkus.quinoa.dev-server.port`). Prefer using **8080** so auth and `/api` share one origin.

Frontend domain calls use OpenAPI-generated types (`openapi-typescript` + `openapi-fetch`) under `src/main/webui/src/api/`.

After changing backend REST APIs (Quarkus must be running):

```bash
./mvnw -Popenapi-codegen generate-sources
# or:
cd src/main/webui && npm run openapi:generate
```

- Schema snapshot: `src/main/webui/openapi/openapi.yaml`
- Generated paths/schemas: `src/main/webui/src/api/generated/schema.d.ts`
- App wrappers: `client.ts`, `openapiClient.ts`, `types.ts`, `useApi.ts`

**Seed users** (dev seed enabled; password `password123`):

### Social login (Google / GitHub / Telegram)

Buttons appear on Login/Register only when enabled. Create OAuth apps / bot and set:

```bash
export YAADBUZZ_OAUTH_GOOGLE_ENABLED=true
export YAADBUZZ_OAUTH_GOOGLE_CLIENT_ID=...
export YAADBUZZ_OAUTH_GOOGLE_CLIENT_SECRET=...
export YAADBUZZ_OAUTH_GITHUB_ENABLED=true
export YAADBUZZ_OAUTH_GITHUB_CLIENT_ID=...
export YAADBUZZ_OAUTH_GITHUB_CLIENT_SECRET=...
export YAADBUZZ_OAUTH_TELEGRAM_ENABLED=true
export YAADBUZZ_OAUTH_TELEGRAM_CLIENT_ID=...      # BotFather → Bot Settings → Web Login → Client ID
export YAADBUZZ_OAUTH_TELEGRAM_CLIENT_SECRET=...  # Web Login Client Secret (not the bot token)
export YAADBUZZ_PUBLIC_URL=http://localhost:8080   # must match browser origin
```

Authorized redirect URIs (must match **exactly**, including `http` vs `https`):

- Local Google: `http://localhost:8080/api/auth/oauth/google`
- Local GitHub: `http://localhost:8080/api/auth/oauth/github`
- Local Telegram: `http://localhost:8080/api/auth/oauth/telegram`
- Prod Google: `https://yaadbuzz.ir/api/auth/oauth/google`
- Prod GitHub: `https://yaadbuzz.ir/api/auth/oauth/github`
- Prod Telegram: `https://yaadbuzz.ir/api/auth/oauth/telegram`

**Telegram OIDC:** In [@BotFather](https://t.me/BotFather) open **Bot Settings → Web Login**. Register allowed origin `https://yaadbuzz.ir` and redirect URI `https://yaadbuzz.ir/api/auth/oauth/telegram`. Use the shown **Client ID** and **Client Secret** (not the bot API token). Discovery: `https://oauth.telegram.org/.well-known/openid-configuration`.

Production forces HTTPS in the OIDC `redirect_uri` (`force-redirect-https-scheme`). Set `YAADBUZZ_PUBLIC_URL=https://yaadbuzz.ir` in `.env`.

Flow: provider → app issues a one-time code → SPA `/oauth/callback` exchanges it for the same JWTs as email login.

- `alice@yaadbuzz.local` — org owner / team admin
- `bob@yaadbuzz.local`
- `cara@yaadbuzz.local`
- `dana@yaadbuzz.local`
- `eve@yaadbuzz.local`

### Option B — Backend and frontend separately

Use this when you want Vite’s own UI on port 3000, or to iterate on frontend tooling without Quinoa managing the dev server.

**Terminal 1 — backend** (infra already up):

```bash
`source "$HOME/.sdkman/bin/sdkman-init.sh"
./mvnw quarkus:dev -Dquarkus.quinoa.dev-server.enabled=false`
```

Quarkus serves APIs on http://localhost:8080 with Java live reload. Disabling Quinoa’s managed Vite server frees port 3000 and avoids two competing frontends.

**Terminal 2 — frontend:**

```bash
nvm use --lts
cd src/main/webui
npm install          # first time / after lockfile changes
VITE_PROXY_API=1 npm run dev
```

Open http://127.0.0.1:3000. With `VITE_PROXY_API=1`, Vite proxies `/api` and `/q` to Quarkus on `:8080`.

Do **not** enable that proxy while Quinoa is also managing Vite (`./mvnw quarkus:dev` without disabling the Quinoa dev server) — it deadlocks SPA requests on `:8080`.

Useful frontend scripts:

```bash
npm run lint
npm run lint:fix
npm run build      # production assets → dist/ (also produced by Quarkus package via Quinoa)
```

### Option C — Backend only (no UI work)

```bash
./mvnw quarkus:dev -Dquarkus.quinoa.enabled=false
```

Hit Swagger UI on 8080. Useful for API-focused work.

---

## Build

### JVM package (default)

Builds backend + Quinoa production frontend into `target/quarkus-app/`.

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
nvm use --lts
./mvnw -DskipTests package
```

Runnable entry: `target/quarkus-app/quarkus-run.jar`.

### Tests

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
./mvnw test
```

`%test` uses Quarkus Dev Services for Postgres and Elasticsearch **8.15.5**. Quinoa and seed data are disabled in tests.

### Frontend-only production build

```bash
cd src/main/webui
nvm use --lts
npm run build
```

### Native binary

Requires Docker (Mandrel container build). Activates the Maven `native` profile via `-Dnative`.

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
./mvnw -DskipTests package -Dnative
```

Binary: `target/yaadbuzz-1.0.0-SNAPSHOT-runner`.

---

## Deploy

### Full stack with Docker Compose (simplest)

Starts Postgres, Elasticsearch, MinIO, nginx, and the app.

**Secrets (`.env`)** — Compose auto-loads a file named `.env` in the project root for `${VAR}` substitution (file is gitignored). Default generation targets **local dev** (`localhost` hostnames for Postgres, Elasticsearch, MinIO so `./mvnw quarkus:dev` works while dependencies run in Docker):

```bash
./development/gen-secrets.sh              # writes local-dev .env (use --force to overwrite)
./development/gen-secrets.sh --prod --force   # production URLs (https://yaadbuzz.ir)
# edit .env for OAuth, mail, etc.
docker compose up -d postgres elasticsearch minio minio-init
./mvnw quarkus:dev
```

Full stack deploy (compose **app** uses docker network hostnames hardcoded in `docker-compose.yml`; only passwords and public URL come from `.env`):

```bash
./development/gen-secrets.sh --prod --force
docker compose up -d --build
```

Explicit env file (optional; default is already `.env`):

```bash
docker compose --env-file .env up -d
```

**Build the app image locally** (default):

```bash
docker compose up -d --build
# or explicitly:
APP_PULL_POLICY=build docker compose up -d --build
```

**Use a pre-pushed Docker Hub image** (no local build):

```bash
export APP_IMAGE=youruser/yaadbuzz:latest   # image you pushed
export APP_PULL_POLICY=always               # pull from Hub
docker compose up -d
```

| Variable | Default | Meaning |
|---|---|---|
| `APP_IMAGE` | `yaadbuzz/yaadbuzz:local` | Image name/tag Compose runs (and tags builds as) |
| `APP_PULL_POLICY` | `missing` | `missing` = use local or pull if absent; `always` = always pull; `build` / use `--build` = build from Dockerfile |

App (via nginx): http://localhost or https if certs are present.

Tear down (keeps volumes unless `-v`):

```bash
docker compose down
```

### JVM container via Quarkus image-build

Uses `src/main/docker/Dockerfile.jvm` (not the compose multi-stage file):

```bash
./mvnw -DskipTests package
./mvnw quarkus:image-build
```

Image: `yaadbuzz/yaadbuzz:1.0.0-SNAPSHOT`

Run against existing infra (adjust env as needed):

```bash
docker run --rm -p 8080:8080 \
  -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://host.docker.internal:5432/yaadbuzz \
  -e QUARKUS_DATASOURCE_USERNAME=yaadbuzz \
  -e QUARKUS_DATASOURCE_PASSWORD=yaadbuzz \
  -e QUARKUS_HIBERNATE_SEARCH_ORM_ELASTICSEARCH_HOSTS=host.docker.internal:9200 \
  -e YAADBUZZ_S3_ENDPOINT=http://host.docker.internal:9000 \
  -e YAADBUZZ_S3_PUBLIC_ENDPOINT=http://localhost:9000 \
  -e YAADBUZZ_S3_ACCESS_KEY=yaadbuzz \
  -e YAADBUZZ_S3_SECRET_KEY=yaadbuzzsecret \
  -e YAADBUZZ_S3_BUCKET=yaadbuzz \
  yaadbuzz/yaadbuzz:1.0.0-SNAPSHOT
```

On Linux, replace `host.docker.internal` with the host gateway IP or attach the container to the Compose network.

### Native container

```bash
./mvnw -DskipTests package quarkus:image-build -Dnative
```

Uses `src/main/docker/Dockerfile.native`. Same image coordinates as JVM unless you retag.

### Push app image to Docker Hub

Local Quarkus image name is `yaadbuzz/yaadbuzz:1.0.0-SNAPSHOT` (`quarkus.container-image.*` in `application.properties`).

Set your Docker Hub user/org (defaults to `yaadbuzz` if that is your Hub namespace):

```bash
export DOCKERHUB_USER=yaadbuzz          # your Docker Hub username or org
export IMAGE_TAG=1.0.0-SNAPSHOT         # or a release tag, e.g. 1.0.0
```

**Option A — build, tag, push (Compose Dockerfile or Quarkus image):**

```bash
# JVM image via Quarkus
./mvnw -DskipTests package
./mvnw quarkus:image-build

docker login
docker tag "yaadbuzz/yaadbuzz:${IMAGE_TAG}" "${DOCKERHUB_USER}/yaadbuzz:${IMAGE_TAG}"
docker tag "yaadbuzz/yaadbuzz:${IMAGE_TAG}" "${DOCKERHUB_USER}/yaadbuzz:latest"
docker push "${DOCKERHUB_USER}/yaadbuzz:${IMAGE_TAG}"
docker push "${DOCKERHUB_USER}/yaadbuzz:latest"
```

**Option B — Quarkus builds and pushes in one step:**

```bash
docker login
./mvnw -DskipTests package quarkus:image-build \
  -Dquarkus.container-image.group="${DOCKERHUB_USER}" \
  -Dquarkus.container-image.tag="${IMAGE_TAG}" \
  -Dquarkus.container-image.registry=docker.io \
  -Dquarkus.container-image.push=true
```

**Option C — helper script** (from repo root):

```bash
export DOCKERHUB_USER=yaadbuzz
export IMAGE_TAG=1.0.0-SNAPSHOT
./development/push-dockerhub.sh
```

Pull on a server:

```bash
docker pull "${DOCKERHUB_USER}/yaadbuzz:${IMAGE_TAG}"
# or: docker pull "${DOCKERHUB_USER}/yaadbuzz:latest"
```

### Production environment variables

| Variable | Role |
|---|---|
| `QUARKUS_DATASOURCE_JDBC_URL` | Postgres JDBC URL |
| `QUARKUS_DATASOURCE_USERNAME` / `PASSWORD` | DB credentials |
| `QUARKUS_HIBERNATE_SEARCH_ORM_ELASTICSEARCH_HOSTS` | e.g. `elasticsearch:9200` |
| `YAADBUZZ_S3_ENDPOINT` | Internal S3/MinIO endpoint |
| `YAADBUZZ_S3_PUBLIC_ENDPOINT` | Browser-reachable media URL base |
| `YAADBUZZ_S3_ACCESS_KEY` / `SECRET_KEY` / `BUCKET` | Object storage |

Notes:

- Seed data is **off** in `%prod` (`yaadbuzz.seed.enabled=false`).
- Flyway runs on startup (`migrate-at-start=true`).
- Replace JWT keys under `src/main/resources/jwt/` for real deployments; do not ship the repo’s demo keys to production.

---

## Project file structure

```
yaadbuzz/
├── AGENTS.md                 # Context for AI agents
├── README.md                 # Short product + quick start
├── development/
│   └── development.md        # This guide
├── docker-compose.yml        # postgres, elasticsearch, minio, app
├── pom.xml                   # Quarkus Maven project
├── mvnw / mvnw.cmd           # Maven Wrapper
├── .dockerignore
├── src/
│   ├── main/
│   │   ├── java/com/yaadbuzz/
│   │   │   ├── auth/         # JWT auth support
│   │   │   ├── config/       # App config, seed
│   │   │   ├── domain/       # JPA entities
│   │   │   ├── enums/
│   │   │   ├── rest/         # Domain + auth/media REST + DTOs
│   │   │   ├── service/      # Domain services / access control
│   │   │   ├── search/       # Elasticsearch / Hibernate Search
│   │   │   ├── storage/      # S3/MinIO client
│   │   │   ├── yearbook/     # Assembled yearbook content for online/print view
│   │   │   └── common/       # Shared errors, cursors, mappers
│   │   ├── resources/
│   │   │   ├── application.properties
│   │   │   ├── db/migration/           # Flyway SQL
│   │   │   ├── jwt/                    # Dev JWT key pair
│   │   │   ├── templates/mail/         # Qute HTML for email
│   │   │   └── META-INF/native-image/  # Native-image hints
│   │   ├── docker/
│   │   │   ├── Dockerfile.compose      # Multi-stage for Compose
│   │   │   ├── Dockerfile.jvm          # Quarkus image-build (JVM)
│   │   │   ├── Dockerfile.native       # Quarkus image-build (native)
│   │   │   └── Dockerfile.*            # Other Quarkus-generated variants
│   │   └── webui/                      # React + Vite (Quinoa UI root)
│   │       ├── package.json
│   │       ├── vite.config.ts
│   │       ├── index.html
│   │       └── src/
│   │           ├── api/                # OpenAPI-typed REST client (openapi-fetch)
│   │           ├── components/         # Layout, ThemePicker, UI primitives
│   │           ├── theme/              # Theme presets + ThemeProvider
│   │           ├── pages/              # Route screens
│   │           ├── hooks/
│   │           ├── auth.tsx / authStorage.ts
│   │           ├── App.tsx / main.tsx
│   │           └── styles.css          # Tailwind v4 + theme tokens
│   └── test/java/com/yaadbuzz/         # QuarkusTest + unit tests
└── target/                             # Build output (gitignored)
```

### Request flow (mental model)

```text
Browser
  ├─ SPA (Quinoa / Vite) ──REST──► /api/* ──► services ──► Postgres / ES / MinIO
  └─ SPA /teams/:id/yearbook ──GET /api/teams/:id/yearbook──► online view → browser Print → PDF
```

---

## DNS-AID (agent discovery via DNS)

`yaadbuzz.ir` is on Cloudflare. Publish the DNS for AI Discovery entrypoint so scanners can find agent endpoints before an HTTP round-trip ([draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/), [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460)):

```dns
_index._agents.yaadbuzz.ir. 3600 IN HTTPS 1 yaadbuzz.ir. alpn="h3,h2" port=443
```

Do **not** publish `_mcp._agents` / `_a2a._agents` until those transports exist.

```bash
# Token: Zone → DNS → Edit on yaadbuzz.ir
CLOUDFLARE_API_TOKEN=... ./development/publish-dns-aid.sh

# Also enable DNSSEC (required for authenticated discovery). If the domain
# is not on Cloudflare Registrar, paste the printed DS record at the registrar.
CLOUDFLARE_API_TOKEN=... ENABLE_DNSSEC=1 ./development/publish-dns-aid.sh
```

Dashboard alternative: DNS → Add record → type **HTTPS**, name `_index._agents`, priority `1`, target `yaadbuzz.ir`, value `alpn="h3,h2" port=443`. Then DNS → Settings → Enable DNSSEC.

Verify: `dig +short HTTPS _index._agents.yaadbuzz.ir` and that `checks.discoverability.dnsAid` passes on [isitagentready.com](https://isitagentready.com/).

---

## Troubleshooting quick hits

| Symptom | Likely fix |
|---|---|
| Port 3000 in use | Stop other Vite/Quinoa processes; or use separate mode with only one owner of 3000 |
| `WebSocket is closed` / Quinoa HMR proxy errors | Expected race if Quinoa proxied HMR; app uses `%dev.quarkus.quinoa.dev-server.websocket=false` and Vite HMR on `127.0.0.1:3000` directly |
| ES / Hibernate Search version errors in tests | Keep Dev Services image at `8.15.5` |
| Compose app can’t reach MinIO from browser | Set `YAADBUZZ_S3_PUBLIC_ENDPOINT` to a host-reachable URL (`http://localhost:9000` in compose) |
| Native build / AWS Netty issues | Prefer URL-connection S3 client; see native-image args in `application.properties` |
| Frontend can’t call API | Use **http://localhost:8080** with Quinoa; do not enable Vite→Quarkus proxy while Quinoa is managing Vite |
