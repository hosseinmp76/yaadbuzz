#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'openapi')
const outFile = path.join(outDir, 'openapi.yaml')
const base = (process.env.YAADBUZZ_OPENAPI_URL || 'http://127.0.0.1:8080').replace(/\/$/, '')
const url = `${base}/q/openapi`

const res = await fetch(url)
if (!res.ok) {
  console.error(`Failed to fetch OpenAPI from ${url}: ${res.status} ${res.statusText}`)
  console.error('Start Quarkus (`./mvnw quarkus:dev`) and retry.')
  process.exit(1)
}

const text = await res.text()
await mkdir(outDir, { recursive: true })
await writeFile(outFile, text)
console.log(`Wrote ${outFile} (${text.length} bytes) from ${url}`)
