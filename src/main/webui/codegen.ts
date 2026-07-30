import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * Typed documents from Quarkus SDL + hand-written operations.
 * Schema: graphql/schema.graphql
 * Operations: graphql/operations/
 *
 * npm run graphql:generate
 * or: ./mvnw -Pgraphql-codegen generate-sources
 */
const config: CodegenConfig = {
  schema: 'graphql/schema.graphql',
  documents: ['graphql/operations/**/*.graphql'],
  ignoreNoDocuments: false,
  generates: {
    'src/api/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        maybeValue: 'T',
        inputMaybeValue: 'T | null | undefined',
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
          defaultValue: false,
        },
        enumsAsTypes: true,
        skipTypename: true,
        useTypeImports: true,
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
}

export default config
