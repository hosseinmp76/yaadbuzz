type JsonSchema = {
  type: string
  properties?: Record<string, unknown>
  additionalProperties?: boolean
}

type WebMcpTool = {
  name: string
  description: string
  inputSchema: JsonSchema
  execute: (args: Record<string, unknown>) => Promise<unknown> | unknown
}

type ModelContext = {
  provideContext: (ctx: { tools: WebMcpTool[] }) => void
}

declare global {
  interface Navigator {
    modelContext?: ModelContext
  }
}

/** Register browser WebMCP tools for AI agents (when the browser supports it). */
export function registerWebMcpTools() {
  const ctx = navigator.modelContext
  if (!ctx?.provideContext) return

  ctx.provideContext({
    tools: [
      {
        name: 'yaadbuzz_site_info',
        description:
          'Returns what Yaadbuzz is, public URLs, license, and where agents find API/auth docs.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: () => ({
          name: 'Yaadbuzz',
          summary: 'Online yearbooks for teams — tributes, memories, awards, printable PDFs.',
          license: 'AGPL-3.0-only',
          urls: {
            home: '/',
            about: '/about',
            source: '/source',
            authMd: '/auth.md',
            apiCatalog: '/.well-known/api-catalog',
            openapi: '/q/openapi',
            health: '/q/health',
          },
        }),
      },
      {
        name: 'yaadbuzz_public_pages',
        description: 'Lists public marketing pages suitable for indexing (not private app routes).',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        execute: () => ({
          pages: ['/', '/about', '/source', '/login', '/register', '/LICENSE.txt'],
        }),
      },
    ],
  })
}
