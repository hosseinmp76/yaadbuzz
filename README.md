# Yaadbuzz

Online yearbook generator built with **Quarkus**, **React (Quinoa)**, **GraphQL**, **OpenAPI/Swagger**, **PostgreSQL**, **Elasticsearch**, and **MinIO**.

**License:** [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0)

## Features

- Email/password JWT auth (OIDC-ready boundaries)
- Organizations → Teams → members via invite codes
- Tributes about teammates (anonymous / private / reveal mode)
- Shared memories with comments
- Topic awards and characteristics tags
- Elasticsearch search
- Cursor-based infinite scroll
- Async PDF yearbook export + download
- Swagger UI for REST, GraphQL UI for app APIs

## Quick start (dev)

Full local runbook (together vs separate frontend/backend, build, deploy, tree): [`development/development.md`](development/development.md).  
Agent context: [`AGENTS.md`](AGENTS.md).

```bash
# Java via sdkman
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Node via nvm
nvm use --lts

# Infrastructure
docker compose up -d postgres elasticsearch minio minio-init

# App (Quarkus + Quinoa Vite HMR)
./mvnw quarkus:dev
```

Open:

- App: http://localhost:8080
- Swagger: http://localhost:8080/q/swagger-ui
- GraphQL UI: http://localhost:8080/graphql-ui — paste `{"Authorization":"Bearer <accessToken>"}` in Headers after login

Seed users (password `password123`):

- `alice@yaadbuzz.local` (org owner / team admin)
- `bob@yaadbuzz.local` (org admin)
- `cara@yaadbuzz.local`
- `dana@yaadbuzz.local`

Seed invite code for Class of 2026: `welcome2026`

## Full stack with Docker Compose

```bash
docker compose up --build
```

## Native image + Docker

Requires the `native` Maven profile (activated by `-Dnative`). Container native builds use Mandrel via Docker.

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
nvm use --lts

# 1) Build native binary (in a Mandrel container)
./mvnw -DskipTests package -Dnative

# 2) Package it as a Docker image (uses src/main/docker/Dockerfile.native)
./mvnw quarkus:image-build -Dnative
```

One-shot:

```bash
./mvnw -DskipTests package quarkus:image-build -Dnative
```

Image: `yaadbuzz/yaadbuzz:1.0.0-SNAPSHOT`  
Binary: `target/yaadbuzz-1.0.0-SNAPSHOT-runner`

## Tests

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
./mvnw test
```

Uses Quarkus Dev Services (Postgres + Elasticsearch 8). Quinoa and seed data are disabled in the `%test` profile.

## Frontend lint

```bash
cd src/main/webui
nvm use --lts
npm run lint
npm run lint:fix   # auto-fix where possible
```

## API split

| Surface | Purpose |
|---|---|
| `POST /api/auth/*` | Register, login, refresh |
| `POST /api/media` | Image upload |
| `GET /api/yearbooks/{id}/download` | PDF download |
| `/graphql` | All yearbook domain operations |

## Project layout

See the full tree in [`development/development.md`](development/development.md#project-file-structure).

```
src/main/java/com/yaadbuzz/   # backend
src/main/webui/               # React + Vite (Quinoa)
src/main/resources/db/migration
docker-compose.yml
development/development.md
AGENTS.md
```
