#!/usr/bin/env node
/**
 * Download the Quarkus GraphQL SDL to graphql/schema.graphql.
 *
 * Usage:
 *   node scripts/fetch-graphql-schema.mjs
 *   YAADBUZZ_GRAPHQL_URL=http://127.0.0.1:8080 node scripts/fetch-graphql-schema.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const base = (process.env.YAADBUZZ_GRAPHQL_URL || 'http://127.0.0.1:8080').replace(/\/$/, '')
const url = `${base}/graphql/schema.graphql`
const out = join(root, 'graphql', 'schema.graphql')

const res = await fetch(url)
if (!res.ok) {
  console.error(`Failed to fetch schema from ${url}: HTTP ${res.status}`)
  console.error('Start Quarkus (./mvnw quarkus:dev) or set YAADBUZZ_GRAPHQL_URL.')
  process.exit(1)
}

const sdl = await res.text()
if (!sdl.includes('type Query') && !sdl.includes('type Mutation')) {
  console.error(`Response from ${url} does not look like a GraphQL schema.`)
  process.exit(1)
}

writeFileSync(out, sdl.endsWith('\n') ? sdl : `${sdl}\n`, 'utf8')
console.log(`Wrote ${out} (${sdl.length} bytes) from ${url}`)
