# AGENTS.md — Yaadbuzz agent context

Guidance for AI coding agents working in this repository. For human-oriented local setup, build, deploy, and tree details, see [`development/development.md`](development/development.md).

## What this project is

**Yaadbuzz** is an online yearbook app:

register → create organization → create **team** → invite members → tributes / memories / topics / characteristics → generate & download PDF.

Naming: use **Team** (not Department).

## Stack (locked)

| Layer | Choice |
|---|---|
| Backend | Quarkus **3.37.4**, Java **25**, Maven Wrapper (`./mvnw`) |
| Frontend | React 19 + TypeScript + Vite via **Quinoa** (`src/main/webui`) |
| App API | GraphQL (`/graphql`) |
| Binary/auth API | REST + OpenAPI (`/api/auth/*`, `/api/media`, `/api/yearbooks/{id}/download`) |
| DB | PostgreSQL + Flyway |
| Search | Elasticsearch 8 via Hibernate Search |
| Object storage | MinIO / S3-compatible |
| PDF | OpenHTMLToPDF + Qute template |
| Auth | Local email/password JWT now; keep boundaries OIDC-ready |

Frontend UI libs in use: Tailwind CSS v4, Motion, React Hook Form, Zod, Phosphor icons, Sonner, clsx, urql. Themes are user-selectable CSS-variable presets (`src/main/webui/src/theme/`).

## Domain model (high level)

Key entities under `src/main/java/com/yaadbuzz/domain/`:

User, Organization, Team, Invite, TeamMember, Tribute, Memory, Comment, Topic, TopicVote, Characteristic, YearbookExport, MediaAsset.

Important product rules:

- Tributes support anonymous / private / reveal modes.
- Yearbooks support two PDF paths: (1) online view at `/teams/:teamId/yearbook` + browser print, (2) async server PDF via `requestYearbookExport` + REST download. Both use `YearbookContentService` and team yearbook customization (`updateYearbookSettings`).
- Search is team-scoped and backed by Elasticsearch.

## Package map (backend)

```
com.yaadbuzz
├── auth/          # JWT login/register/refresh helpers
├── config/        # CDI config + seed
├── domain/        # JPA entities
├── enums/
├── graphql/       # GraphQL API + types
├── rest/          # Auth, media, yearbook download
├── service/       # Business logic / access control
├── search/        # Hibernate Search indexing/query
├── storage/       # S3/MinIO
├── pdf/           # Async PDF worker + rendering
└── common/        # Errors, cursors, shared utilities
```

Frontend lives in `src/main/webui/src/` (pages, components, theme, urql client).

## API surface

| Surface | Purpose |
|---|---|
| `POST /api/auth/*` | Register, login, refresh |
| `POST /api/media` | Image upload |
| `GET /api/yearbooks/{id}/download` | PDF download |
| `/graphql` | Yearbook domain operations |

Swagger: `/q/swagger-ui` · GraphQL UI: `/graphql-ui` (add `Authorization: Bearer <accessToken>` in GraphiQL Headers)

## Dev / test conventions agents must respect

1. **Do not invent a second frontend app root.** UI is Quinoa at `src/main/webui`.
2. **Profiles matter.** Datasource and ES hosts are `%dev` / `%prod` so `%test` can use Dev Services. Prefer that pattern over hardcoding hosts in the base profile.
3. **Tests:** Quinoa and seed data are disabled in `%test`. ES Dev Services image is pinned to **8.15.5**.
4. **Native builds:** Use `-Dnative` (Maven `native` profile). Prefer URL-connection S3 client; avoid Netty AWS client regressions. Do not remove native-image logging args without verifying a native build.
5. **Dockerfiles:**
   - Compose full build: `src/main/docker/Dockerfile.compose`
   - Quarkus `image-build` JVM: `Dockerfile.jvm`
   - Native image: `Dockerfile.native`
6. **Seed users** (dev only, password `password123`): `alice@yaadbuzz.local`, `bob@yaadbuzz.local`, `cara@yaadbuzz.local`, `dana@yaadbuzz.local`. Invite code: `welcome2026`. Seed covers every domain entity when the DB is empty (`SeedData`).
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
- GraphQL vs REST split (don’t move binary upload/download into GraphQL).
- Team naming and tribute privacy/reveal semantics.
