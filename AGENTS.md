# AGENTS.md — Yaadbuzz agent context

Guidance for AI coding agents working in this repository. For human-oriented local setup, build, deploy, and tree details, see [`development/development.md`](development/development.md).

## What this project is

**Yaadbuzz** is an online yearbook app:

register → create **team** → invite members → tributes / memories / topics / characteristics → view & print yearbook.

Naming: use **Team** (not Department).

## Stack (locked)

| Layer | Choice |
|---|---|
| Backend | Quarkus **3.37.4**, Java **25**, Maven Wrapper (`./mvnw`) |
| Frontend | React 19 + TypeScript + Vite via **Quinoa** (`src/main/webui`) |
| App API | REST + OpenAPI (`/api/*`) |
| Binary endpoints | Multipart media upload under `/api` |
| Frontend API types | Generated from OpenAPI via `openapi-typescript` + `openapi-fetch` |
| DB | PostgreSQL + Flyway |
| Search | Elasticsearch 8 via Hibernate Search |
| Object storage | MinIO / S3-compatible |
| Auth | Local email/password JWT + optional Google/GitHub OAuth (OIDC); keep boundaries OIDC-ready |
| Optional encryption | Client-side AES-GCM per team; offered for new teams when `app_config.team_encryption_enabled` is true (key never leaves the browser) |

Frontend UI libs in use: Tailwind CSS v4, Motion, React Hook Form, Zod, Phosphor icons, Sonner, clsx. Themes are user-selectable CSS-variable presets (`src/main/webui/src/theme/`).

## Domain model (high level)

Key entities under `src/main/java/com/yaadbuzz/domain/`:

User, Team, Invite, TeamMember, Tribute, Memory, Comment, Topic, TopicVote, Characteristic, MediaAsset, AppConfig.

Important product rules:

- Tributes support anonymous / private / reveal modes.
- Yearbooks: online view at `/teams/:teamId/yearbook` + browser print (`YearbookContentService` + team customization via `updateYearbookSettings`).
- Search is team-scoped and backed by Elasticsearch.

## Package map (backend)

```
com.yaadbuzz
├── auth/          # JWT login/register/refresh helpers
├── config/        # CDI config + seed
├── domain/        # JPA entities
├── enums/
├── rest/          # Domain + auth/media REST + DTOs
├── service/       # Business logic / access control
├── search/        # Hibernate Search indexing/query
├── storage/       # S3/MinIO
├── yearbook/      # Assembled yearbook content for online/print view
└── common/        # Errors, cursors, shared utilities
```

Frontend lives in `src/main/webui/src/` (pages, components, theme, OpenAPI-typed client under `api/`).

## API surface

| Surface | Purpose |
|---|---|
| `POST /api/auth/*` | Register (email → set-password link), login, refresh, forgot/reset password |
| `GET/PATCH /api/me` | Current user |
| `/api/teams`, `/api/members`, … | Yearbook domain CRUD/read |
| `POST /api/media` | Image upload |

Swagger: `/q/swagger-ui` (Bearer JWT).

After REST API changes: regenerate TS types (Quarkus must be up):

```bash
./mvnw -Popenapi-codegen generate-sources
# or: cd src/main/webui && npm run openapi:generate
```

Writes `src/main/webui/openapi/openapi.yaml` and `src/main/webui/src/api/generated/schema.d.ts`.

## Dev / test conventions agents must respect

1. **Do not invent a second frontend app root.** UI is Quinoa at `src/main/webui`.
2. **Profiles matter.** Datasource and ES hosts are `%dev` / `%prod` so `%test` can use Dev Services. Prefer that pattern over hardcoding hosts in the base profile.
3. **Tests:** Quinoa and seed data are disabled in `%test`. ES Dev Services image is pinned to **8.15.5**.
4. **Native builds:** Use `-Dnative` (Maven `native` profile). Prefer URL-connection S3 client; avoid Netty AWS client regressions. Do not remove native-image logging args without verifying a native build.
5. **Dockerfiles:**
   - Compose full build: `src/main/docker/Dockerfile.compose`
   - Quarkus `image-build` JVM: `Dockerfile.jvm`
   - Native image: `Dockerfile.native`
6. **Seed users** (dev only):
   - Demo (`password123`): `alice@yaadbuzz.local`, `bob@yaadbuzz.local`, `cara@yaadbuzz.local`, `dana@yaadbuzz.local`, `eve@yaadbuzz.local`. Invite code: `welcome2026`. Seed builds a 5-member team with cross-tributes, memories (with images), characteristics, topics/votes when the DB is empty (`SeedData`).
   - Manual QA (`12341234`): `a@test.com`, `b@test.com`, `c@test.com`.
7. **Frontend design:** Keep brand-forward UI; themes use CSS variables. Avoid generic purple-on-white / Inter-default looks unless matching an existing screen.
8. **Commits / PRs:** Only when the user asks. Follow repo git/PR user rules.

## Preferred local commands

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
nvm use --lts
docker compose up -d postgres elasticsearch minio minio-init
./mvnw quarkus:dev          # backend + Quinoa Vite HMR on :8080
./mvnw test
cd src/main/webui && npm run lint
```

Separate frontend (Vite on :3000) requires Quarkus with Quinoa’s managed dev server disabled — see `development/development.md`.

## What not to break casually

- Flyway migrations under `src/main/resources/db/migration` (append new versions; don’t rewrite applied ones).
- JWT key locations (`src/main/resources/jwt/`).
- Keep binary upload/download on multipart/stream REST (not JSON domain payloads).
- Team naming and tribute privacy/reveal semantics.
