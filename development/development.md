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
| MinIO API | `9000` | S3-compatible media + PDF storage |
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
| http://localhost:8080/q/swagger-ui | REST / OpenAPI |
| http://localhost:8080/graphql-ui | GraphQL UI (Bearer JWT in Headers) |

### Typed GraphQL client (codegen)

After changing backend GraphQL APIs, regenerate TypeScript documents (requires Quarkus running for schema fetch):

```bash
./mvnw -Pgraphql-codegen generate-sources
# or from webui:
cd src/main/webui && npm run graphql:generate
```

- Schema snapshot: `src/main/webui/graphql/schema.graphql`
- Operations you edit: `src/main/webui/graphql/operations/*.graphql`
- Generated types/docs: `src/main/webui/src/api/generated/graphql.ts`
- App imports stay via `src/api/queries.ts`

Optional: `YAADBUZZ_GRAPHQL_URL=https://… ./mvnw -Pgraphql-codegen generate-sources`


Vite’s managed port is **3000** (`quarkus.quinoa.dev-server.port`). Prefer using **8080** so auth and GraphQL share one origin.

**Seed users** (dev seed enabled; password `password123`):

### Social login (Google / GitHub)

Buttons appear on Login/Register only when enabled. Create OAuth apps and set:

```bash
export YAADBUZZ_OAUTH_GOOGLE_ENABLED=true
export YAADBUZZ_OAUTH_GOOGLE_CLIENT_ID=...
export YAADBUZZ_OAUTH_GOOGLE_CLIENT_SECRET=...
export YAADBUZZ_OAUTH_GITHUB_ENABLED=true
export YAADBUZZ_OAUTH_GITHUB_CLIENT_ID=...
export YAADBUZZ_OAUTH_GITHUB_CLIENT_SECRET=...
export YAADBUZZ_PUBLIC_URL=http://localhost:8080   # must match browser origin
```

Authorized redirect URIs:

- Google: `http://localhost:8080/api/auth/oauth/google`
- GitHub: `http://localhost:8080/api/auth/oauth/github`

Flow: provider → app issues a one-time code → SPA `/oauth/callback` exchanges it for the same JWTs as email login.

- `alice@yaadbuzz.local` — org owner / team admin
- `bob@yaadbuzz.local`
- `cara@yaadbuzz.local`

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

Open http://127.0.0.1:3000. With `VITE_PROXY_API=1`, Vite proxies `/graphql`, `/api`, and `/q` to Quarkus on `:8080`.

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

Hit Swagger / GraphQL UI on 8080. Useful for API-focused work.

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
│   │   │   ├── graphql/      # GraphQL API + input/output types
│   │   │   ├── rest/         # Auth, media, yearbook download REST
│   │   │   ├── service/      # Domain services / access control
│   │   │   ├── search/       # Elasticsearch / Hibernate Search
│   │   │   ├── storage/      # S3/MinIO client
│   │   │   ├── pdf/          # Yearbook PDF generation worker
│   │   │   └── common/       # Shared errors, cursors, mappers
│   │   ├── resources/
│   │   │   ├── application.properties
│   │   │   ├── db/migration/           # Flyway SQL
│   │   │   ├── jwt/                    # Dev JWT key pair
│   │   │   ├── templates/yearbook/     # Qute HTML for PDF
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
│   │           ├── api/                # urql client + GraphQL documents
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
  ├─ SPA (Quinoa / Vite) ──REST──► /api/auth, /api/media, /api/yearbooks/*/download
  ├─ SPA /teams/:id/yearbook ──GraphQL yearbook──► online view → browser Print → PDF
  └─ SPA ──GraphQL──► /graphql ──► services ──► Postgres / ES / MinIO
                                    └─ scheduler/worker ──► server PDF in MinIO
```

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
